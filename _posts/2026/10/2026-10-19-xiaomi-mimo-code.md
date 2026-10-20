---
title: 小米的 Coding Agent 开源了
author: 唐悦玮
date: 2026-10-19 08:38:00 +0800
categories: [AI编程, 工程实践]
tags: [小米, MiMo Code, Coding Agent, AI编程, 开源, Agent工程, 持久记忆, 国产工具]
pin: false
comments: true
published: false   # <-- 加上这一行，审核期间暂时隐藏
image:
  src: /imgs/202610/2026-10-19-xiaomi-mimo-code.png
keyword: 小米MiMo Code, Coding Agent, AI编程助手, 开源, MiMo-V2.6, 持久记忆, Agent工程, 国产工具
---

> **摘要**：小米开源了终端编程助手 MiMo Code，底座 MiMo-V2.6 拿下 AA 指数 46 分、开源第一。本文拆它的三条路：模型与 Harness 一起养、记忆外包给子代理、便宜不锁死你。

你终端里的 AI 编程工具，大概已经换过好几轮了。2026 年 10 月中旬，名单又多了一个，来头有点意外：小米。MiMo Code V0.1.0，MIT 协议，基于开源项目 OpenCode 二次开发，界面全程中文。你在自己的终端里敲一行安装命令，它就安装好了。

Coding Agent 这条赛道早就挤满了人：Claude Code、Codex、Cursor、Qoder、codebuddy...小米这时候进场，图什么？

把工具和它的 MiMo-V2.6 系列模型连起来看，答案就出来了：模型、订阅、工具，小米想收的是一整条链。

## 先看榜单

Artificial Analysis 综合智能指数里，**MiMo-V2.6-Pro 拿了 46 分，超过 Kimi K3 和 Qwen3.8 Max，是当前最强的开源模型**——这是小米官方发布页的原话，榜单图他们也大大方方贴了出来。

![Artificial Analysis 智能指数对比：MiMo-V2.6-Pro 以 46 分居开源模型首位（图源：小米 MiMo 官方新闻页，数据：Artificial Analysis）](/imgs/202610/2026-10-19-xiaomi-mimo-code-aa-chart.jpg)

榜单里排在它前面的清一色闭源：Claude Fable 5.1、GPT-6 Astra、Claude Opus，都是 53 分。开源阵营登了顶，不等于全场登顶——这层差距小米自己也没回避，官方原话就是「与最强的闭源模型相比，仍有差距」。

价格这一侧倒是真有底气：V2.6 沿用 V2.5 的 API 定价，智能涨了、价格没动，官方算账说同等智能下价格只有海外模型的 1/20 到 1/60 。V2.5 和 V2.5-Pro 将于 **2026 年 10 月 21 日 10:00 下线**，你手里还配着的话，记得切 V2.6。

## 模型和 Harness，一起养

多数 Coding Agent 的思路，是拿一个通用框架套任意模型。小米的路子更野：模型和 Harness 放在一起养。

训练侧就有体现。V2.6 的强化学习用了 Multi-Harness Training——同一批任务混着多个框架跑，官方的说法是让模型在没见过的框架上也能打。他们连极简的 mini-harnesses 都开了源，系统提示、工具、上下文管理拆开，随便组合。Harness 不是模型的外壳，是训练材料的一部分。

花钱也看得见诚意：六天 Live RL 训练，Pro 版烧了约 262 万美元，DeepSWE v1.1 从 58.4 涨到 72.6。到了工具侧，MiMo Code 给自家模型做专属调优，厂商口径说同样的模型，在 SWE-Bench Pro V2 和 Terminal Bench 2 上比原版 OpenCode 高 5 分。

同一个模型，换个框架成绩就变，凭什么？这组数据给了一个注脚。数字是自报的，你姑且听之，思路值得记住：**工具不是模型的容器，是模型的放大器**。

配套的 Compose 模式按一下 Tab，给它一个想法，它自己走完设计、规划、编码、测试、审查。成色等你实测，方向跟今年的行业观察一致：模型的聪明程度在见顶，工程配套的差距在拉开。

## 记忆这件事，不赌模型自觉

长会话丢状态，是所有 Coding Agent 的老毛病。你上一次因为模型忘了事而返工，是什么时候？多半就这几天。聊到第五十轮，它把前面定好的方案忘干净了，从头再来。现在主流的补救是让模型自己记笔记：重要的事写进磁盘文件，下次会话再注入。此前拆 Claude Code 时说过，它的长期记忆靠 CLAUDE.md 和 MEMORY.md 这类文件层扛着。

MiMo Code 换了个思路，官方的说法很直白：不赌模型自觉，用工程把它兜住。主 agent 专心干活，记录这件事整个外包——由一个独立的子代理自动保存状态，拆成项目记忆、会话检查点、任务进度三层；窗口快满时，重建一份干净简报，主 agent 接着干，不用从头再来。

