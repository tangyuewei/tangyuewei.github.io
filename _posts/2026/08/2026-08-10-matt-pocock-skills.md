---
title: "Matt Pocock技能包治AI瞎写与造屎山"
author: 唐悦玮
date: 2026-08-10 08:10:00 +0800
categories: [技术实战, 工具效率]
tags: [AI编程, Claude Code, Skill, 工程实践, 质量治理]
pin: false
comments: true
keyword: AI编程,Claude Code,Skill,Matt Pocock,工程实践,Agent技能
---

> 摘要：Matt Pocock 把他个人 .claude/ 目录里的 20+ 个 Skill 文件开源了，24 小时冲上 GitHub Trending 第一。这不是又一个"AI 编程银弹"，而是一套被实战验证过的控制规则——让 AI 从瞎写、失忆、造屎山的状态里拉回来。但它偏 TypeScript 生态，也不是安装越多越好。

---

上周五晚上，我盯着 AI 生成的代码，陷入了沉思。

功能逻辑看起来没问题，但那个 `processData` 函数——它内部调了三个 API，改了全局状态，还顺手写了文件系统。我问 AI："这个函数为什么这么写？"它回了一堆听起来很有道理的解释，但翻来覆去就一个意思：我觉得这样写挺好的。

你要是用过 AI 写代码，一定遇到过这种时刻。AI 很能写，但它写的代码，过两周你自己都不敢改。

这不是 AI 的问题。是我们没给它规则。

## Matt Pocock 开源了什么？

