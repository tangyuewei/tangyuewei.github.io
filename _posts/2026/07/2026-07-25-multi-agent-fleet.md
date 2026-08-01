---
title: "单 Agent 不够用了：AI 编程进入舰队模式"
author: 唐悦玮
date: 2026-07-25 14:30:00 +0800
categories: [AI编程, 工程实践]
tags: [多Agent, 子Agent, AI编程, Claude Code, Cursor, Git Worktree]
pin: false
comments: true
keyword: 多Agent, 子Agent, 舰队模式, AI编程, 任务拆分, Git Worktree, 并行Agent
---

> **摘要**：2026 年，不少 AI 编程工具开始从"一个 Agent 帮你写代码"走向"多个 Agent 像一支工程团队一样协同工作"。Cursor SDK 支持子 Agent 嵌套，Claude Code sub-agents 可以 5 层深度，Meta Muse Spark 1.1 原生多 Agent 编排。这篇文章不讲概念，只谈落地：怎么拆任务、怎么隔离上下文、怎么合并结果。附带 Java 后端实战场景和决策框架。

给企业后台系统做认证升级，从 JWT 切到 OAuth2。涉及三个模块：auth、user、gateway。

我把需求丢给一个 Agent，"帮我全部改完"。它吭哧吭哧干了二十分钟，看起来都改好了。跑起来才发现——它在 gateway 里加了个多余的拦截器，把 OAuth2 token 解析了两次；user 模块的 token 校验逻辑根本没改，还留着老 JWT 的代码。我修了几个小时。

这问题不在于模型够不够聪明。在于一个大脑同时管三个模块、六七个文件、还要盯测试和部署——注意力撑不住。

## 为什么单 Agent 在复杂任务上吃力

2026 年上半年的数据可以参考。SWE-bench Pro——那是需要跨 4 个以上文件、平均改动 107 行的真实任务——目前最强模型得分不到 25%。说明单 Agent 在多文件复杂任务上仍有明显瓶颈。

但这种瓶颈的本质，不是"上下文窗口塞不下"。当前 Claude、GPT、Gemini 的上下文窗口已达 200K 甚至百万 token 级别，代码库本身是放得下的。真实问题是注意力稀释（attention dilution）——模型在长上下文中，后面的内容"看到了，但没真正用上"。它不知道什么时候该看哪个文件，所以就自己猜。

一个 Agent 同时管代码生成、审查、测试、部署验证，注意力迟早被稀释干净。你让它修一个 bug，修到一半它开始改无关文件。你让它重构一个模块，弄到后面连最开始的需求都忘了。

还有效率问题。auth 模块和 billing 模块是两个人可以并行干的活，单 Agent 只能串行，费的是时间。

所以今年以来，不少主流工具开始探索多 Agent 工作流：拆成多个 Agent。

Cursor 在 v2.4（1 月 22 日）引入子 Agent 嵌套——定义一个主 Agent 负责调度，子 Agent 分别负责代码生成、审查、测试，各自独立上下文窗口。Claude Code 在 3 月推出 sub-agents，5 月实现 Dynamic Workflows——一段 JavaScript 编排几百个子 Agent 并行跑，6 月支持 5 层嵌套。Codex CLI 搞了 controller pairing，多个 Agent 实例通过 controller 通信，谁改了哪个文件、谁跑了什么测试，全部透明。

一个值得关注的变化：随着任务复杂度提升，工作流设计的重要性正在超过单次 Prompt 优化——你怎么组织 Agent 的协作方式，比你怎么跟一个 Agent 说话，越来越关键。

## 三问：怎么拆、怎么隔离、怎么合

多 Agent 不是"多开几个窗口，各干各的"。它需要三个问题的工程解。

### 第一问：怎么拆任务

拆不好，五个 Agent 比一个更快地把你代码库搞乱。

核心原则是按模块边界切，不按文件名切。给你看一个对比：

