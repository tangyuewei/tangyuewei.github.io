---
title: "DeepSeek Harness 开源，怎么上手"
author: 唐悦玮
date: 2026-08-17 09:10:00 +0800
categories: [AI编程, 工程实践]
tags: [DeepSeek Harness, Agent, 插件化, Claude Code, 工程实践]
pin: false
comments: true
keyword: DeepSeek Harness, dsh, 一切皆插件, Agent 框架, Cordis, Claude Code 替代, 插件开发
---

> **摘要**：8 月 13 日 DeepSeek 开源 Agent 框架 Harness，目标直指 Claude Code。它把模型、工具、沙箱、UI 全部做成可替换插件。这篇文章带你把它跑起来、写第一个插件，并聊聊这套架构离生产还有多远。

---

七月我写过一篇 Harness Engineering，讲"给 AI 套上缰绳"：别老换模型，先把模型跑的环境收拾好。当时这个词还是个概念，落地全靠 AGENTS.md、verify 脚本、权限 hooks 自己拼。

一个月后，DeepSeek 直接把"缰绳"开源了。

8 月 13 日深夜，DeepSeek 上线 V4 Pro 正式版；十几个小时后，第二记重拳——DeepSeek Harness（简称 dsh），MIT 协议完全开源的 Agent 框架，v0.1 开发者预览版。代码推上 GitHub 当天，Hacker News 讨论帖冲上 TOP 1，星标数快速攀升，不同口径下发布后两天内已达数万到近十万量级（来源：GitHub API / CSDN 报道，2026 年 8 月）。

一个模型公司，同一天发旗舰模型和开源框架。前者回答"模型有多强"，后者回答"强了之后怎么用起来"。

## 它不是什么"DeepSeek 版 Claude Code"

先把定位说清楚。

dsh 不是又一个聊天界面，也不是模型本身。它是让模型能调用工具、执行任务、跟开发者协作的那层基础设施——OpenAI 报告里说的"Agent = Model + Harness"，Harness 就是 dsh 这层。

但和 Claude Code、Codex 有一个根本区别：**后两者是产品，你用它的规则；dsh 是元框架，你用它组装自己的 Agent 产品。**

官方设计原则就六个字：一切皆插件（Everything is a Plugin）。

打开它的架构文档，你会看到：模型适配器是插件，工具注册是插件，Session Log 是插件，Agent Loop 本身是插件，沙箱是插件，审批策略是插件，连 UI 都是插件。所有组件通过 Cordis 服务与事件互相协作，在配置层自由组合（来源：DeepSeek Harness 官方架构文档，2026 年 8 月）。

想换模型？装个插件。想换工具注册方式？装个插件。想把 Agent 从"思考→行动→观察"改成别的循环？还是装个插件。**没有特权核心，每一块都能被替换。**

这套 Cordis 元框架不是从零造的——它已经在 Koishi 聊天机器人生态里跑了四年，这次 DeepSeek 还和北大合发了一篇论文给它做了数学基础（来源：DeepSeek Harness 发布说明，2026 年 8 月）。

## 十分钟跑起来

上手比想象中简单。前提就一个：Node.js 版本要 `^22.19.0` 或 `>=24`。我一开始用旧版 Node 跑，静默失败，连报错都没有——这是它目前最坑的地方（来源：DeepSeek Harness 官方 README，2026 年 8 月）。

装好 Node，一行命令启动 Web UI：

```bash
npx @deepseek-ai/dsh web
```

默认地址 `http://127.0.0.1:3080`。打开后三步走：

1. **配模型**：Settings → Models，填 DeepSeek API Key。它也支持 OpenAI 兼容端点和其他厂商，改完不用重启
2. **选工作区**：Choose workspace，指向你的项目目录。**没选工作区之前，输入框是禁用的**——我第一次卡在这，还以为是启动失败了
3. **发任务**：新开一个会话，让它"总结这个仓库并识别主要包"试试水

国内网络建议先换 npm 镜像：`npm config set registry https://registry.npmmirror.com`，不然下载可能很慢。

