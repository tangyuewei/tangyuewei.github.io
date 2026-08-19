---
title: "从 Cordis 到 dsh：一切皆插件是怎么落到代码的"
author: 唐悦玮
date: 2026-08-19 09:30:00 +0800
categories: [技术实战, AI 工程化]
tags: [DeepSeek Harness, Cordis, 插件架构, 源码解析, AI Agent]
pin: false
comments: true
keyword: Cordis, DeepSeek Harness, 插件架构, 一切皆插件, dsh 源码, 插件框架, pnpm 踩坑
---

> **摘要**：DeepSeek Harness 喊出"一切皆插件"，它不是营销口号，而是靠底层 Cordis 框架撑起来的架构事实。本文从源码拆解 Cordis 的五个核心机制：插件、上下文、依赖注入、类型化事件、可逆副作用，并记录源码安装的三个真实踩坑。

---

上周 DeepSeek Harness（下称 dsh）开源，口号六个字：一切皆插件。

开源不到一周，GitHub 上 152k star了！但热度之下有个尴尬的现实：多数人只记住了这句口号，说不清它到底怎么实现。你问"一切皆插件，那插件之间怎么协作"，得到的回答往往是含糊的"就是模块化呗"。

看过源码的开发者都承认，这句话不是营销。模型适配器、工具注册表、会话日志、Agent Loop——连循环本身都是插件，没有特权核心。想换什么就换对应插件，不用 fork 源码。

但"一切皆插件"到底怎么落到每一行代码上？答案在它的地基里：一个叫 Cordis 的插件框架。这篇文章拆的就是它——五个核心机制，加源码安装的三个真实踩坑。

## Cordis 是什么

dsh 没有自己造轮子。它的底层直接 vendor 了一个插件框架，版本 `@deepseek-ai/cordis@4.0.1`（来源：dsh 仓库 vendor/cordis/package.json）。Cordis 的理论背景是一篇论文《A Programming Paradigm for Spatiotemporal Composability》，讲时空可组合性——但对开发者来说，只需要记住它做了什么：**负责插件的加载、卸载、依赖关系解析，其他一概不管**。

为什么这个选择关键？因为 Cordis 足够小、足够纯粹。它只解决"插件怎么组织"这一个问题，具体插件干什么它不关心。dsh 的 40+ 能力包（shell、fs、web、subagent……）全部是建在这个地基上的。

## 五个核心概念

Cordis 的全部设计，可以压缩成五个概念：

**插件**：被加载的代码单位。可以是一个带 `apply(ctx, config)` 的函数，也可以是一个继承 Service 的类。插件有生命周期——挂载时实例化，卸载时回收它登记的一切。

**上下文**：服务的容器。一个服务占据一个稳定的 `ctx.xxx` 键（比如 `ctx.tools`、`ctx.llm`）。其他插件通过键查找服务，而不是 import 具体实现。

**依赖注入**：插件用 `inject` 声明它需要哪些服务，声明之后会等这些服务就绪才启动。加载顺序由依赖表达，而不是手动编排启动序列。

**类型化事件**：插件之间用事件通信。事件以 emit、waterfall、parallel、serial 四种方式分发，分别对应监听者观察、包装、并行扇出、按序执行。

**可逆副作用**：插件注册的服务、监听的事件、创建的资源全部可逆。插件卸载时一切自动回滚。这是运行时热插拔的前提——换插件不用重启。

代码写出来就直观了。一个最小插件：

```ts
import type { Context } from "@deepseek-ai/cordis";

export const name = "tool-plugin";
export const inject = ["tools"];

export function apply(ctx: Context) {
  ctx.tools.register(/* 工具定义 */);
}
```

`inject: ["tools"]` 声明了这个插件需要 tools 服务，Cordis 会等 tools 就绪才调用 apply。注册通过 `ctx.effect()` 完成，卸载时自动撤销。

## 一次启动：五行代码引出全部机制

dsh 启动时跑 `boot()`，核心就五行（来源：dsh 源码 packages/boot/app-boot/src/index.ts）：

```ts
const ctx = new Context();                 // 创建插件树根
ctx.provide('dshHomePath', dshHomePath);   // 注册第一个服务
await ctx.plugin(Loader);                  // 挂载配置加载插件
await mountRootInclude(ctx, configPath);   // 展开配置成插件树
await assertEntriesActivated(ctx, binName);// 审计：谁没激活就报错
```

五行代码对应五个机制：

1. `new Context()` 创建插件树的根。Context 既是服务仓库，也是树节点——每个插件挂载后有自己子 context，父卸载时子树跟着卸载
2. `ctx.provide()` 注册第一个服务。把值挂到 ctx 上，全局可读
3. `ctx.plugin(Loader)` 程序化挂载插件。Loader 负责读 YAML 配置
4. `mountRootInclude()` 把 cordis.yml 交给 Loader，声明式展开成整棵插件树

第四行最值得展开。它说明插件的组织不是写死在代码里的，而是声明在 YAML 配置里。一份简化版 cordis.yml 长这样：

```yaml
plugins:
  - id: llm
    entry: "@deepseek-ai/dsh-llm"
  - id: tools
    entry: "@deepseek-ai/dsh-tools"
  - id: shell
    entry: "@deepseek-ai/dsh-bash-sandbox"  # 想换实现，改这一行
```

你改哪个插件、换哪个实现、开哪个能力，都在配置层决定，不用碰源码。这也是"一切皆插件"能在产品层成立的原因——插件树是配置叠出来的，不是代码写死的。