❌ 拆法 1——"Agent A 改 auth 模块的文件，Agent B 改 auth 模块的测试"——两个 Agent 会同时碰 `AuthService.java`，因为改实现和改测试都会动核心类，必冲突。

✅ 拆法 2——"Agent A 负责 src/auth/ 全部，Agent B 负责 src/gateway/ 全部，Agent C 负责 src/user/ 全部"——三个模块，零交叉。

任务描述也得精确到边界。一个好的 orchestrator 提示词长这样：

```
End goal：将认证从 JWT 切到 OAuth2
子任务 1：改 src/auth/ — 新增 OAuth2TokenResolver，废弃 JwtUtils
　　　输入：现有 JwtUtils.java、application.yml
　　　输出：OAuth2TokenResolver.java + 单元测试
　　　禁止触碰：src/gateway/、src/user/
　　　成功标准：单元测试全绿，令牌解析延迟 < 50ms
```

拆完后必须做交叉检查：打开三个子任务的文件列表，看看有没有共享的热点文件（路由表、配置文件、公共注册器）。有重叠就重新划边界。

反面教材：让两个 Agent 同时改 `application.yml` 里相邻的配置项——你收获的不是并行效率，是一份需要手工消解的合并冲突。

但注意：不是所有任务都适合这样拆。如果是改公共框架、重构基础库、DDD 领域模型改造——这些高耦合场景，拆了也不会变快。merge 冲突、review 带宽膨胀、子 Agent 之间的信息不对称，综合下来可能比单 Agent 更慢。多 Agent 更适合低耦合、独立模块、改动模式重复的任务。

### 第二问：怎么隔离上下文

文件冲突靠 Git 解决，上下文冲突必须在 Agent 启动前解决。

答案是 Git Worktree——Git 的原生能力，允许同一个仓库同时 checkout 出多个工作目录，各有一个独立分支，但共享同一个 `.git` 对象库。不需要 clone 五遍代码。

```bash
git worktree add ../project-auth  -b agent/auth-oauth2  origin/main
git worktree add ../project-gateway -b agent/gateway-oauth2 origin/main
git worktree add ../project-user  -b agent/user-oauth2  origin/main
```

然后每个 Agent 在自己的 worktree 目录里启动：

```bash
cd ../project-auth  && claude   # Agent A 只改 auth
cd ../project-gateway && claude   # Agent B 只改 gateway
cd ../project-user  && claude   # Agent C 只改 user
```

Cursor 做这件事更简洁——子 Agent 设计上就是独立上下文窗口，中间输出（搜索过程、Shell 日志）留在子 Agent 内部，只回传摘要给主 Agent。Claude Code 的 `isolation: worktree` 参数同理，还会在 Agent 崩溃后通过 supervisor 进程自动恢复。

但上下文隔离有代价。根据 Anthropic 官方文档和开发者社区实测，在不同的模型组合和任务复杂度下，3 个 background session 的 token 消耗约为单线程的 2-4 倍，含编排逻辑的复杂工作流可达 5-7 倍。这个数字不是固定公式——你用的模型、任务耦合度、工具调用密度都会影响最终账单。一条可参考的节流策略是模型混用：轻量模型做 Reviewer（上下文高、输出少、便宜），标准模型做 Implementer，只在 Orchestrator 上用量级模型（需要广域判断）。

多说一句：这里实际上有三个不同层级的东西——Git Worktree 是文件系统层的物理隔离（基础设施层），多 Agent 是执行层的逻辑隔离（工作流层），Harness 是规则层的约束（治理层）。三者常常一起出现，但不是一个概念。Worktree 是多 Agent 的一种隔离手段，不是所有多 Agent 都需要 Worktree；反过来，你可以在单 Agent 下用 Worktree 做干净分支切换，和多 Agent 没关系。分清了再落地，不会乱。

### 第三问：怎么合并结果

五个 Agent 跑完产出五个分支，这时候最容易翻车——不是 Agent 写错了，是你合错了。

