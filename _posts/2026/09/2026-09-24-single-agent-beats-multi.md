---
title: 单 Agent 能干的活，别上多 Agent
date: 2026-09-24 09:02:00 +0800
categories: [AI编程, 工程实践]
tags: [AI编程, 多Agent, 成本, 错误放大]
---

> 摘要：2026 年多 Agent 编排很热，但多数团队只算了能力账，没算成本账。本文用几组可查的基准数字说明：多加 Agent，准确率往往只多几个百分点，token 却翻几倍，错误还会沿交接链放大。07-25 那篇聊了"什么时候该开舰队"，这篇聊"开了之后，账怎么算"。拿不准时，先给一个 Agent 同等总预算试一次，再决定要不要拆。

## 先算准确率账：多加 Agent，多不了几点

多 Agent 最常被引用的卖点是"准确率更高"。把账摊开看，这个增益比想象中小。

sunilprakash 在 2026-03 用 gpt-4o（温度 0）在同一组 30 道带引用要求的问答上，对比了工作流、单 Agent、多 Agent 三种架构：多 Agent 通过率 66.7%，单 Agent 63.3%，只多 **3.4 个百分点**，但成本是单 Agent 的 **2.4 倍**，端到端延迟是 **2.2 倍**。多 Agent 的优势几乎全部来自"对比类"和"跨文档综合类"题目，其他类别上它和单 Agent 打平，却白花 2.4 倍的钱。

更扎心的是 Stanford 的反证。Tran 和 Kiela 在 arXiv:2604.02460 里做了一件事：给单 Agent 和多 Agent **完全相同的总思考 token 预算**。结果多 Agent 那点"优势"直接消失——单 Agent 准确率反而更高，算力还更省。原因很简单：此前几乎所有"多 Agent 赢"的基准，都默许多 Agent 多烧 2 到 4 倍的推理 token。尺子本身就不准。

一句话收住：多 Agent 的"强"，有一部分是用钱买来的；把预算拉平，它并不比单 Agent 聪明。

Princeton NLP Group 也给出过一个常被引用的结论：在工具和上下文对等的前提下，单 Agent 在 **64%** 的基准任务上持平或超过多 Agent。

![单 Agent 与多 Agent 的准确率成本对比](/imgs/202609/2026-09-24-single-agent-beats-multi-infographic-1.jpg)

## 再算 token 账：协调税吃掉三分之一

多 Agent 的 token 不是简单相加，而是每次交接都要重述上下文。

Anthropic 在工程复盘里提到，多 Agent 系统的 token 消耗约为普通对话的 **15 倍**。2026 年一些生产 fleet 的链路追踪显示，多 Agent 系统总 token 里大约有 **37%** 花在协调开销上——不是干活的 token，而是传上下文、重建状态、给没有记忆的 Agent 重新 brief。单 Agent 没有这道税，因为它整个任务都背着同一个上下文窗口。

换句话说，你以为在买"并行"，实际在买"反复互相同步"。

落到 Java 后端，这道税很具体：一个 Spring Boot 服务把任务拆给五个远程子 Agent，每次交接都要把共享上下文序列化再发一遍，账单和延迟都涨在你看不见的地方。

## 最危险的账：错误会沿交接链放大

这是多 Agent 真正该警惕的地方，单 Agent 没有这类故障模式。

Google DeepMind 的研究给出过一个被广泛引用的量化：去中心化多 Agent 的错误放大倍数是 **17.2 倍**，即便带中心协调的架构，错误也会被放大约 **4 倍**。机制很清楚：Agent A 产出 10% 错误率，Agent B 把 A 的输出当输入且不独立校验，直接继承并叠加；到用户手里时，原始的小错误已经变成大故障。

CMU 和 UC Berkeley 分析 7 个多 Agent 框架的 1642 条执行链路，失败率从 **41% 到 86.7%** 不等。还有研究跟踪 800 多条工作流，发现跨 Agent 交接约 7 次后会进入一个明显的退化相变——每轮交接只保留约 92% 的准确度，误差是指数级累积，不是线性。

这解释了为什么很多多 Agent 系统"看起来在跑，实际在悄悄出错"：约 75% 的多 Agent 失败表现为不报警的灰色错误。

![错误沿交接链放大：A 的 10% 错误被 B、C 继承叠加](/imgs/202609/2026-09-24-single-agent-beats-multi-infographic-2.jpg)

## 什么时候多 Agent 真的值

说"别上多 Agent"不是说"永远别上"。两种情形，多 Agent 的溢价能赚回来：

一是**真并行**。任务能拆成互不依赖的独立子块，并行跑比串行拼起来更快。研究也证实，在可并行任务上多 Agent 能带来明显提升；在顺序推理任务上反而普遍退化。

二是**生成加校验的双角色**。一个 Agent 写，一个 Agent 以全新视角审，这个结构提升最大、代价最小。有基准测到：双角色（生成器加校验器）只多花 **4.1%** 的 token，却换来 **17.7%** 的性能提升。这是所有多 Agent 形态里性价比最高的一档。

注意区别：双角色是"同一个问题的两遍"，不是"把活劈成五份各干各的"。后者往往掉进协调税和错误放大的坑。

一个可操作的默认：先上单 Agent 加一个 critic，而不是一上来就五 Agent 舰队。前者拿到了双角色的大部分收益，后者先背上了全部协调税。

## 真要上，协调层是生死线

如果任务确实该拆，那多 Agent 能不能活过生产，不看 Agent 多聪明，看协调层有没有建。

一项 2026 的行业调研里有个刺眼的数字：**68% 的多 Agent 部署在 72 小时内失败**，根因不是模型不行，是缺协调层——上下文过时、任务边界模糊、错误跨节点级联。

活下来的系统都显式处理了三件事：上下文新鲜度（每个 Agent 都跑在最新状态上）、任务边界（明确每个 Agent 拥有什么）、失败隔离（一个 Agent 的错不外溢）。有协调层 vs 没有，错误率能从 23% 压到 5%，延迟从 5.9 秒降到 1.8 秒。协调层不是开销，是 23% 和 5% 之间的那道墙。

![多 Agent 的协调层三件套：上下文新鲜、任务边界、失败隔离](/imgs/202609/2026-09-24-single-agent-beats-multi-infographic-3.jpg)

## 结语

多 Agent 不是银弹，是一笔要赚回溢价的税。准确率多 3 个点、token 翻 2.4 倍、错误放大 4 倍起——这些数字摆出来，多数"上舰队"的冲动会冷静下来。

一个简单的决策顺序：先确认任务有没有可拆的独立子问题；再给单 Agent 同等总预算试一次，看它是不是已经够好；真要拆，只拆成生成加校验两角色或少数真并行的块，并把协调层当作一等公民。

07-25 讲了怎么拆，这篇讲了拆完的代价。两篇合起来才是一句完整的话：能单干的别硬上多 Agent，要上的先把协调层焊死。

## 参考资料

1. Tran D, Kiela D. Single Agents Win at Equal Token Budgets. arXiv:2604.02460, 2026.
2. sunilprakash.com. Architecture Comparison: Workflow vs Single-Agent vs Multi-Agent. 2026-03-26.
3. arionresearch.com. Multi-Agent Design Patterns: The Complexity Trap. 2026.
4. aurorasre.ai. Why Multi-Agent AI Systems Fail in Production. 2026.
5. zonflip.com. Running AI Agent Fleets in Production. 2026.
6. dev.to. 68% of Multi-Agent Deployments Fail Within 72 Hours. 2026.
7. Anthropic Engineering. Multi-agent systems use ~15x more tokens than chats. 2026.

