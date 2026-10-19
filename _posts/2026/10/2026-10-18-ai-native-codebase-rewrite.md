---
title: 你的代码库要为 AI 编程重写一遍
author: 唐悦玮
date: 2026-10-18 09:22:00 +0800
categories: [AI编程, 工程实践]
tags: [AI编程, AI原生, 代码库重构, 模块边界, 类型标注, 工程实践, Agent友好, 上下文]
pin: false
comments: true
image:
  src: /imgs/202610/2026-10-18-ai-native-codebase-rewrite.png
keyword: AI原生代码库, 代码库重构, AI编程, 模块边界, 类型标注, 契约文档, Agent友好, 工程实践
---

> **摘要**：代码库一直是为人写的。Agent 进来后多了一类读者：它不脑补，只看得见上下文里那一角。本文聊怎么把边界、契约和隐性知识重写进代码本身，让仓库自己长成 Agent 能干活的样子。

你让 Agent 改个小需求：给报表模块加一个导出字段。它在仓库里转了十分钟，最后把逻辑写进了一个几乎同名的方法——那个方法属于隔壁模块。你看着 diff 哭笑不得：模型明明不笨，怎么净往坑里跳？

先别急着怪模型。换你自己进一个陌生仓库，第一件事也是找哪个文件管哪块。你能找对，是因为你会脑补：看到 `calculate_total`，你猜得出它跟价格和税有关；看到目录叫 `billing`，你知道付款逻辑八成在这。这套脑补能力，Agent 没有。

问题在于：**你的代码库，人写的，有的没有注释，有的注释和跟实际对不上。**

## Agent 读代码，跟你不是一回事

过去三十年，软件工程的所有默认设置都围着人脑转。文件夹按人的习惯分，注释写给接手的同事看，抽象层是为了让人脑一次少记几个概念。ShShell 那篇讲 Repository Intelligence 的文章把这个局面说得很准：传统仓库里的命名、目录、注释，服务的都是「一次只能装下几个概念的人脑」，甚至还有那种省行数但藏意图的聪明代码——人看着都要愣一下，Agent 更看不懂。

Agent 是怎么读的？它不脑补，只看得见被塞进上下文的那一小角。一个百万行的单体仓库，对它是大片大片看不见的黑：它能看见正在改的文件，看不见五个目录之外那个会被这次改动连累的遗留模块。ShShell 给了一个数：Agent 把九成精力花在「找业务逻辑在哪」，只剩一成花在真正干活上。

你可能会说，上下文窗口不是越做越大了吗。确实在变大，但塞进去不等于用得上。NVIDIA 的 RULER 基准测过一个扎心的数：模型的有效上下文，往往只有标称窗口的 50% 到 65%。窗口再大，注意力也摊不平。

那怎么办？这就是今年越来越多团队在做的事：**把代码库按 Agent 的读法重写一遍。**

![人读代码靠脑补，Agent 只看得见一小角](/imgs/202610/2026-10-18-ai-native-codebase-rewrite-infographic-1.jpg)

## 补文档、写规则文件，为什么都不是答案

直觉一：给 Agent 补文档。方向对，但它有个致命弱点——会漂移。今年一份工程手册里的 ADR 分析把这层窗户纸捅破了：写在函数旁边的 docstring 跟代码打架，import 的时候就会暴露；可一份独立维护的文档跟代码打架，能静默通过所有 CI 检查，没人发现。文档是复印件，代码才是原件，复印件迟早过期。

直觉二：写规则文件。AGENTS.md 这类约定确实火，开源仓库里已经铺了六万多个。可它的天花板摆在那：Anthropic 自己的建议是 CLAUDE.md 别超 200 行，再长遵循率明显掉；Codex 默认读 AGENTS.md 到 32KiB 就停。更扎心的是网站侧的 llms.txt——Ahrefs 实测，约三万八千个发布了这份文件的域名里，97% 的文件从来没有被任何 AI 爬虫抓取过。你精心写的说明书，读者根本没翻开。

这两个直觉都错在哪？错在把「让 AI 看懂」当成加一层说明的事。说明是路标，路还是那条烂路——路本身不改，路标插得再多，Agent 该迷路还迷路。