5. `assertEntriesActivated()` 做审计：哪个条目最终没激活（比如依赖永远不存在），在这里点名报错，不会带着半棵没加载完的树跑起来

注意一个细节：**挂载和启动是两个分离的动作**。`ctx.plugin(X)` 只负责建 fiber（插件的一次挂载产生的运行时对象）并挂到树上，同步、立即、不执行插件代码；要等 inject 依赖齐了，fiber 才跑 `execute`。这个分离是 Cordis 能正确编排复杂依赖的根基。

## 三个关键机制

**服务：提供方和消费方只认名字**

服务是一个插件通过名字共享给全系统的对象。提供方用 `provide` 把对象和一个服务名（`'web'`、`'shell'`、`'llm'`）关联，消费方用同一个名字 `ctx.web` 读出对象。双方唯一的约定是服务名——web-search-exa 声明需要 web，它不知道也不关心对象由哪个插件提供。

**inject 重载：换实现，依赖方自动重跑**

更妙的是"等到就位"不是一次性的。运行中如果把 shell 的实现插件从 bash-local 换成 pwsh，Cordis 会重载所有声明需要 shell 的插件，让它们在新插件树上重新执行 apply。

为什么是重载而不是把新对象悄悄递给正在跑的插件？因为插件的 apply 已经执行过了，旧实现可能被捕获进事件监听、定时器的闭包里。只换对象，插件手里握的还是旧引用。撤销它的全部 effect、在新实现上重跑 apply，是让插件整体落到新实现上的唯一一致方式。

**可逆副作用：热插拔的前提**

重载为什么能随时做？靠的是 effect 全部可逆——不存在一半成功一半失败的中间态。`ctx.effect()` 注册的撤销函数按注册顺序逆序压栈执行，跟 React 的 useEffect cleanup 一个思路，但做成了框架级保证。插件初始化中途抛错，已应用的一半效应逆序清掉，不残留部分状态。

**三段式分包：一个能力三个包**

一个能力被拆成三个包：契约包（Definition）定义服务本身，实现包（Provider）提供实现，消费方包（Consumer）使用能力。拿 shell 举例：`dsh-shell` 定义 ShellExecutor 抽象类，`dsh-bash-sandbox` 实现它，`dsh-tool-bash` 把它包装成模型可见的 bash 工具。

实现包和消费方包互相完全不引用，两边只认识契约包和服务名。换实现时消费方一行也不用动——高频的 provider 变动停在注册表层，不惊动依赖这条服务的插件。

## 源码安装的三个坑

架构讲完，说点实际的。dsh 目前是 Developer Preview（0.1.0-rc 系列），官方明示破坏性变更随时可能发生。源码安装会踩到几个坑，其中两个跟环境版本强相关。

**坑 1：git 版本要 >= 2.26**

dsh 仓库的构建流程对 git 有硬性版本要求。低于 2.26 会在依赖安装阶段直接失败。解法：先 `git --version` 确认，老版本用包管理器升级。macOS 上注意系统自带 git 可能是老版本，建议装最新版或通过 Homebrew 管理。

**坑 2：pnpm 必须用 11.7.0，高了就报错**

这是最折腾的一个。dsh 的 pnpm-lock.yaml 把 pnpm 原生二进制 `@pnpm/exe` 钉在了 11.7.0。如果你的 pnpm 版本高于 11.7.0，安装时直接报：

```
[ERROR] Cannot verify the identity of the @pnpm/exe.darwin-x64 native binary:
it is missing from pnpm-lock.yaml. For help, run: pnpm help install.
```

**根因**：pnpm 的 env 安装器会对原生二进制做完整性校验——它在 lockfile 里找 `@pnpm/exe` 的 integrity 记录来验证下载的二进制没被篡改。但 lockfile 里 pin 的是 11.7.0 的记录，你本地 pnpm 版本更高时，它要下载对应版本的 `@pnpm/exe`，却在 lockfile 里找不到这条记录，校验无从谈起，直接报错。这是"lockfile 钉死版本"与"本地环境版本漂移"的经典冲突。

**解法**：把 pnpm 切回 11.7.0。用 Corepack 最干净：

```bash
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm --version  # 确认 11.7.0
```

**坑 3：Node 大版本别追新**

dsh 依赖链里有包声明了 node 版本门槛（实测 node >= 20/22）。追最新大版本可能触发依赖的兼容性问题——比如某个包用了新版本才移除的 API，装的时候不报，跑的时候才炸。解法：先 `cat package.json | grep engines` 看官方声明，选一个满足范围但不最新的 LTS 版本。用 nvm 切：

```bash
nvm install 22
nvm use 22
```

## 我的判断

回头看，dsh 选择 Cordis 是笔划算的账：**框架把复杂度吃进肚子，用户才能把自由度握在手里**。

"一切皆插件"的代价是理解门槛——五个核心机制、三段式分包、fiber 状态机，这套抽象对普通开发者不友好。但收益是真实的：换模型适配器、换沙箱 Provider、甚至换 Agent Loop，都变成"改配置"级别的事。对想自建 Agent 基础设施的团队，Cordis 这套"服务 + 依赖 + 可逆副作用"的组合，是比 LangGraph 更底层的参考样本。想深入研究的，官方仓库在 [github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，vendor/cordis/ 目录就是完整的 Cordis 源码。

至于安装坑，说到底都是版本问题：一个精确到 11.7.0 的 lockfile，把"用最新版"的习惯挡在了门外。0.1 的版本号配得上这份折腾——它适合尝鲜和架构学习，不适合指望它马上稳定。
