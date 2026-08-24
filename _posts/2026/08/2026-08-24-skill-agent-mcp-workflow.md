---
title: "skill、agent、mcp、workflow 到底怎么分"
author: 唐悦玮
date: 2026-08-24 09:40:00 +0800
categories: [AI编程, 科普]
tags: [AI编程, skill, agent, MCP, workflow, 提示词工程]
pin: false
comments: true
keyword: skill, agent, MCP, workflow, AI编程, 提示词工程, 大模型
---

> **摘要**：skill、agent、mcp、workflow——AI 编程文章里这四个词出镜率最高，却最容易被混为一谈。本文用你每天写的代码作参照，讲清它们各是哪一层、实际长什么样、怎么按自己的真实工作流搭起来，以及单条提示词到底怎么写才不白写。

你有没有这种体验：刷 AI 编程文章，满屏都是 skill、agent、mcp、workflow。每个词单看都眼熟，合在一起就懵——"我到底要不要给我项目搞个 skill？agent 和 workflow 是一回事吗？mcp 又是来凑热闹的？"

先给结论，省得你往下读还绕：这四个词是**四层不同的东西**，不是同义词，也不是递进关系。

- **skill** 是一段能复用的提示词，像给 AI 的操作手册；
- **agent** 是一个会读上下文、调工具、跑循环的执行实体，像那个真正干活的同事；
- **mcp** 是让 agent 接上外部系统（数据库、issue、CI）的插头标准；
- **workflow** 是把多步、甚至多个 agent 按流程串起来的编排层。

一句话：skill 给 agent 当手册，agent 通过 mcp 接外部，workflow 决定先跑谁后跑谁。下面挨个拆。

![四个词，四层东西](/imgs/202608/2026-08-24-skill-agent-mcp-workflow-concepts.png)

*图：skill / agent / mcp / workflow 各自是一层，混着说才是根上没分清。*

## Skill：一段能复用的操作手册

skill 最小，也最容易理解。它本质上就是**一段写好的提示词 + 约定**，你不用每次都重复说同一套指令。

比如我写技术博客，有一套固定流程：标题≤20字、摘要50~100字、写完跑评价协议。我把它写成一个 SKILL.md 文件，下次直接说"按 tech-blog-writer 规范写"，AI 就会去读那个文件照着来。skill 不是新能力，是**把你已经说腻的话固化下来**。

实际长什么样？一个 SKILL.md 大概是这样：

```markdown
---
name: tech-blog-writer
description: 当用户要求写技术博客、公众号文章时触发
---
写作原则：
- 每篇解决一个真实问题
- 标题口语化，≤20 字
- 正文 2500~4000 字
```

关键是 `description` 那一行——它决定了**什么时候加载这份手册**。AI 看到用户说"写篇公众号文章"，匹配到这个 description，就把整份 skill 读进来当行为约束。你不用每次手敲一遍规则。

skill 解决的是"重复劳动"：你每次都要交代的背景、规则、格式，固化成一份文件，AI 加载即用。国内这块已经很热闹：WorkBuddy 有技能市场，你刚看的 DSH 项目把 skill 和插件体系打通，通义灵码、CodeBuddy 也都有各自的指令集。

但记住一点：**skill 不是越多越好**。我之前踩过坑——装了一堆 skill，结果两个 skill 对"摘要字数"的规定互相矛盾（一个说≤25，一个说≤20），AI 直接懵，不知道听谁的。这一点后面讲提示词时再展开。

## Agent：一个会跑循环的执行实体

agent 比 skill 大一圈。如果说 skill 是手册，agent 就是**那个照着手册干活的同事**。

它的关键特征不是"更聪明的聊天框"，而是三件事：**读上下文、调工具、跑循环**。Claude Code、Codex CLI 都是 agent——你给它一个任务，它自己去读代码、跑测试、改文件、再跑，循环到完成。这个"循环"才是 agent 和一次性问答的本质区别：问答是你说一句它回一句，agent 是自己跟自己较劲直到任务结束。

agent 和 skill 的关系是：**agent 加载 skill 当操作手册**。你用 Claude Code 时，它背后有一套技能体系；你用 DSH，它按 `cordis.patch.yml` 把插件加载进来当行为约束。agent 是执行者，skill 是它手里的工作指南。

这里有个常见误解要拆掉：agent 不是"有情商会聊天的人"。它接到明确指令就闷头干，干完结果可能对也可能错，不会"委婉拒绝"也不会"看一眼再回答"——需要表现它的局限，就写"它做了什么、结果如何"，别编它怎么想。把 AI 写成有犹豫、有情绪的人类助手，读者一眼看出是假的，全文可信度直接崩。

## MCP：让 agent 接上外部系统的插头

mcp 是另一层的东西，专门解决"工具不通用"。

AI agent 想真正干活，得能碰你的数据库、issue 系统、CI 日志。但这些外部系统每家接口都不一样。MCP（Model Context Protocol）就是个**标准插头**：外部系统按规范实现一个 MCP server，暴露出一组 tools，agent 就能统一调用，不用为每个系统单独写适配。

实际形态是一个 server 提供一份 tools 清单：

```json
{
  "tools": [
    {"name": "query_database", "description": "执行只读 SQL"},
    {"name": "create_issue", "description": "在 issue tracker 建工单"}
  ]
}
```