正解是把力气花在代码自己身上：**让边界、契约、隐性知识长进代码的结构里，仓库自己会说话。**

## 第一刀：把边界画在明面上

先看一个最常见的坑。同一个业务对象，auth 服务里叫 `User`，账单服务里叫 `Account`，CRM 里叫 `Client`。人没问题，知道是一个东西；Agent 会在某个下午把它们当成三个东西，给你幻觉出一个跨系统同步的 bug。命名统一不是洁癖，是在给 Agent 铺语义地图。

目录也一样。Short and Clear 那篇文章给了个好对照：`src/services/user_service.py` 是给人看的分层习惯，`src/billing/calculate_invoice_use_case.py` 是让 Agent 一眼定位的喊名法——目录名直接喊出业务。它管这叫 Screaming Architecture：让仓库结构自己喊出「这个系统是干嘛的」。

边界画清楚还有个额外好处。六边形架构里，业务核心只暴露端口，数据库、外部服务都是可替换的适配器。你让 Agent 给订单处理加一个 MongoDB 的适配器，它照着端口接口生成就行，核心业务规则碰都不用碰——边界就是护栏。

这里有个反直觉的地方，值得单独说。AI 友好的代码，是拆得更碎吗？恰恰相反。人为了让人脑省力，习惯把一个概念拆成工厂、策略、适配器五层，每层一个文件。对模型来说这是跳转税：每跳一次，就多烧一份上下文。一个概念完整、边界清楚的高内聚文件，比硬拆五层更容易被读懂。真正该留的规矩就一条：有真实的多实现时再做抽象，别为想象中的未来预留。

## 第二刀：让编译器和测试替你管教它

改代码这件事上，编译器是 Agent 最好的师傅。强类型底下，Agent 生成的调用缺了参数、类型对不上，编译器把行号列号精确报出来，它自己读报错、自己改，全程不用回来烦你。类型系统把模型的搜索空间框住了——它不再凭语感猜，只能在契约里动。这就是为什么 strict 模式下的 TypeScript、Go、Rust 项目里，Agent 的产出明显更稳。

没有类型可依赖的动态语言怎么办？用契约注释补。今年有团队把一条规矩写成了架构决策：每个源文件开头，用该语言原生的文档格式回答四个问题——这个文件做什么、明确不做什么、公开接口是哪些、不显然的设计决策为什么这么定。Agent 动手前先读契约，就能少踩「把有意为之的设计当 bug 修掉」这种坑。

测试的价值也换了位置。`test_should_reject_order_when_credit_limit_exceeded` 这个测试名，本身就是一行行为规格，比任何注释都精确地告诉 Agent「超额订单该被拒绝」。ShShell 那句话说得狠：没有测试的代码库，对 AI 是隐形的。顺带一个趋势数据：New Relic 的 2026 报告里，78% 的团队已经习惯在 prompt 里要求把日志和埋点直接写进 AI 生成的代码——可观测性不再是人写完再补的工序，成了生成时的一部分。

## 第三刀：把隐性知识搬进代码

你的项目里一定有这种知识：这个模块容易出事，动它之前先跑全量回归；这个字段看着能删，其实下游有个报表在偷着用；这条链路当年重构踩过坑，别按教科书的方式改。这些全在老员工的脑子里，代码里一个字都没有。

对人类团队，这叫传帮带。对 Agent，这是真空——它每次进项目都是全新人，没有茶水间，没有老同事，只有文件里写没写。你不把知识搬出来，它就只能靠猜，猜错就是开头那个改错模块的故事。

但搬有搬的规矩。记忆文件不是越多越好，它只该装代码表达不了的东西：历史决策、跨系统协议、踩坑记录。能从类型和结构推出来的，就别重复写——写多了文件膨胀，膨胀了遵循率掉，又回到 200 行红线那个问题。隐性知识显性化是好事，把显性知识再抄一遍是给上下文交税。

![给代码库动三刀：边界、契约、隐性知识](/imgs/202610/2026-10-18-ai-native-codebase-rewrite-infographic-2.jpg)