那简报重建会不会丢信息？重建本身就是一次有损压缩，丢多少、什么场景丢，目前没有第三方数据，得靠实测说话。不过把「记笔记」从模型的自觉变成系统的职责，这个方向是对的：指望记性，不如指望流程。

![记忆外包：主 Agent 干活，子代理记笔记，窗口快满重建简报](/imgs/202610/2026-10-19-xiaomi-mimo-code-infographic-1.jpg)

## 便宜，而且不锁死你

接入面给得很宽：DeepSeek、Kimi、GLM 都能接，也支持第三方 Token Plan；生态上兼容 OpenCode、Claude Code 这些主流工具链。你可以把 MiMo Code 当 MiMo 模型的专属座驾，也可以把它当通用终端外壳，接别家的模型用。

订阅按 Credits 计费，四档套餐每月 39 元到 659 元；新出的 MiMo Desktop 客户端配了 UltraSpeed，最高 20 倍推理速度。定价在国产工具里属常规操作，你该看的是姿态：MIT 协议意味着下载、修改、二次分发都没门槛，连六天 RL 的任务环境、训练框架、技术报告都全量开源。背靠手机大厂的团队把底牌全开，图的显然不是订阅费。

前面这三件事摊在一张图上，是这样的：

![小米的三张牌：模型与 Harness 一起养、记忆外包、便宜不锁死](/imgs/202610/2026-10-19-xiaomi-mimo-code-infographic-2.jpg)

## 先把丑话说完

跟闭源旗舰还差七分，实战里这可能就是能用和好用的距离。还有一条：MiMo Code 是 V0.1.0 的探索性产品，目前 Mac 和 Linux 可用，成熟度要打折。数据口径也是个坑：比肩 Claude Sonnet 4.6、评测高 5 分，都是厂商自报，独立复测还得等。顺带一句，限时免费、UltraSpeed 都是获客手段。

推荐进场姿势：当参考实现来研究，别当生产主力。

## 实际上手

内置模型限时免费，装一个就能玩；想换工具外壳的，MIT 加工具链兼容，迁走不心疼；想研究 Agent 工程的，记忆外包、混框架训练都是现成的开源参考——把持久记忆做成工程机制，光这思路就值得去试试。

模型单价被打下来之后，光卖模型赚不到溢价，能锁住开发者的只剩工具链。**谁的 Agent 先住进你的终端，谁的模型就多一个出口**。

## 结论

国产 Coding Agent 又多了一个带模型、带订阅、带开源协议的整套玩家，混框架养模型、记忆外包。不过：V0.1.0 的成熟度、自报口径的数据、七分的闭源差距。去亲手跑一遍，试试看吧。

## 参考资料

- [MiMo-V2.6：扩展强化学习规模，迈向自我提升（小米 MiMo 官方新闻页）](https://mimo.mi.com/docs/zh-CN/news/latest/v2-6)：AA 综合智能指数 46 分、开源阵营登顶、6 天 Live RL 训练成本与 DeepSWE 提分、Multi-Harness Training、mini-harnesses 开源、UltraSpeed、1/20–1/60 价格口径。
- [MiMo Code 发布并开源 | 模型 Agent 协同优化（小米 MiMo 官方）](https://mimo.mi.com/docs/zh-CN/news/latest/mimocode)：V0.1.0 发布说明、持久记忆三层机制、Compose 模式、专属 Harness。
- [Xiaomi MiMo-V2.6 系列 3 款全新模型正式发布（小米 MiMo 官方订阅页）](https://mimo.mi.com/docs/zh-CN/tokenplan/subscription)：V2.5/V2.5-Pro 于 2026-10-21 10:00 下线、Token Plan 四档定价、兼容 OpenCode/Claude Code 工具链。
- [MiMo-V2.5 模型页（Every Local AI，引 Artificial Analysis 数据）](https://everylocalai.com/model/mimo-v2-5)：V2.5 智能指数 25.2、混合价格约 0.18 美元/百万 token、τ²-Bench 90.6%。
- [MiMo-V2.5 vs Gemini 3.8 Flash vs Nemotron 3 Ultra（AgentBreaking）](https://agentbreaking.com/compare?m=xiaomi--mimo-v2.5&m=google--gemini-3.8-flash&m=nvidia--nemotron-3-ultra-550b-a55b)：V2.5 排名 60/181、比 Gemini 3.8 Flash 便宜 88%、1.05M 上下文。
- [小米发布并开源 MiMo Code：界面全汉化（快科技转载）](http://www.hqwc.cn/a/1356991.html)：SWE-Bench Pro V2、Terminal Bench 2 较原版 OpenCode 高 5 分（厂商口径）、Mac/Linux 支持、全中文界面。
- [小米(01810.HK) 发布及开源探索性 AI 编程助手 MiMo Code（阿斯达克财经）](https://www.aastock.tw/tc/stocks/news/aafn-con/NOW.1528573/ipo-news/AAFN)：MIT 协议、OpenCode 二次开发、「性能比肩 Claude Sonnet 4.6」厂商口径出处。

