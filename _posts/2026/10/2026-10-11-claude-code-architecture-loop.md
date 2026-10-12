---
title: Claude Code 是怎么跑起来的：架构与主循环拆解（上）
author: 唐悦玮
date: 2026-10-11 09:33:00 +0800
categories: [AI编程, 工程实践]
tags: [ClaudeCode, Agent架构, 智能体, 工程化, 上下文工程, 源码解析]
pin: false
comments: true
keyword: Claude Code架构, Agent主循环, agentic harness, queryLoop, 分层架构, 源码解析
image:
  src: /imgs/202610/2026-10-11-claude-code-architecture-loop.png
  alt: Claude Code 是怎么跑起来的：架构与主循环拆解（上）
---

很多人用 Claude Code 久了，会不自觉把它当成「一个会自己写代码的模型」。这个理解差了一层。模型只负责推理和决策，真正让它能读文件、跑命令、改代码、把结果再喂回给自己反复琢磨的，是它外面那层壳。这层壳，Anthropic 自己管它叫 **agentic harness**（智能体套件）。

本篇是拆解系列的上篇，只做一件事：把 Claude Code 的整体骨架和那条最重要的主循环讲清楚。中篇讲工具系统和权限闸门，下篇讲上下文工程和扩展机制（子代理、Skills、MCP、记忆）。

## harness 才是真正干活的那个

官方文档对 agentic loop 的解释很直白：当你给 Claude 一个任务，它经历三个阶段——收集上下文、采取行动、验证结果。这三个阶段不是串行的，而是搅在一起循环的。Claude 全程靠工具干活：搜文件理解代码、改文件做变更、跑测试验证工作。模型负责「想」，工具负责「做」，harness 负责把两者接起来，并管理模型能看到的那块上下文。

文档里有一句话点破了本质：当说「Claude 决定用哪个工具」时，做推理的是模型；而提供工具、管理上下文的那一层，就是 harness。换句话说，**模型是可替换的内核，harness 才是产品的主体**。换 Opus 还是 Sonnet，只是换一个推理引擎；harness 不动，产品的性格就不走样。这也能解释为什么市面上那么多编程智能体，体验却天差地别——差异几乎都在 harness 这层，不在模型。

## 七组件模型：每一块都能映射到源码

一篇题为 *Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems* 的论文（arXiv 2604.14228）把 Claude Code 拆成七个组件，而且明确说这七个组件能直接对应到源码文件。这个映射很适合拿来当阅读源码的索引：

1. **User**：提交 prompt、审批权限、审阅输出。
2. **Interfaces**：交互式 CLI、无头 CLI（`claude -p`）、Agent SDK、IDE/桌面/网页。所有这些入口喂的是同一个循环。
3. **Agent loop**：模型调用、工具分发、结果收集的迭代循环，源码里是 `query.ts` 里的 `queryLoop()` 异步生成器。
4. **Permission system**：`permissions.ts` 里的 deny-first 规则求值、auto-mode 机器学习分类器、以及基于 hook 的拦截（`types/hooks.ts`）。
5. **Tools**：最多 54 个内置工具（19 个无条件开放，35 个受功能开关和用户类型控制），由 `tools.ts` 的 `assembleToolPool()` 拼装，再和 MCP 提供的工具合并。插件通过 MCP 服务和 skill/command 注册表间接贡献工具。
6. **State & persistence**：基本是只追加的 JSONL 会话转录（`sessionStorage.ts`）、全局 prompt 历史（`history.ts`）、子代理侧链文件。
7. **Execution environment**：带可选沙箱的 shell 执行（`shouldUseSandbox.ts`）、文件系统操作、网页抓取、MCP 服务连接、远程执行。

![图1：Claude Code 五层架构，七组件被归并进五层。](/imgs/202610/2026-10-11-claude-code-architecture-loop-infographic-1.jpg)

## 五层架构：把七组件再收一层

把上面七块按职责归并，论文给出了一张五层图，比七组件更好记：

- **Surface（表层）**：所有入口和渲染。交互 CLI 用 ink 框架画全屏终端界面，带实时流式、权限弹窗、进度条；无头 CLI 建一个 `QueryEngine` 做一次性处理；Agent SDK 用异步生成器吐出带类型的事件。
- **Core（核心层）**：agent loop 加压缩管线。这是循环的心脏。
- **Safety / Action（安全与动作层）**：权限系统（含 auto-mode 分类器）、hook 管线、扩展机制、内置工具、MCP 工具、shell 沙箱、子代理派生。
- **State（状态层）**：上下文拼装、运行时状态、会话持久化、CLAUDE.md 加记忆、侧链转录。
- **Backend（后端层）**：执行后端（本地/云/远程）和外部资源。