## 老仓库别推倒，改到哪补到哪

看到这你大概想问：几十万行的老项目，难道要停下来重写半年？不用，这事可以渐进。

有现成的迁移策略可以抄：新建的文件立即按新规矩来，存量文件改到哪个补哪个。三个月下来，最常被改的那批文件就都合规了——而那批文件恰恰是 Agent 最常碰的，投入产出比最高。

施工队都是现成的，就是 Agent 自己。命名统一、类型补全、函数拆分这类活，人做起来枯燥，AI 做起来又快又稳。有开发者拿它重构一个三年老项目的核心模块，代码行数少了四成，单测覆盖率从 30% 拉到 85%。但有一条纪律别破：让它先列清单、你确认、再批量改。一句「自动全改」下去，它漏掉的隐含状态依赖会让你修到怀疑人生。

哪些仓库值得花这个力气？判断标准很简单：Agent 触碰的频率。天天让 AI 改的模块，值得第一个改造；一年没人动的角落，放着就好。重写是给高频读者修的路，不是给荒地铺的铁轨。

![老仓库渐进迁移：新文件先合规，改到哪补到哪](/imgs/202610/2026-10-18-ai-native-codebase-rewrite-infographic-3.jpg)

## 小结

你的代码库多了类不脑补的读者，它九成精力花在找路上——这不是模型的 bug，是仓库的债。补文档和写规则文件都是路标，真正的路是把边界、契约、隐性知识长进代码结构：命名统一、目录喊业务、类型框搜索空间、测试当规格、知识只搬代码装不下的。老仓库不用推倒，改到哪补到哪，让 Agent 修它自己要走的路——但批量改动前，先让它列清单，你点头。

## 参考资料

- [Making Your Codebase Legible to AI: Repository Intelligence（ShShell）](https://shshell.com/blog/repository-intelligence)：Agent 90% 精力用于定位、命名不一致引发幻觉、无测试即隐形。
- [AI-Driven System Architecture 2026（The Vibelog）](https://thevibelog.dev/blog/ai-driven-system-architecture-2026)：类型契约作为 Agent 自纠错回路、四大支柱。
- [AI Native 架构：有限上下文、确定性边界与质量闸门（51CTO）](https://blog.51cto.com/aioldsix/14707702)：高内聚优于硬拆五层、有真实多实现再抽象、隐性知识显性化分层。
- [ADR-26045: AI-Native Development — Code as Primary Documentation（Soviar Systems）](https://soviar-systems.github.io/ai_engineering_handbook/adr-26045-ai-native-development-code-as-primary-do)：文档漂移机制、契约注释四问、渐进迁移策略、NVIDIA RULER 有效上下文 50–65%。
- [Agent instruction file (AGENTS.md, llms.txt)（Data Panda）](https://datapanda.eu/en/dictionary/agent-instruction-file-agents-md-llms-txt)：AGENTS.md 六万仓库、CLAUDE.md 200 行建议、Codex 32KiB 截断。
- [What Is AGENTS.md?（llms-txt.io）](http://llms-txt.io/blog/what-is-agents-md)：GitHub 分析 2500+ 仓库，可执行命令胜过含糊散文。
- [The agent-interface tracker（agentinterface.app）](https://agentinterface.app/tracker)：Ahrefs 实测约 3.8 万域名发布的 llms.txt 中 97% 从未被 AI 抓取。
- [Future-Proofing Your Code（Short and Clear）](https://www.shortandclear.de/?p=292/)：Screaming Architecture、六边形端口适配器、测试即规格。
- [AI 时代的代码重构该怎么做（CocoLoop）](http://www.cocoloop.cn/t/topic/1322/3)：三年老项目重构实测，行数 -40%、覆盖率 30%→85%、先列清单再批量改。
- [AI-Generated Code Grades Higher in Review, Yet Triggers Rise in Production Incidents（DEVOPSdigest，引 New Relic 2026 报告）](https://www.devopsdigest.com/ai-generated-code-grades-higher-review-yet-triggers-rise-production-incidents)：78% 团队要求把遥测埋点写进生成的代码。

