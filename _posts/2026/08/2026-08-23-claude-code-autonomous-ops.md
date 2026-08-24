---
title: "388 个 PR：AI 自主运维实测"
author: 唐悦玮
date: 2026-08-23 09:50:00 +0800
categories: [AI编程, 运维自动化]
tags: [Claude Code, AI运维, 自主Agent, Loop Engineering, 代码维护]
pin: false
comments: true
keyword: Claude Code, AI运维, 自主Agent, 388 PR, Loop Engineering, 代码维护
---

> **摘要**：Claude Code 负责人 Boris Cherny 做了个实验——让 Claude 通过一个 Slack 频道每天自主维护 Anthropic 的六个端，几周开了 388 个 PR、合并 180 个。本文拆开这套"自动驾驶式运维"的 12 个 routine、46% 合并率背后的真实含义，以及它到底接管了什么、没接管什么。

---

半夜被报警叫醒，爬起来清一堆重复告警——这种活儿没人爱干，但没人干就会烂。Boris Cherny 想了个办法：让 Claude 自己干。

结论先放这：实验跑通了，但跑通的边界很清晰。AI 接管的是"量"，不是"责"。这句话后面会反复出现。

## 实验长什么样

2026 年 8 月 14 日，Claude Code 的负责人 Boris Cherny 在 X 上分享了一个已经运行数周的内部实验。他建了一个 Slack 频道，名字很直白：`proj-claude-maintains-apps`。Claude 通过 Anthropic 的 Tag（在 Slack 里跑 Claude 的工具）接进这个频道，每天按既定节奏跑一批"维护 routine"，覆盖 iOS、Android、desktop、Web、CLI 和 Agent SDK 六个端[1]。

注意这里的形态：不是人坐在聊天框前一句句发指令，而是**频道 + 定时触发 + 限定仓库**，Claude 自己发现问题、改代码、跑测试、开 PR，工程师只处理到审查口的结果。提示词朴素到让人意外——Cherny 给的崩溃巡检指令就是大白话：

```text
lets start new daily routines for crash fuzzing ios, android,
and desktop apps e2e. make routines for each that use workflows
to run the real apps (no mocks) and fuzz them to trigger crashes,
then put up fix prs for those crashes. each pr must run /verify
and post a repro and truth table to the pr.
```

没有精巧的 prompt 工程，没有层层封装。这恰恰说明重点不在"怎么说"，而在"让谁在什么时候、什么边界内反复跑"。

![自主运维闭环](</imgs/202608/2026-08-23-claude-code-autonomous-ops-pipeline.png>)
*实验跑起来后，Claude 每天就是沿着这条链路把脏活包圆了。*

## 12 个 routine：都是没人想干的机械活

Cherny 列了大约一打维护任务，每一个都对应工程团队"知道重要、就是一直拖"的那类工作。挑几个有代表性的：

- **Crash Fuzzer**：在模拟器里打开真实 app（不用 mock），随机乱点触发崩溃，根因分析后提 fix PR。相当于一个永不疲倦的 QA。
- **Dup Unifier**：扫代码库里"相似但略不同"的抽象，提议合并。这是教科书式的技术债。
- **Dead-Code Remover**：删静态分析确认不可达的代码；对"可疑但拿不准"的，先插一行 log，第二天回看确认这条路径真的没人走，再删。这个"先观察后行动"比直接盲删安全得多。
- **Flaky-Test Fixer**：诊断并修不稳定的 CI 测试。
- **Abstraction Police**：修架构层违规（layer violations）——接口本该藏住的实现细节漏出来了。

剩下的还有 Logic Simplifier、Logic Bug Fixer、Useless Test Pruner、Shipped-Feature Inliner、Abstraction Improver、Ant-only Shipper 等[1]。共性是：**低风险、高重复、有明确对错标准**。这正是 agent 当前最稳的发挥区间。

![12 个 routine 分类](</imgs/202608/2026-08-23-claude-code-autonomous-ops-routines.png>)
*挑完有代表性的，其余的都可以归到这六类里——共性是低风险、高重复、有明确对错。*

## 数字背后：46% 不是模型准确率

几周下来，这套 routine 在 Anthropic 各仓库开了 **388 个 PR**，其中 **180 个**经过 Claude Code Review 加人工审核后合并，合并率约 **46%**。Cherny 自估生成改动里大约 **1/50 是噪声**[2]。

但 46% 这个数字容易被误读成"模型一半时候不对"。其实不是。它是个**审查漏斗**的出口：候选提交天然要多于实际合并，因为有些还在排队没审、有些被判定没必要、有些和其他修改重复。Cherny 自己澄清，那 208 个没合并的，很多只是"还没审到"[2]。

真正该看的不是合并率，而是**闭环是否成立**：一个机器，没人逐条催，自己持续产生候选修复，并且大部分一次就对。Cherny 说 Claude 通常第一次就能开出正确的 PR；不对的时候，团队不去手改那个 PR，而是**调 routine 的定义**，让明天的运行更准——虽然调参有时要几天[1]。

