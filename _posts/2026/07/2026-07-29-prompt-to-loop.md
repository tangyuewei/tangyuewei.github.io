---
title: "Prompt 已死，Loop 永生"
author: 唐悦玮
date: 2026-07-29 10:10:00 +0800
categories: [AI 编程]
tags: [Loop Engineering, Prompt 工程, AI Agent, 开发者技能]
pin: false
comments: true
keyword: Loop Engineering, AI编程, Prompt工程, 开发者技能升级, Agent循环, 自动化编程, Coding Agent
---

> **摘要**：硅谷正在经历一场静默的技能迁移——从"写 Prompt"到"设计 Loop"。黄仁勋、Karpathy、吴恩达、Claude Code 作者同期发声，Anthropic 内部 80% 工程师已切换。本文拆解 Loop 的五个零件、一个致命陷阱和四个隐形成本，解释为什么两年后"会写 Prompt"不再构成壁垒。

---

上周末，产品的同事问我，把我问住了。

"你现在一天写几条 Prompt？"

我想了半天，发现这个问题越来越难回答。不是因为数量太多，而是因为我越来越不确定自己写的那些东西还能不能叫"Prompt"。

以前写 Prompt，大概是这样：敲一段指令，等 Claude 出结果，看了不满意，再敲一段。来回拉锯，你全程盯着，你是那个最忙的人。

现在呢？

早上到公司，一台 Mac 上跑着三个后台 session。一个在修 CI 挂掉的测试，一个在重构上个月遗留的权限校验逻辑，一个在扫描最近两周的 commit 生成技术文档。

我做的不是"写 Prompt"。我做的是设置目标、定义验收条件、配置停止规则，然后走开。等结果出来，审查，合并。

如果你让我回忆今天对 Claude "说了什么"，我大半说不出来。因为那些指令不是我敲的，是上一个 Loop 的评估结果自动生成的。

这不是我一个人的感受。

过去两个月，"Loop" 这个词在硅谷 AI 圈炸了。

## 所有人都在同一时间说同一件事

6 月初，黄仁勋抛出一句让 Prompt 工程师脊背发凉的话：

> Nobody writes prompts anymore. The new job is to write and handle loops.

几乎同时，Claude Code 的负责人 Boris Cherny 公开说："我不再 prompt Claude 了。我有 loop 在跑，是 loop 在 prompt Claude 并决定下一步做什么。我的工作是写 loop。"[^1]

他给出的数字更吓人：一个月删了 IDE，提了 259 个 PR，一行代码都没自己敲。

然后是 OpenClaw 作者 Peter Steinberger 的每月一喊："别再手写提示词了，设计循环才是王道。"[^2]

Karpathy 在谈他的 AutoResearch 项目时，把核心逻辑概括成四个词：generation → execution → evaluation → improve。[^3]

吴恩达更直接：3 到 6 个月后，prompt 将被 loop 取代。[^4]

这不是口号竞赛。Anthropic 内部数据：超过 80% 的工程师已经在用 self-improving loop，预计 3-6 个月内达到 100%。Claude 写的代码占合并总量超过 80%。

当各自领域的顶尖玩家在同一个时间窗口讲同一个概念，这件事就不只是"又一个新词"。

## 你以为是 Agent，其实是 Loop

有人听到这里可能会问：这不就是 Agent 吗？搞个新概念出来干嘛？

区别很清楚。

Agent 是干活的那个角色。Loop 是让这个角色不用你盯着也能持续干活的管理机制。

用个类比：Agent 是工人，Loop 是流水线。没有流水线的工人，你每做完一件活都得跑去跟他说"下一件做什么"。套上流水线的工人，他自己知道下一步去哪、做完怎么检验、不合格扔回去重做。

Google 工程师 Addy Osmani 在 6 月 7 日正式命名了 Loop Engineering，把它放在一个四层栈的最顶上[^5]：

```
Loop Engineering     ← 你在这一层：设计自动运转的系统
Harness Engineering  ← Agent 运行环境和工具
Context Engineering  ← 给 Agent 喂什么信息
Prompt Engineering   ← 怎么写指令
```

前三层都假设你坐在键盘前逐行指挥 AI。Loop Engineering 要把你从这个位置上移走。

核心逻辑一句话：**你定义目标和规则，系统自己跑、自己验收、自己重试，直到任务完成或触发停止条件。**

对比两种模式：