它运行的时候，所有文件读写和命令执行都被限制在工作区内，路径穿越（`../../`）会被拦——这是默认的沙箱隔离，不需要额外配置（来源：dsh 使用指南，2026 年 8 月）。

## 写你的第一个插件

光会跑没意思，dsh 的灵魂在插件。用一个最小例子讲清楚它的机制。

从源码仓库开始（开发插件建议 clone 源码，而不是 npx）：

```bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
corepack enable
pnpm install
pnpm run build
```

然后在仓库里建一个插件目录，写一个 `greet` 工具：

```typescript
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'greet-tool'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet someone by name.',
    parameters: {
      name: { type: 'string', required: true, description: 'The name to greet' }
    },
    async execute(args) {
      return `你好,${args.name}!`
    }
  }))
}
```

（示例参考：Datawhale DeepSeek Harness 插件教程，2026 年 8 月）

这个插件只干四件事：声明插件名、声明需要的服务（tools）、在 `apply` 入口注册工具、定义工具的入参和执行逻辑。模型通过"描述"知道这个工具存在，通过"入参 schema"知道怎么调用它。

挂载到 Web 服务：

```bash
pnpm dsh web --patch ./scratch-plugin/cordis.yml
```

启动后到"设置 → 插件列表"，确认插件是"已启用"状态，然后让 Agent 调用：`请调用 greet 工具问候 Datawhale`。你会看到工具调用的输入输出完整展开——插件闭环就跑通了。

生产级的插件不用自己造轮子。比如 DeepSeek 的文本模型目前不能直接看图，社区有 DSH Vision Toolkit 插件，把图片交给单独的视觉模型，再把结果送回 Harness，实现截图分析、OCR、元素定位（来源：Datawhale 插件教程，2026 年 8 月）。安装就是一行：

```bash
dsh plugin --profile web add @dsh-external/dsh-vision-toolkit
```

**装插件前一定看源码和权限**。Harness 插件运行在宿主进程里，属于可信代码，安装脚本会下载什么、需要哪些目录和凭据权限，都得先弄清楚——这跟装任何 npm 包一个道理。

## 四种模式，各干各的活

dsh 内置了四种运行模式，对应不同场景（来源：DeepSeek 官方发布说明，2026 年 8 月）：

| 模式 | 干什么用 |
|------|---------|
| 标准模式 | 日常开发，完整文件读写 + 命令执行 |
| 极简模式 | 纯文本对话，无工具，适合闲聊和快速问答 |
| PTC 模式 | 程序化工具调用，适合基准测试和脚本化场景 |
| 创造模式 | 插件开发调试，内存里直接试 Cordis 插件 |

实际用下来，日常开发用标准模式就够了；想验证插件逻辑，创造模式省去反复重启。

还有 headless 模式，跑脚本和 CI 用：`dsh --profile headless "列出这个仓库所有 TODO"`，一次性任务，输出到 stdout 就退出，不用开浏览器。

## 回看我七月那篇 harness 文章

既然 dsh 把概念落地成了产品，正好回头检验一下我上个月写的《给 AI 套上缰绳：Harness Engineering 是什么》，哪些判断站得住，哪些需要修正。

**站得住的三个判断：**

一是"Agent = Model + Harness，模型是 CPU，Harness 是操作系统"。dsh 的定位跟这个公式严丝合缝——它把模型当可替换组件，把工程能力（工具、沙箱、审批、UI）全部做进 Harness 层。DeepSeek 官方自己的定义就是"Model + Harness = Agent"。

二是"每次 Agent 犯一个错，就把它工程化成一个约束"。dsh 的插件化让这个循环变得更顺——AI 又漏改文件了？把"文件修改必须走工具注册"写成一个插件约束，比维护 AGENTS.md 里的一行文字更硬。约束从"文档约定"升级成了"代码强制"。

三是"评审与验证必须分离"。dsh 的四种模式和 headless 流程，天然支持把"干活"和"验证"拆开跑——这是它架构上就内建的优势。

**需要修正的两个地方：**