合并只有一条纪律：diff first，merge second，一次只合一个。

操作顺序不能乱：

```bash
# 每个 Agent 分支合入前
git diff main..agent/auth-oauth2     # 1. 先看改了什么
# 检查：有没有越界改文件？有没有顺手删了别人的配置？
git checkout agent/auth-oauth2
git rebase origin/main               # 2. rebase 到最新 main
# 跑测试
git checkout main
git merge agent/auth-oauth2           # 3. 确认无误后再合
git worktree remove ../project-auth   # 4. 清理 worktree
```

一次只合一个分支。并行 merge 多个 Agent 分支会制造复合冲突，消解成本远超单独 merge 三次的和。

审查的时候目光锐一点。CI 全绿不代表没问题。真实翻车案例：一个 Agent 实现了 sha256 校验功能，验证逻辑只检查了配置项元数据、没检查实际哈希计算——测试过了，代码上线了，三周后才发现。所以 merge 前至少要过一遍：Agent 有没有越界改文件？有没有"只让测试过、功能没实现"的花招？

## Java 后端实战：一场老项目迁移的并行复盘

回翻第 18 篇——那场从 Windows 迁到 Linux、Jacob 换 LibreOffice 的迁移。如果当时有多 Agent，流程可以这样排——不过得先声明：以下是一个可行的探索方案，不是"唯一正确做法"。实际效果取决于任务耦合度。

Orchestrator 提示词：

```
任务：将文档转换模块从 Jacob 迁到 LibreOffice
拆为 3 个并行子 Agent：

Agent A：路径标准化
　　范围：src/utils/FilePathUtil.java
　　任务：用 java.nio.file.Paths 替换所有硬编码 \\ 和 //
　　输出：FilePathUtil.java + 15 个单元测试（Windows/Linux/Mac 各 5 个路径用例）

Agent B：LibreOffice 集成
　　范围：src/converter/LibreOfficeConverter.java
　　任务：替换 Jacob 调用为 soffice --headless --convert-to
　　输出：LibreOfficeConverter.java + 集成测试
　　约束：单实例锁用 --user-profile 独立目录

Agent C：批量重转脚本
　　范围：scripts/migrate-history.sh
　　任务：遍历旧格式文件，批量调新接口重转，校验输出文件哈希
　　输出：migrate-history.sh + 重转结果清单
```

三个 Agent 各开一个 worktree，并行跑。Agent A 改 `FilePathUtil.java` 时 Agent B 正在搭 LibreOffice 调用链路，互不干扰。跑完后按 diff-first 顺序依次合入 main。

这个场景之所以适合多 Agent，是因为三个子任务的耦合度很低——路径改法和 LibreOffice 集成互不依赖，批量脚本也只是调接口。如果这三个任务是"改同一个公共工具类"，就不适合拆。

## 什么时候开舰队，什么时候别开

不是所有任务都值得上多 Agent。开舰队有成本（token、review 带宽、协调时间），得算账。

应该开多 Agent 的 3 个信号：总改动 10 个文件以上或 3 个模块以上；任务能按模块/目录切分且零共享文件交叉；你有时间做合并后的人工 Review。

不应该开的 3 个信号：只改 1-2 个文件（开 worktree 比改动本身重）；强耦合的公共层重构（两个 Agent 必抢同一文件，合并与 review 开销反而让端到端变慢）；你不熟悉这块代码（拆都拆不对，Agent 跑偏你也不会发现）。

一个判断原则：满足 3 条"应该开"的信号，再上多 Agent；少一条就老老实实单 Agent。关键不是 Agent 数量，是任务本身有没有可拆的独立子问题。

AI 工程化的核心，不是管理更多 Agent，而是管理上下文（Context）的生命周期。Agent 只是载体，Workflow 是组织方式，而 Context 才是真正需要被规划、隔离、压缩和交接的对象。你开的第一支舰队，从一个 OAuth2 迁移任务开始。