**Prompt 模式（过去两年）**
你写 Prompt → Agent 输出 → 你 review → 你再写下一个 → 循环往复。每一步都依赖你的注意力、上下文记忆和决策带宽。AI 跑得再快，还是得等你回来下一条指令。

**Loop 模式（现在）**
你定目标 → Loop 自动 prompt Agent → Loop 读输出 → Loop 判断是否完成 → 不合格自己重来。你在循环外部，从执行者变成设计者。

Karpathy 用一个词概括旧模式的问题："**人是瓶颈**"。

单任务平均人工介入超过 5 次。一旦任务复杂度超出单次对话的承载边界，优化提示词就不再产生任何收益——你写的 Prompt 再精妙，也解决不了"人必须一直坐在驾驶位上"这个上限。

Loop 做的事情，就是把"人"从这个循环里抠出去。

## Loop 的五个零件

Addy Osmani 把 Loop 拆成五个核心构件[^5]。Codex 和 Claude Code 目前都具备完整的五件套，只是叫法略有不同。

**1. 调度（Automations）**

这是 Loop 的心跳。没有定时触发，Loop 就只是一次性脚本。

Codex 的 Automations 标签页可以按 cron 表达式自动触发任务。Anthropic 内部用它做日常 issue 分类、CI 失败汇总、commit 简报。Claude Code 用 `/loop` 做间隔重跑，用 hooks 在 agent 生命周期特定节点执行 shell 命令，也可以推到 GitHub Actions 让你关电脑后继续跑。

关键细节：跑完了自动归档，找到问题的进 triage inbox。你不会被 50 条"一切正常"的通知淹没。

**2. 工作隔离（Worktrees）**

两个 Agent 同时改同一个文件，结果跟两个工程师往同一行 commit 一样——冲突，丢失，白干。

`git worktree` 解决这个问题：每个 Agent 在自己的独立分支上工作，共享同一个 repo 历史但物理上隔离。Codex 内置了 worktree 支持，Claude Code 通过 `--worktree` flag 和 `isolation: worktree` 设置给每个 subagent 分配独立 checkout。

但这里有个 Addy 反复强调的提醒：Worktree 只解决文件冲突，不解决你的审查带宽。同时跑 10 个 Agent，最后要 review 10 个 PR——工具不卡，人卡。[^6]

**3. 技能文件（Skills）**

这是让你不用每次会话都重新解释整个项目的机制。

一个 Skill 就是一个 `SKILL.md`，里面写项目约定、构建步骤、"上次因为那个破事我们不能这样写"之类的知识。Agent 每次启动都读它，不需要你重新说。

没有 Skill 的 Loop，每个循环都从零推导你的项目上下文。有了 Skill，知识会累积。

**4. 连接器（Connectors）**

一个只能看到文件系统的 Loop，是个小 Loop。

MCP 连接器让 Agent 能读 issue tracker、查数据库、调 staging API、往 Slack 发消息。Codex 和 Claude Code 都支持 MCP，写一次，两边能用。

这是纯"写代码"和"参与真实工作流"的分界线。没有连接器，你得到的是"这是修复建议"；有连接器，你得到的是 PR 已开、Linear 已更新、CI 通过后频道已通知。

**5. 子 Agent（Sub-agents）**

Loop 里最有结构价值的一个构件。原理很简单：**生成者不许给自己打分。**

同一个模型既写代码又检查代码，就像让考生自己阅卷——"我写的当然没问题"。Loop 的做法是拆开：一个 Agent 写，另一个 Agent 审，第二个 Agent 用不同的指令、有时用不同的模型，默认假设代码是坏的。

这种"对抗验证"是 Loop 能脱离人类监督的基本前提。如果没有独立的校验 Agent，一个 unsupervised loop 本质上就是一个乐观主义者在自言自语。

## 最关键的一步，最容易被跳过

Loop Engineering 的白皮书里，把验证列为五个动作中"最难、也最容易被偷懒跳过"的一步。[^7]

让 AI 自己给自己打分，它几乎总会夸自己。因为它脑子里装着一条自我说服链条：我是怎么推出来的、为什么选这个方案、为什么这个 corner case 不需要处理——它把这些推理过程当成了验证结论。

Codex 和 Claude Code 都提供了 `/goal` 命令来解决这个问题：你给一个可验证的停止条件（比如"`test/auth` 下所有测试通过且 lint 零报错"），每轮之后由一个独立的小模型判断目标是否达成。写代码的 Agent 不知道检查标准，检查的 Agent 不知道代码是怎么写的。