agent 看到这份清单，就知道能叫哪些工具、分别干什么。你之前写的 DSH tool 插件（那个 `greet` 工具）走的就是这条路线——把能力以"工具"形式暴露给 agent，agent 不必懂后端细节，只管调。

MCP 现在是 Linux 基金会托管的开放标准，接一次就能跨 provider 用。但它也带来新的安全面：第三方 MCP server 一旦被投毒，agent 调它时就会执行恶意指令。所以**别为了用而用**——你只在真的需要 agent 碰外部系统时才加 MCP，纯粹写业务代码用不上；如果 agent 要持续读数据库、建工单、查 CI 日志这类**会被反复调用、且接口可能变动**的外部能力，才是 MCP 该登场的时候。

## Workflow：把步骤串起来的编排层

workflow 是最大的一层，但它常被误解。

workflow 不是"多开几个 agent"，而是**把多个步骤按确定流程串起来**。比如"先写规格 → 再写代码 → 跑测试 → 审查 → 合并"，这就是一个 workflow。它管的是顺序、条件、产物怎么流转。

这里必须点一条红线：**workflow、Multi-Agent、Git Worktree 是不同层次的东西，别糊在一起**。Multi-Agent 是执行层（几个 agent 并行干不同的活），Worktree 是隔离层（每个 agent 在独立分支互不干扰），workflow 是流程层（谁先谁后、产物怎么交）。说"我用 workflow 就是多 agent"会把读者带偏——你用单个 agent 配一个循环脚本，照样是 workflow。层次清楚了，才知道自己缺的是哪一层。

四者串起来看：skill 给 agent 当手册，agent 通过 mcp 接上外部系统，workflow 决定这些步骤怎么编排。它们各管一段，合起来才是一套能用的 AI 编程环境。

![它们怎么串起来](/imgs/202608/2026-08-24-skill-agent-mcp-workflow-relation.png)

*图：skill 给 agent 当手册，agent 通过 mcp 接外部，workflow 来编排——各管一段，合起来才是一套能用的 AI 编程环境。*

## 怎么按自己的流程搭（别一上来搞舰队）

讲了四个词，落到实操：你怎么给自己搭？

原则就一条：**从最痛的一个环节开始，别一上来搞多 agent 舰队**。

举个真实例子。你每次写单元测试，都要重复交代"用 JUnit5、覆盖边界值、命名用 should_ 前缀"。这活重复、有明确标准——它就是个做 skill 的绝佳候选。你把这套要求写成一个 test-writer skill，以后说一句"按 test-writer 写单测"就行。

进阶一点：如果单测要连测试库、查真实数据，那才考虑加一个 MCP server 把数据库暴露给 agent。再进一步：如果你有一堆"写单测 → 跑测试 → 修失败"的循环要反复跑，才值得用 workflow 把这几步串起来自动跑。

顺序很重要：**skill 先解决重复说 → mcp 在要接外部时才加 → workflow 等单步跑顺了再串**。反过来一上来就编排多 agent，九成会卡在"单个步骤都没跑明白"，最后舰队飞不起来，人还得更累。

## 怎么写好一条提示词

最后落到最落地的问题：提示词到底怎么写才不白写？结合我踩过的坑，几条实用规则：

![怎么写好一条提示词](/imgs/202608/2026-08-24-skill-agent-mcp-workflow-prompt.png)

*图：一条提示词的四条底线——具体、给上下文、给验收、一次一件事。*

**具体，别抽象**。"写好代码"是废话，"用 Java 17 的 switch 表达式替换旧 if-else，保持方法≤30行"才是能执行的指令。越具体，AI 跑偏的space越小。

**给上下文**。AI 不知道你项目的约定。把"我们团队用 MyBatis-Plus、禁止手写 XML SQL"写进 skill 或前置说明，它才不会自作主张。

**给验收标准**。"单测要通过、覆盖率不降、不引入新 warning"——让 AI 知道什么叫"干完了"，而不是它自己觉得行就行。

**一次只说一件事**。一条提示词塞五个不相关的要求，它顾此失彼。拆成多条，或将关联要求固化进 skill 让它一次性加载。

**写清边界比写多更重要**。这是我踩过最大的坑：之前装了一堆 skill，两个 skill 对"摘要字数"的规定互相矛盾，AI 直接懵。skill 之间必须有清晰的触发条件和责任边界，否则越多越乱。提示词也是同理——把"做什么"和"不做什么"都写清楚，比堆砌要求有效。

## 收尾

黑话本身不重要。skill、agent、mcp、workflow 这些词，说到底都是为了解决一件事：**把你已经会做、但不想重复做的活，交给 AI 稳妥地干**。

想清楚"我要让 AI 帮我解决哪类重复劳动"，比背熟这些名词有用得多。需要手册就做 skill，需要碰外部系统就加 mcp，需要串多步才上 workflow——工具是手段，你的真实工作流才是主角。

**参考资料**

- Anthropic Skills 文档（skill 概念与 SKILL.md 形态）
- MCP 官方 spec（protocol 定位与 tools 暴露机制）
- GitHub Copilot Agent Mode 文档（agent / workflow 官方表述）
