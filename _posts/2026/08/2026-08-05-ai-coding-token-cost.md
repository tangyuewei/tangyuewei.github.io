---
title: "你的 AI 编程账单在悄悄烧钱"
author: 唐悦玮
date: 2026-08-05 18:00:00 +0800
categories: [AI 工程化]
tags: [Token 成本, AI 编程, 成本优化, Claude Code, Cursor, 工程管理]
pin: false
comments: true
keyword: Token 成本, AI 编程费用, Claude Code 成本优化, caveman, Ponytail, 模型路由, 上下文工程
---

> **摘要**：Token 消耗有四层成本结构，大多数开发者只看到了第一层。本文拆解模型选型、上下文大小、迭代次数和浪费四个成本层，附一个 SaaS 团队从月费 $87,000 降到 $24,000 的真实审计案例，并给出对应各层的实操优化方案。

---

Reddit 上有个帖子，标题是 "Costs are skyrocketing"，640 多赞，125 条评论。一个工程经理吐槽：团队里有开发者 AI 编程工具月费冲到 $300——在离岸团队里，这快赶上一些人的三分之一月薪了（来源：r/cursor，2026 年 7 月）。

评论区更扎心。有人说 Cursor Ultra 一个月交了 $200，实际只用了 $81 的额度——平台把额度池拆散了算，用户到手只有一半。

但最让我印象深刻的不是这些数字本身，而是所有抱怨里的人，没有一个人说自己知道账单的每一分钱花在了哪里。

你也许知道自己的总账单。但你知道你花的钱里，多少是模型本身贵、多少是上下文喂太多、多少是 Agent 死循环烧掉的吗？

## 你不是只给模型付了钱

大多数人看到账单，第一反应是"模型太贵了"。看一眼定价牌——海外旗舰模型达到两位数美金/百万 Token，然后就觉得账算清了。

但如果把视野放宽到国产模型，价格体系是另一回事。DeepSeek V4 已推出峰谷分时定价，平峰时段 API 价格约为海外同级模型的七分之一（来源：DeepSeek 官方定价，2026 年 7 月）。Kimi K3 和 Qwen3.8-Max 也在国产竞争价格区间。对于日常 Java 后端的编码需求——增删改查、测试生成、代码重构——能力是够的，成本只有海外旗舰的零头。

那为什么还是有人月花大几百甚至上千？因为成本不只是模型定价决定的。Token 消耗有四层结构，很多人只看见了第一层。

**更反直觉的是：最贵的可能不是 Opus。**

一个卡住的 Agent 用 Haiku 但读了 200K Token 的上下文，成本可能高于一个用 Opus 但只读了 5K Token 的精准请求。上下文大小——不是模型等级——才是真正的成本黑洞。

**第一层：模型选型（约 10-20% 的可优化空间）**

这一层最直观，也最容易被误认为"唯一的成本来源"。

你让 Agent 处理了一个变量重命名。它用了 Opus。Haiku 甚至 DeepSeek V4-Flash 都能做，成本只有前者的几十分之一。

PromptReports 对数千个 Claude Code 和 OpenRouter 会话的分析显示，约 35-45% 发到 Opus 的任务用 Sonnet 甚至更便宜的模型就能得同质量输出（来源：PromptReports CLI 基准测试，2026 年 4 月）。如果再把国产模型加进路由策略——DeepSeek V4-Flash 的日常编码、Kimi K3 的复杂重构、Qwen3.8-Max 的架构设计——省的空间远不止这一层。

**第二层：上下文大小（约 30-40% 的可优化空间）**

这一层最被低估。

Agent 每次调用模型，不是只发送你刚刚那句 Prompt——它把整个会话的上下文全塞进去了。对话记录、文件内容、工具调用结果、系统提示词……所有东西重新传一遍。

一个典型场景：你在一个 30 轮 Agent 会话里修 Bug，Agent 已经读了 15 个文件到上下文。第 31 轮你让它"改个变量名"，这一轮的成本不是"改一个名字"，而是"重新传 15 个文件 + 30 轮对话"。

这也是那个反直觉洞察的来源：一个 200K Token 上下文的 Haiku 请求，可能比一个 20K Token 上下文的 Opus 请求更贵。不是因为 Haiku 贵，是因为上下文膨胀吃掉了模型差价。

删掉不必要的文件引用、用专注的短会话代替超长会话、加上下文滑动窗口，这一层的省法最直接。

**第三层：迭代次数（约 20-30% 的可优化空间）**

一个干净的编码任务：5-15 轮请求搞定。一个卡住的 Agent：50-200 轮还在绕。

Agent 没有"卡住就停"的天赋。它没有挫败感。它会用无限的热情做一件反复失败的事情。

LeanOps 的记录里有一个极端案例：一个 Agent 深夜死循环重试 47 轮修同一个 Bug，一轮 $0.50，$23.50 烧掉，Bug 还是 Bug（来源：LeanOps 30 天 Agent 成本审计）。`/goal` 不加迭代上限，Agent 会一直跑到把信用卡烧穿。

**第四层：浪费（约 10-20% 的可优化空间）**

"浪费"指的是 Token 被消耗了但没有产生任何价值。