一是旧文把 harness 落地完全押在"AGENTS.md + verify 脚本 + 权限 hooks"三件套上，这是 Claude Code 的生态。dsh 的出现说明 harness 不止一种形态——插件化元框架是更激进的一条路，AGENTS.md 只是其中一种"系统提示插件"的实现。三件套是路径之一，不是唯一解。

二是旧文里"模型一行没动，环境一换，效果天差地别"这个说法，用在"给 AI 套缰绳"上成立，但 dsh 的实践反过来提醒：**Harness 和模型是协同演进的**。DeepSeek 是模型和 Harness 一起发，Muse Spark 也是和 Muse Code 一同训练——Harness 的边界设计会影响模型的发挥，模型的进步也会反过来改变 Harness 该管什么。缰绳和马的品种是互相适配的，不是单向约束。

## 和 Claude Code 比，差在哪

这是绕不开的问题。说结论：**架构理念上 dsh 更激进，工程成熟度上 Claude Code 领先。**

- **插件化程度**：dsh 把"换工具""换循环"都变成配置，Claude Code 的扩展点是 skills + hooks，自由度不在一个量级
- **Session 可靠性**：dsh 把会话日志设计成 append-only 事件日志，官方宣称崩溃后可重放恢复——但这是架构设计的宣称，还没经过大规模生产验证；Claude Code 的会话机制成熟，但长会话断开后的恢复一直是它的短板。两者在"可靠"的定义上不一样，都得等时间检验
- **生态**：Claude Code 有一年多的打磨、社区和文档积累，dsh 发布才几天，`THERE WILL BE COMPATIBILITY-BREAKING CHANGES` 的警告就挂在 README 首页
- **模型绑定**：dsh 不绑定 DeepSeek 模型，OpenAI 兼容端点都能接；但当前优化得最好的肯定是自家 V4-Pro-0813
- **成本**：DeepSeek 从 8 月 17 日起 API 改峰谷定价，高峰（北京时间 9-12 点、14-18 点）价格是空闲时段的两倍，晚间和深夜半价（来源：DeepSeek 官方定价公告，2026 年 8 月）。国内直连 + 相对低价，这是它对国内团队最实在的吸引力

但它现在还是 0.1 预览版，官方明说"存在破坏性更新"。我的建议是：**拿它做技术预研、做内部工具的底座，别在生产环境梭哈。** 想用 dsh 顶替 Claude Code 的团队，等它稳定几个版本再说。

## Java 团队怎么用

最后给 Java 后端同行的落地建议，三句话：

1. **先 headless 跑通一个真实小任务**（比如"给这个模块补全单元测试"），验证工具链和工作区隔离是否顺手
2. **把团队知识做成插件**——项目脚手架生成、代码规范检查、SQL 风险扫描，这些都能注册成 dsh 工具，让模型按团队规则干活，而不是每次重新教
3. **留意它把 Session Log 做成 append-only 的设计**——这对需要审计的开发场景是加分项，出了问题能回放

模型会一直换，套缰绳的手艺才值钱。现在缰绳有人开源了，还给你留了所有改装孔位——剩下的，就是把团队自己的规则拧上去。

> 作者：[唐悦玮](https://tangyuewei.com)  |  从后端出发，用 AI 拓展到全栈的工程师。

---

**参考资料**

- DeepSeek Harness 官方 GitHub 仓库与 README，2026 年 8 月。安装要求、MIT 协议、破坏性更新警告。
- DeepSeek Harness 官方架构文档与发布说明，2026 年 8 月。"一切皆插件"设计、Cordis 框架、四种运行模式、与北大合作论文。
- CSDN，"DeepSeek Harness 开源：一切皆插件、省 Token、Agent 还能改装自己"，2026 年 8 月 15 日。发布背景、GitHub 星标数据。
- Datawhale，"DeepSeek Harness 插件开发保姆教程"，2026 年 8 月。最小插件代码示例、Vision Toolkit 安装与配置。
- DeepSeek 官方定价公告，2026 年 8 月。API 峰谷定价规则，8 月 17 日生效。