## 为什么能成：是 Infra，不是模型

多个来源点出了同一个判断：388 个 PR 看着像模型新闻，其实是**基础设施新闻**[3]。

决定成败的不是某次对话多聪明，而是三件事：触发机制（每天自动跑）、约束边界（限定仓库与环境）、验收标准（PR 必须过 /verify、附 repro 和 truth table）。把这三件钉死，模型换 Opus 干大多数、Fable 干少数难的、Sonnet 也能干但要多审计，差异只是成本，不影响机制成立[2]。

这正呼应 Cherny 的另一句表态——"我不再向 Claude 写提示词了，我写循环，让循环去提示 Claude。我的工作变成了设计循环。" 业界有人把这个叫做 **Loop Engineering**：人从方向盘后走下来，去设计那个会自己开的东西[3]。

## 边界与代价：接管的是量，不是责

这部分必须说清，否则就是另一种夸大。

**第一，46% 合并率意味着超一半被拒，人工兜底仍是最后闸门。** 这不是 bug，是机制的一部分。aiinsiders 算过一笔账：如果拒一个 PR 只要 30 秒，那 388 个候选里筛掉大多数仍是净增益；但如果每个拒绝都需要像审同事代码一样细审，这笔账就不一定好看了——208 个被拒 PR 到底消耗了多少 reviewer hours，原报告没说[4]。

**第二，这是 AI coding agent 能面对的最宽容测试。** 自己模型跑自己仓库、被最懂这个模型习惯的工程师审、挑的还是低风险的维护活。能不能直接外推到"陌生系统 + 不了解模型的团队 + 高风险的改动"，这份报告给不出证据[4]。

**第三，自主运维放大了攻击面。** 今年 6 月微软就发现，Claude Code 的 GitHub 自动化流程存在凭证泄露漏洞——攻击者把注入指令藏在 HTML 注释里（GitHub 界面不可见，但读源码的模型能识别），无需改库权限，只提交一条工单就能骗机器人代为执行、窃取 API 密钥。Anthropic 已在 5 月 5 日 2.1.128 版本修复，但"自主 + 有写权限"的组合本身就是新风险面[5]。

**第四，和更大的趋势对得上。** Faros 的数据里有个反直觉的点：高 AI 渗透团队产能涨了 33.7%，但每周部署频次反而降了 11.7%——瓶颈从"写慢"转移到"审不过来"，代码审查等待时长暴涨 441.5%。AI 一秒能开十条 PR，审的人还是你一个[6]。388 的实验和这个数据说的是同一件事：产能可以无限堆，审查能力才是新的瓶颈。

## toB 落地的三个前提

把这套搬到国内 toB 团队，关键不在"能不能跑"，而在"敢不敢合"。三个前提：

1. **门禁前置**：别等 AI 提了 388 条 PR 再去堵。本地 SAST、CI 里的测试卡点先跑一遍，让机器先筛机器写的代码，人工只审"人该审"的部分。
2. **需求上游多花 30% 时间**：模糊需求喂进去，产出就是 861% 的无效代码（Faros 数据）。把需求拆细、边界定死，agent 才不跑偏。
3. **守住底层判断力**：再先进的 agent 也替代不了你对底层组件的理解——知道什么时候**不用** AI，本身才是核心竞争力。

WorkBuddy、qoder 这类工具的自动化能力，正是往这个方向走：把重复运维编排成可复用的 routine，人退到验收位。

## 收尾

Cherny 把结果叫"early signs of life"——早期生命体征，不是毕业典礼。措辞很克制，值得学。

回到开头那句话：AI 接管的是"量"，不是"责"。脏活累活它包了，验收闸门和架构判断还在你手里。半夜报警会不会再来？大概率会少很多——但真出事，板子还是打在工程师身上。这账，从一开始就该算清楚。

---

**参考资料**

[1] The Decoder, "Claude Code now runs daily maintenance on Anthropic's software with a 46 percent merge rate" (2026-08-14)：https://the-decoder.com/claude-code-now-runs-daily-maintenance-on-anthropics-software-with-a-46-percent-merge-rate/

[2] Augmenter.dev, "Claude's Slack-based maintenance agent opened 388 PRs in weeks"：https://augmenter.dev/articles/claudes-slack-based-maintenance-agent-opened-388-prs-in-weeks-1786915642252

[3] yage.ai, "An Alarm Clock and an Acceptance Check Can Maintain a Codebase" (2026-08-16)：https://yage.ai/share/alarm-acceptance-maintenance-en-20260816.html

[4] AI Insiders, "Anthropic's Claude Code merges 46% of its own maintenance PRs" (2026-08-14)：https://aiinsiders.net/article/anthropics-claude-code-merges-46percent-of-its-own

[5] IT之家, "微软警告称 Claude Code 存在漏洞，可能导致 GitHub 账号凭证泄露" (2026-06-07)：https://www.ithome.com/0/960/994.htm

[6] 头条号"请喊我威哥"对 Faros 数据的转述 (2026-08-20)：https://www.toutiao.com/article/7675910365422617131/
