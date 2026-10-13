---
title: Claude Code 的上下文与扩展：窗口满了之后怎么办（下）
author: 唐悦玮
date: 2026-10-13 08:45:00 +0800
categories: [AI编程, 工程实践]
tags: [ClaudeCode, 上下文工程, 子代理, Skills, MCP, 记忆, 压缩]
pin: false
comments: true
keyword: Claude Code上下文, 窗口压缩, 子代理, Skills, MCP, 记忆, 上下文工程
image:
  src: /imgs/202610/2026-10-13-claude-code-context-extensions.png
  alt: Claude Code 的上下文与扩展：窗口满了之后怎么办（下）
---

上篇讲了骨架和主循环，中篇讲了工具和权限。但有一个看不见的约束贯穿始终，而且它才是 agent 工程里最磨人的部分——**上下文窗口**。模型一次能「看到」的文本量是有限的，而 Claude Code 偏偏要让模型在一整个代码库里干活。下篇就讲 harness 怎么在「有限窗口」里塞进「无限任务」。

## 上下文到底由什么拼成

官方文档说得很清楚：会话启动时，窗口里就已经有内容了，远在你敲第一个字之前。拼装来源大致是这些：

- **System prompt**：Claude Code 自身的行为与工具使用指令。
- **CLAUDE.md / AGENTS.md**：项目级和用户级的约定，会话开始就加载；仓库里若有 AGENTS.md，Claude Code 会就地读它代替 CLAUDE.md。
- **Auto memory**：跨会话学到的笔记（比如构建命令、项目模式、该避的坑），限前 200 行或 25KB。
- **Skill 描述**：可用 Skills 的简短描述，启动时即载；正文触发时才注入完整内容。
- **MCP 工具名**：已连 MCP 服务的工具名（完整 schema 可延迟到用时再载）。
- **会话历史**：你读过的文件、跑过的命令、模型的回答——最大的消耗源。

一个有中等体量 CLAUDE.md、挂着几个 MCP 服务的项目，开会话时可能就已经吃掉两万到三万 token。这还什么都没干。

![图1：上下文窗口的构成与各类来源的消耗占比（文件读取与工具结果是最大头）。](/imgs/202610/2026-10-13-claude-code-context-extensions-infographic-1.jpg)

## 200K 是默认，1M 是上限，但都不是免费午餐

默认窗口 200K token，可用 `opus[1m]` / `sonnet[1m]` 扩到 1M（2026 年 3 月起 Opus 4.6 / Sonnet 4.6 普遍可用）。`/context` 看分类明细，`/usage`（或 `/cost`）看花费。

但窗口大不等于随便用。社区把这笔账叫 **context window tax（上下文窗口税）**：每一轮你发消息，都会把会话开始以来积累的全部上下文重新发一遍——CLAUDE.md、工具调用轨迹、读过的文件、之前的回答，全算输入 token 计费。缓存能软化成本，但新进来的内容（文件读取、工具输出、你最新的话）仍是全价。更要命的是 **context rot（上下文腐烂）**：上下文越长，模型对其中特定部分的注意力越不可靠，表现就是开始忽略 CLAUDE.md 里的规矩、忘了三回合前你定的约束、写出违背早先约定的代码。1M 只是把天花板抬高，没消除腐烂，只是推迟它。

## 窗口快满时：五段压缩管线

当上下文接近上限，Claude Code 会触发自动压缩（auto-compaction），论文给出的触发点约在窗口容量的 85%–92%。它把对话历史换成结构化摘要，保留原始需求、技术细节、动过的文件、已做的决定、待办项。

设计空间论文把压缩管线拆成 **五段连续整形器**（在 `query.ts` 里、每次模型调用前跑）：budget reduction（预算削减）、snip（裁剪）、microcompact（微压缩）、context collapse（上下文塌缩）、auto-compact（自动压缩）。这是个层层递进的「挤牙膏」过程，而不是一次性 summary。

你也可以手动 `/compact`，而且能带 focus 指令，告诉它优先保什么：

```
/compact focus on the auth bug fix
```

但压缩本质是有损的。官方明确列了压缩后各自的下场：