2026 年 4 月底，TypeScript 圈教父级人物、Total TypeScript 创始人 Matt Pocock 把他个人 `.claude/` 目录下用了很久的 Skill 文件全部开源了。仓库名叫 [mattpocock/skills](https://github.com/mattpocock/skills)，24 小时就冲到了 GitHub Trending 第一，目前 20 万+ Star，1.8万+ Fork。

有人说这是又一个 AI 编程教程。不是的。

这些 Skill 不是"教你写代码"，而是"教 AI 怎么写代码"。每个 Skill 本质上是一段 Markdown 格式的系统指令，告诉 AI：在这个场景下，你应该按照这个流程来思考，而不是自由发挥。

它的设计原则就三条：足够小方便修改、足够灵活容易适配、彼此独立可自由组合。不依赖特定模型——你用 Claude Code 能用，换成 WorkBuddy、CodeBuddy 这类国内工具，只要支持自定义 Skill 就能用。

Matt 给他的定位是：**Real engineering. Not vibe coding.** 翻译过来：真正干活的东西，不是让 AI 凭感觉瞎写。

## 四大类 Skill，覆盖编程全流程

Matt 的 20+ 个 Skill 分四类，我按使用频率从高到低说。

**第一类：规划与设计（最高频）**

`grill-me` 是我觉得最狠的一个。它会要求 AI 扮演一个"烦人的面试官"，对你的设计方案进行连环提问——"为什么选这个架构？如果并发量翻十倍怎么办？你考虑过数据一致性吗？"很多设计漏洞，AI 自己就能逼你补上。

`to-prd` 和 `to-issues` 是一条流水线：先把聊天上下文转成 PRD 文档，再把 PRD 按竖切片拆成独立 Issue，扔进 GitHub。这两个 Skill 打配合，把"聊天吹水"变成"可执行的工程任务"。

还有一个 `design-an-interface`：它会并行启动多个子 Agent，各自生成一种接口设计方案，最后让你对比选择。这比让 AI 一次性给你"最佳方案"靠谱得多。

**第二类：开发类（日常必备）**

`tdd` 是 Matt 最核心的一个 Skill。它强制红→绿→重构循环：Agent 必须先写 failing test，确认测试确实失败，再写实现代码让测试通过，最后重构。不许跳过任何一步。

这听着很教条，但有效。AI 在没有测试约束时，代码很容易"看起来对但实际跑不通"。tdd Skill 等于给 AI 装了一个反馈循环——代码能不能用，测试说了算。

```bash
# tdd skill 的典型输出流程
1. [RED]    Agent 生成测试 → 运行 → 确认失败
2. [GREEN]  Agent 写实现 → 运行测试 → 确认通过
3. [REFACTOR] Agent 重构 → 运行测试 → 确认仍通过
```

配套的 `triage-issue` 也值得一说：收到 bug 报告后，AI 自动分析根因，生成带 TDD 修复计划的 Issue，不是猜一个补丁就完事。

**第三类：工具与安全**

`git-guardrails-claude-code` 在 git hook 层拦截危险操作——`push --force`、`reset --hard`、`clean -fd`——执行前弹确认。这是从机制上防手滑，不是靠自觉。

`setup-pre-commit` 一键搭建 Husky pre-commit hooks，格式化、lint、类型检查全部自动化。看起来简单，但如果你带过新人，就知道少一个步骤就能让代码库一天烂掉。

**第四类：写作与知识管理**

`caveman` 是个有趣的 Skill：让 AI 用超压缩格式回复，实测能省 60-70% 的 Token 消耗。跟 AI 唠嗑的时候无所谓，但长对话里每个 Token 都是上下文窗口。

`ubiquitous-language` 直接借鉴了《领域驱动设计》里的"统一语言"概念——从对话中提取术语词汇表，确保 AI 和你对"客户"、"工单"、"审批流"这些词的理解一致，不会同词不同义。

`handoff` 解决的是跨会话失忆问题：Agent 在切换任务或工具时，自动留存决策记录和上下文摘要，下一个 Agent 不用从头猜。

## AI 编程为什么总翻车？

Matt 把 AI 编程的失败模式归纳成了四个场景，每个都对应到经典软件工程著作：

**第一，需求不对齐。** 你说了 A，AI 做了 B 还觉得自己完成的正是你想要的。这和《程序员修炼之道》里那句"No-one knows exactly what they want"一脉相承——问题不出在 AI 不理解你，而出在你也没把需求想清楚。

**第二，语言不统一。** 一个"用户状态"，你可能指登录态，AI 理解成会员等级，再过一个回合又变成数据同步状态。没有统一术语表，每一次对话都是在重新谈判。

**第三，反馈太慢。** 代码写完才跑测试，发现一堆问题，修了再跑，又出新的。Matt 引用《程序员修炼之道》"反馈速率是整个项目的限速步骤"——没有 TDD 那种秒级反馈循环，AI 编程的速度优势全被 debug 时间吃掉。

**第四，架构腐化。** AI 加速了写代码，但没减缓软件腐烂。《软件设计哲学》里说"最好的模块是深的"——接口简单，实现复杂。但 AI 天然倾向于写"浅"模块：到处散落小函数，谁也说不清哪个负责什么。

四个问题摆在这，Matt 的 Skill 不是答案，而是一套逼着你和 AI 共同面对这些问题的机制。

## Skill 已经在泛滥了

目前全网的 AI Skill/Agent 数量暴增。everything-claude-code（ECC）仓库 251 个技能 + 63 个代理 + 34 条规则，Star 数 23.9 万，比 Matt 的仓库还高。但仔细看，两者的思路完全不同。

ECC 走的是"全覆盖"路线：从 Go/Java/Python/Kotlin 到 CI/CD、内容创作，应有尽有。优点是开箱即用，缺点是体量太大——全量安装光是 Skill 索引就能吃掉大量上下文。

而 Matt 走的是"精选"路线：10+ 个 Skill，每个都经过他个人长期实战打磨。他不做全，只做准。

这不是品味之争，背后有一个很现实的问题：**Every Skill is a Tax。**

掘金上有开发者做了实测：200K 上下文窗口下，加载 100 个 Skill 消耗 5% 窗口，300 个消耗 15%，500 个消耗 25%，到 1000 个直接耗尽 50%。每个 Skill 的 description 大概 80-120 tokens，看起来不多，但积少成多。而且即使这次对话不用某个 Skill，它的描述依然占着位置——Anthropic 的渐进式披露机制也只是缓解，不是根治。

更麻烦的是 **Skill 冲突/死循环。** Loop Engineering 社区有一个案例：开发者搭建了 24 小时无人值守的 Agent 流水线，但因为多个 Skill 关键词重叠，子 Agent 互相触发——A 触发了 B，B 的输出又触发了 A——单条任务消耗 1000 万 Token，月预算超 30 倍，账号被封。

这不是孤例。Skill 数量越多，触发碰撞率越高。掘金作者实测：加了 `exclude_intents` 字段做硬排除后，碰撞率能降 67%——但这也说明问题确实存在，而且严重。

压缩 Skill description 是一种缓解手段。有开发者提出"30 词路由器原则"：每个 Skill description 最多 30 词，只写触发条件，不写废话。这样 100 个 Skill 的索引消耗从约 8000-12000 tokens 降到了约 3000-5000 tokens，省了 60%。

但压缩解决不了根本问题。根本问题是：**Skill 不是安装越多越好。**

## 安全问题不是危言耸听

2026 年 SaaStr 大会上有个案例流传很广：SaaStr 创始人 12 天内吼了 11 次"别动生产环境"，Replit 智能体还是删了线上数据库，并伪造了 4000 条假数据来掩盖操作痕迹。

周鸿祎后来评论这件事时说了一句话："自然语言的灵活性，代价是自然语言的不确定性。"

你写"务必核查"，模型可能真查，也可能张口就编。Skill 本质上是自然语言指令，缺乏编译期检查、类型系统、运行时沙箱。不知名来源的 Skill 里可能包含恶意内容——权限提升提示词、数据回传指令——你根本看不出来。

Matt 的 Skill 是开源、可审计的，而且体量小，扫一眼就能知道在做什么。这是个重要的安全基线：**只装你看得懂的 Skill。**

## 这套东西不完美

Matt 的实践有明显偏向：TypeScript/Node.js 生态。Husky、GitHub Issue、JavaScript 测试工具——如果你用 Go、Rust 或者 Python 的 Django，很多工具链需要自己适配。

GitLab 用户也是一样，`to-issues` Skill 要改成对接 GitLab Issue API。这不是改两行配置的事，是你得理解 Skill 的意图，然后重写实现。

另一个更深的差异：团队流程 vs 个人流程。Matt 的 Skill 是为他个人工作流设计的——CONTEXT.md 存个人偏好，ADR 记个人决策，想改就改。但团队场景下，CONTEXT.md 需要多人共享、版本管理，ADR 需要有审批机制，改一个 Skill 可能影响全组的 AI 行为。可以参考，不能照搬。

ECC 覆盖面广，但体量重？用 Matt 的。Matt 的限制多但精准？加几个 ECC 的通用 Skill 做补充。这不是二选一。

国内的 WorkBuddy、CodeBuddy 已经支持自定义 Skill 系统，DeepSeek、Qwen 的中文理解能力可能比 Claude 更适合某些中文场景的 Skill 设计——这些都是变量，不要因为 Matt 用 Claude Code 你就一定要用 Claude Code。

## 怎么落地

如果你看完想试，我给几个可以立刻动手的建议：

**1. 从 `tdd` 和 `triage-issue` 开始。** 这两个 Skill 覆盖"写代码"和"修 bug"两个最高频场景，而且见效快——你今天装，明天就能看到 AI 行为的变化。

**2. 第二个加 `ubiquitous-language`。** 在你团队的 CONTEXT.md 里维护一份术语表。不是给 AI 看的，是给你和 AI 共同遵守的。花 15 分钟定义 10 个核心术语，能避免几十个小时的沟通偏差。

**3. `git-guardrails` 必须装。** 不管你用不用其他 Skill，这一个是底线。AI 没有"危险"的概念——它只是一个概率模型，不知道 `DROP DATABASE` 的后果。

**4. Skill 总数控制在 10-15 个。** 别贪。每装一个新的，先问自己：这个 Skill 的触发频率有多高？和其他 Skill 有没有关键词重叠？它的描述能不能压缩到 30 词以内？

**5. 团队级管理 Skill。** 如果你在团队里推，把 Skill 文件放进 Git 仓库，设 CODEOWNERS 做变更审批。让 Skill 也走 CR 流程——不只是一个 Markdown 文件，它等于团队 AI 使用规范。

一句话总结：AI 编程最大的瓶颈不是产能，是你对它的控制力。Matt Pocock 这套 Skill 给了你一个可落地的规则清单。但规则是死的，你得自己去判断哪些适合你的项目、你的团队、你的技术栈。

---

## 参考资料

1. [mattpocock/skills - GitHub](https://github.com/mattpocock/skills)
2. [ECC - GitHub](https://github.com/affaan-m/ECC)
3. 《程序员修炼之道》（The Pragmatic Programmer）, David Thomas & Andrew Hunt
4. 《领域驱动设计》（Domain-Driven Design）, Eric Evans
5. 《软件设计哲学》（A Philosophy of Software Design）, John Ousterhout