AI 编程成本分析发现，约 87% 的 Token 花在"找代码"上而不是"写代码"上（来源：amux.io）。Agent 反复读取已在上下文里的同一个文件、在循环中重新打开已知结论的工具调用、向模型发送超长的原始命令行输出。

Claude Code 最近一次更新加了 WebSearch 调用上限（默认 200 次）和 subagent 启动上限（默认 200 次），本质上都是在堵第四层的泄漏。

## 一个 SaaS 团队的匿名审计案例

LeanOps 在 2026 年 5 月发布了一份 30 天 Agent 成本审计报告，记录了一个约 35 人的 SaaS 公司（匿名）的 AI 编程费用优化过程。

审计前的账单：月费约 $87,000。审计发现的五个根因：

- 整个团队没有任何 prompt caching——缓存的输入 Token 只收 10% 价格，这条一个配置开关就能开
- Bug 分类 Agent 全程用最贵模型——这一个 Agent 占了总账单的近三分之一
- Bug 分类循环的上下文没有裁剪——每个循环平均带着约 200K Token 的输入
- 没有按人设预算上限——花最多的单个开发者一个月单人烧掉约 $5,800，全在熬夜重构项目
- Cursor 用户用 Pay-as-you-go API 而不是固定套餐——等于零售价买批发量

三周优化后做了什么——每项措施对应一层成本结构：

1. **第二层（上下文）**：全部 Agent 开 prompt caching，输入 Token 缓存后只收十分之一价格
2. **第一层（模型选型）**：Bug 分类 Agent 日常用更便宜的模型，难 Case 才升级旗舰
3. **第二层（上下文）**：上下文加滑动窗口，只保留最近若干步
4. **第三层（迭代）**：设每天每人硬性 Token 预算上限，消灭深夜死循环
5. **第一层（模型选型）**：Cursor 重度用户切到合适的套餐计划

最终账单从约 $87,000 降到约 $24,000，年度节省约 $756,000。工程生产力（按 sprint velocity 衡量）完全没受影响。

（来源：LeanOps，"Agentic AI Cost Runaway & Token Budget 2026"，2026 年 5 月）

## 三个可以立刻上手的工具

除了上面的审计经验，社区还有两个专门优化 Token 消耗的开源项目。

**Caveman**（`JuliusBrussee/caveman`）让 AI 像山顶洞人一样说话——删掉 "the"、"please"、"I'd be happy to help" 等不影响技术含义的礼貌用语。输出 Token 减少约 75%。最有价值的功能是 `/caveman-compress`：永久压缩你的 CLAUDE.md、AGENTS.md 等记忆文件，之后每次会话加载都少消耗近一半的输入 Token。

**Ponytail**（`DietrichGebert/ponytail`，9.5 万星）做的是另一件事：让 AI 少写代码。Caveman 管嘴（少废话），Ponytail 管手（少写冗余代码）。核心信条："The best code is the code you never wrote." 实测输出 Token 降约 54%，响应快约 27%。附带可验证的测试套件。

两者：一个压制对话层浪费，一个压制生成层冗余。

## 对应四层结构，你可以从今天开始做的事

**第一层：模型路由。** 日常任务不要用旗舰模型。一个典型 Java 后端的任务分布——变量重命名和查找类定义用 DeepSeek V4-Flash 或 Haiku，单元测试用 Kimi K3 或 Sonnet，架构设计才上 Qwen3.8-Max 或 Opus。如果用 Cursor，开 Router 的"成本"模式。如果用 Claude Code，用 `/fast` 或者通过 OpenRouter 路由到国产模型。

**第二层：上下文控制。** 开 prompt caching——这条在 Claude API 上就是一个配置开关，缓存的输入 Token 只收十分之一价格。同时养一个习惯：把大任务拆成聚焦的小会话，别让一个 Agent session 从早上跑到晚上。

**第三层：预算上限。** 设每天每人硬性 Token 上限。Agent 不知道什么时候该停，但你可以告诉它——每个月花在三层迭代死循环上的钱，往往是最容易砍掉的部分。

**第四层：浪费审计。** LeanOps 的 4 周审计计划可以参照：第一周分人统计找 top-5 花钱大户，第二周加缓存和上限，第三周做路由策略，第四周做架构级优化。他们发现约 80% 的账单来自花最多的几个人——找到他们，看他们怎么用 Agent，通常能省掉一大半。

---

五年前，每个工程团队都会监控 CPU、内存和带宽。五年后，每个工程团队都会监控 Token、上下文窗口和模型路由。

AI 编程正在变成新的云基础设施。而成本优化，不再属于财务部门——它属于工程能力。

---


**参考资料**

- r/cursor，"Costs are skyrocketing"。Reddit 社区讨论，含 Cursor Ultra 额度池拆分、Agent 模式消耗等用户反馈。
- PromptReports CLI，"Stop Using Opus for Everything: A Model Routing Guide"。
- LeanOps，"Agentic AI Cost Runaway & Token Budget 2026"。
- amux.io，"AI Coding FinOps: The Engineering Leader's Guide to Governing Agent Spend at Scale"。"87% Token 花在找代码"的数据来源。
- JuliusBrussee/caveman（GitHub），Claude Code/Codex 插件。
- DietrichGebert/ponytail（GitHub），Claude Code 生成代码 Token 优化工具。