- System prompt 和输出风格：不变。
- 项目根 CLAUDE.md 和无作用域规则：从磁盘**重注入**。
- Auto memory：从磁盘重注入。
- 路径作用域规则（`.claude/rules/`）：丢失，直到再读到对应文件。
- 嵌套 CLAUDE.md：丢失，直到再读那个子目录的文件。
- 已触发的 Skill 正文：重注入，但单 Skill 上限 5000 token、总计 25000 token。
- Hook：不受影响，因为它以代码形式跑，不活在上下文里。

这就是为什么老手都强调：**压缩是安全网，不是策略**。靠压缩续命的会话，关键决定可能在压缩后失真——你在第三小时定的「这个接口用老格式」，摘要未必保得住。正经做法是开局就控量：CLAUDE.md 压到 200 行内、把参考资料搬进 Skills 按需加载、用子代理承接噪音。

## 子代理：把噪音挡在主会话之外

子代理是上下文工程里最划算的一招。它跑在**自己独立的上下文窗口**里，只把最终摘要回给主会话。你要读五十个文件做架构梳理、跑一遍安全扫描——这些中间产物会淹没主会话、且你再也不会引用——交给子代理，主窗口只收到一份干净的结论加一点元数据。

子代理在 `.claude/agents/` 下用 Markdown + YAML frontmatter 定义：`name`、`description`（决定何时被委派）、`tools`（最小权限，只读审计代理就别给 Write）、`model`（把便宜活路由给 sonnet，opus 留给重推理）、`maxTurns`、`disallowedTools`、`permissionMode`。Claude Code 还内置 Explore（只读代码库搜索）和 Plan（规划期调研）两个子代理，自动把探索输出挡在主窗口外。

模式上最值得用的是「对抗式评审」：在一个全新子代理上下文里跑评审，它只看到 diff 和评审标准，看不到你产生改动时的推理——于是它按自己的标准打分，而不是顺着你的思路点头。

![图2：五段压缩管线触发点，以及子代理如何用独立上下文把大文件读取的噪音隔离在主会话之外。](/imgs/202610/2026-10-13-claude-code-context-extensions-infographic-2.jpg)

## Skills 与 MCP：不动主循环就能续能力

这两个扩展机制都不改主循环，只是往工具池和上下文里「插模块」。

**Skills**：描述启动即载（便宜），正文触发才注入（贵）。用 `disable-model-invocation: true` 可以让带副作用的 Skill 只在手动调用时加载，避免模型擅自触发。`/agents`、`/commands` 这类是打包好的可复用流程。

**MCP（Model Context Protocol）**：开放标准，把外部工具和数据源接进工具池。三种传输：stdio（本地进程，适合自定义脚本）、http（远程/云服务的推荐方式，可带 bearer token）、sse。连上之后，Claude Code 能直接读你的 Jira、查 Postgres、拉 Figma、改 Notion——而不是你把这些内容复制进聊天框。触发信号很朴素：当你开始频繁把另一个工具里的数据粘进对话，就是该接 MCP 的时候。

## 记忆：跨会话的那块持久层

上下文每轮重发、压缩还会丢，所以真正要长期留的东西得落到磁盘。**CLAUDE.md** 存项目约定（每次会话重注入），**MEMORY.md** 存跨会话学到的偏好与坑（限前 200 行 / 25KB）。这两类文件是 harness 的「长期记忆」，跟会话里那块会腐烂的上下文是两回事。把「同一句话你说第二遍」就说明它该进 CLAUDE.md 或 Skill——这是减少上下文税最直接的纪律。

## 小结

Claude Code 能在有限窗口里干无限的活，靠的不是更大的模型，而是 harness 的一整套分层手艺：**工具池控量、权限与 hook 控险、压缩管线控窗、子代理隔离噪音、Skills 与 MCP 续接能力、磁盘记忆扛住跨会话**。模型只是被这层壳托着的内核。

harness 才是主体。看懂这五层、这五段、这三道防线，你就不只是「会用」Claude Code，而是能判断它什么时候会失灵、在哪里失灵、以及该怎么在它失灵前先布好护栏。

## 参考资料

- Anthropic. *Explore the context window*. https://code.claude.com/docs/en/context-window
- Anthropic. *Sub-agents*. https://code.claude.com/docs/en/sub-agents
- GeeksforGeeks. *Controlling Context in Claude Code*. https://www.geeksforgeeks.org/artificial-intelligence/controlling-context-in-claude-code
- Anonymous. *Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems*. arXiv:2604.14228