这就是 Boris Cherny 那句名言的技术底座："我不再 prompt Claude 了。我的工作是写 loop。"

他说的工作，不是写代码，是写这些条件。

## Loop 的四个隐形成本

Loop 跑起来很爽，但爽感背后有代价。Addy Osmani 列出了四个会在深夜悄悄累积的成本[^5]：

**验证债务**：Loop 跑了一夜，第二天你睡醒发现它合了 12 个 PR。每个单独看都"符合验收条件"，但放在一起，系统里多了一层你没参与设计的复杂性。微小的错误在多次循环中被放大、固化、再放大。

**理解腐化**：这是最危险的一个。代码是你写的，你天然理解它的结构和边界。代码是 Loop 写的，你最多扫了一眼 diff。两周后有人问你"这个模块为什么这样设计"，你答不出来。Boris 删了 IDE 的前提是，他是 Claude Code 的作者——他理解到了另一个层级。普通开发者不具备这个前提。

**认知投降**：Loop 跑顺了之后，有一个非常舒服的姿势——停止思考，被动接受它给的一切。Armin Ronacher（Flask 作者）对此表达了担忧。Addy 说这是"同一个动作，带着判断力做是解药，为了逃避思考做是毒药"。

**Token 失控**：Loop 在深夜死循环重试。Anthropic 的工程师在内部播客里说："当你点击运行、让 Claude 执行 8 小时，你其实在进行一场 500 美元的算力豪赌。"[^8] `/goal` 不给预算上限，Loop 会一直跑到把信用卡烧穿。

这四个成本，本质上都在说同一件事：Loop 不消灭判断力需求，它把判断力需求从"每 5 分钟一次"压缩成了"设计阶段一次 + 审查阶段一次"——**但这两次的判断力质量要求，远高于之前的任何一次 Prompt。**

## 开发者的技能在怎么变

过去两年，一个"会写 Prompt"的开发者，在简历上是个加分项。

未来两年，这个技能会被 Loop 吃掉。

不是因为 Prompt 没用了——是因为你不再需要自己写 Prompt 了。Loop 帮你写、帮你调、帮你迭代。你做的不再是"想一句好指令"，而是"设计一套好规则"。

核心能力从三个变成了三个新的：

**过去 | 现在**
--- | ---
能把需求说清楚 | 能把验收条件写清楚
能写出让 AI 理解上下文的提示词 | 能把项目知识固化为 Skills，让 Loop 自动消费
能判断 AI 输出的好坏 | 能设计独立的校验 Agent，让校验在无人监督下成立

顺便说一句，这不只是 AI 编程的事。

任何一个 ReAct 模式的设计——自动化测试、数据清洗、依赖升级、安全扫描——都会遵循同样的迁移路径。只要"对错可自动验证"的任务，都会被 Loop 吃掉。

## 结语

同一个 Loop，两个人来建，得出截然相反的结果。

一个人用它放大自己的判断力：定义清晰的边界、设计严格的校验规则、审查每一轮循环的输出质量。另一个人用它逃避判断力：把目标写得模糊、把校验丢给写代码的同一个 Agent、在审查时习惯性点 Approve。

Loop 不会怜悯放弃思考的人。它只会用更快的速度，把你的无知变成代码里的债务。

这就是 Loop Engineering 真正的残酷之处：**它把工程能力差距，从 2 倍放大到了 10 倍。**

不是"会用 Loop 的人比不会的人快 10 倍"——是"带着判断力用的人和不带判断力用的人，产出质量差 10 倍"。

Build the loop. Stay the engineer.

---

[^1]: Boris Cherny, X post, June 2026. https://x.com/rohanpaul_ai/status/2063289804708835412
[^2]: Peter Steinberger, X post, June 2026. https://x.com/steipete/status/2063697162748260627
[^3]: Andrej Karpathy, AutoResearch project & interviews, March-June 2026.
[^4]: 吴恩达, "Prompt will be replaced by loops in 3-6 months", June 2026.
[^5]: Addy Osmani, "Loop Engineering", June 2026. https://addyo.substack.com/p/loop-engineering
[^6]: Addy Osmani, "The Orchestration Tax", 2026. https://addyosmani.com/blog/orchestration-tax/
[^7]: "Loop Engineering 白皮书", community compilation, June 2026. https://drive.google.com/file/d/1qzKI4DKnyHRpXK1J3ATPqwaqLc0iNu-M/view
[^8]: Anthropic 内部播客, 引自 36氪/新智元报道, June 2026.

**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。