数据从左到右贯穿：用户经某个界面提交请求 → 进入 agent loop → loop 把动作提案交给权限系统 → 被批准的动作落到工具 → 工具碰执行环境并把 `tool_result` 回灌给 loop。状态和持久化贴在 loop 旁边，既记录转录也加载历史会话数据。

这套分层最值得记的一点：**所有界面共用一个循环**。你在终端敲的命令、在 IDE 里点的按钮、在 SDK 里发起的调用，最后都汇入同一条 `queryLoop()`。这也是为什么同一套权限规则、同一批 hook，在三种入口下行为一致。

## 主循环的一个回合到底长什么样

Agent SDK 文档把循环生命周期讲得很细。每一个 agent 会话都是同一个周期：

1. **收到 prompt**：Claude 拿到你的 prompt，连同 system prompt、工具定义、会话历史一起。
2. **求值并响应**：Claude 评估当前状态，决定下一步。它可以只回文本，也可以请求一个或多个工具调用，或者两者都要。
3. **执行工具**：SDK 跑每个被请求的工具，收集结果。每一批工具结果都回灌给 Claude，驱动下一次决策。
4. **重复**：第 2、3 步循环。每一轮完整循环算一个 **turn**。
5. **返回结果**：当 Claude 产出「不含工具调用」的纯文本响应，循环结束，SDK 先给一条最终的 AssistantMessage，再给一条 ResultMessage，带上最终文本、token 用量、成本和会话 ID。

文档给了一个很具体的例子：修复 `auth.ts` 的失败测试。Turn 1 调 Bash 跑 `npm test`，拿到三条失败；Turn 2 调 Read 读 `auth.ts` 和 `auth.test.ts`；Turn 3 调 Edit 改 `auth.ts` 再调 Bash 重跑，三条全过；最后 Turn 纯文本收尾：「修好了」。这是四个回合：三个带工具调用，一个纯文本。

循环不是无限跑的。你可以用 `max_turns` 给工具调用回合数封顶（只数带工具的那几轮），也可以用 `max_budget_usd` 按花费封顶。不设这个上限，循环会一直跑到 Claude 自己认为完了——范围清晰的任务是没问题，但「改进这个代码库」这种开放任务可能跑很久。生产环境里，给预算设上限是个好习惯。

![图2：单次 agentic turn 的数据流，从用户 prompt 进入上下文拼装，到模型调用、权限闸门、工具执行、结果回灌。](/imgs/202610/2026-10-11-claude-code-architecture-loop-infographic-2.jpg)

## 启动那一刻发生了什么

应用入口 `main()`（在 `main.tsx`）做几件容易被忽略但很关键的事：先初始化安全设置，其中包括 `NoDefaultCurrentDirectoryInExePath`——这个环境变量专门防 Windows 上的 PATH 劫持；然后注册信号处理器，保证被中断时能优雅退出；最后根据参数分发到对应的执行模式（交互、无头、SDK）。

这一段看着琐碎，但它是 harness 工程化的典型缩影：**真正决定产品可靠性的，往往不是模型调用那一行，而是启动时的安全设防和退出时的干净收尾**。一个能在生产里长期跑的 agent，得在「被用户 Ctrl-C」「被系统杀进程」这些边界情况下不丢状态、不漏操作。

## 为什么是单线程主循环

社区对 Claude Code 的拆解里反复提到一个设计选择：核心是一个单线程的 master loop（内部代号 nO），配一个支持暂停/恢复的异步双缓冲队列（h2A）做实时干预。用户可以在任务进行中往队列里塞新指令，Claude 不必重开整个会话就能就地调整计划。

为什么宁可单线程也不要「多 agent 同时抢控制权」？官方和社区给的理由一致：**可调试性和可靠性**。一条扁平的消息历史（没有复杂的线程分支），配合「先做最简单的事」的原则（搜索用正则而不是向量库、记忆用 Markdown 而不是数据库），让整个系统出问题时能被人看懂、被人追。复杂问题如果真要并行，Claude Code 允许最多派生一个子代理分支——既能做问题分解，又不会退化成失控的 agent 群。

这正好呼应了前面那句话：harness 是主体。单线程主循环这种「看起来不够酷」的取舍，恰恰是它敢在生产里长期自治的底气。

## 参考资料

- Anthropic. *How Claude Code works*. https://docs.anthropic.com/en/docs/claude-code/how-claude-code-works
- Anthropic. *How the agent loop works* (Agent SDK). https://code.claude.com/docs/en/agent-sdk/agent-loop
- Anonymous. *Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems*. arXiv:2604.14228
- Anthropic. *Explore the context window*. https://code.claude.com/docs/en/context-window

