---
title: "NVIDIA 把 Agent 写成一个类"
author: 唐悦玮
date: 2026-08-20 10:00:00 +0800
categories: [技术解读, AI编程]
tags: [NVIDIA, NOOA, Agent, 编程范式, 工程实践]
pin: false
comments: true
keyword: NVIDIA NOOA,Agent框架,Python类,AI编程,Agent工程,SWE-bench
---

> **摘要**：NVIDIA 开源 NOOA，把 Agent 折叠成一个 Python 类：方法=动作、字段=状态、docstring=提示词、类型注解=运行时强制契约，方法体写 `...` 就交给模型，写普通代码就确定性执行。82.2% 等基准是厂商自报、未经独立复现；AST 检查不等于沙箱，跑生成代码必须容器隔离。

## 从一个具体问题开始

写一个 Agent，你要同时维护四样东西：

- prompt 文件：一坨字符串，告诉模型"你是谁、该怎么说话"
- 工具 schema：一段 JSON，描述模型能调用什么、参数长什么样
- 回调注册：模型调完工具，结果回给谁、谁来接
- workflow 图：节点和边，定义整个流程怎么走

这四样散落在不同文件里，有时还在不同抽象层。想改一个行为，你得先回答四个问题：prompt 在哪个文件？schema 在哪个目录？回调在哪注册？图在哪个配置里？改完 prompt 忘了同步 schema，Agent 就悄悄坏掉，你还要花半天排查"明明提示词是对的"。

这是编排的问题，不是模型的问题——这句话先记住，后面是全文的钥匙。

7 月 30 日，NVIDIA 开源了一个叫 NOOA 的东西，想法简单到近乎粗暴：这些都不用分开写，一个 Python 类就够了。

NOOA 全称 NVIDIA Object-Oriented Agents，Apache 2.0，`pip install nooa`，v0.0.8 alpha，要求 Python 3.12–3.13（来源：NOOA GitHub 仓库）。

它的核心观点一句话说死：**Agent 开发不需要新范式，它需要的是用了 40 年的面向对象纪律。**

方法就是动作，字段就是状态，docstring 就是提示词，类型注解就是运行时强制执行的契约。方法体写 `...`（省略号）的部分，由 LLM 运行时补全；写普通代码的部分，就按确定性 Python 执行。两者在同一个类里自由混合。

拿官方 TriageBot 示例改一下（改编自 NOOA 官方 README，Apache 2.0）：

```python
@agent
class TriageBot:
    """Triages incoming bug reports for a Python web service."""
    open_issues: list[str] = []

    @llm
    def classify(self, report: str) -> str:
        """Return exactly one of: 'crash', 'perf', 'ux', 'security'."""
        ...

    def record(self, report: str) -> None:
        self.open_issues.append(report)   # 普通 Python，确定性执行

    def handle(self, report: str) -> str:
        category = self.classify(report)      # 模型
        self.record(report)                   # 代码
        return self.draft_reply(report, category)  # 模型
```

三个细节，每一个都在改命。

第一，`-> str` 是强制契约，不是提示。模型输出一个带解释的 dict？运行时直接拦下重试，输出通过校验才交给下游。

第二，docstring 就是提示词，但它不漂移到单独文件，而是跟在它管辖的方法签名旁边。改行为就是改代码，git diff 一眼看得见。

第三，`record` 是普通 Python，每次精确执行。它不经过模型，不存在"这次记了下次没记"的随机性。

这就是 NOOA 的设计主线：**把确定性路径做成默认，把模型路径做成显式 opt-in。**

## 减法设计：四件套怎么折叠成一个类

现在市面上的 Agent 框架，大多是"四件套拼装"：prompt、工具 schema、回调、workflow 图，由框架内部约定勉强捏在一起。维护过的人都有同感——你永远说不清"某个行为到底写在哪"。

NOOA 做的减法，是把这四件套折叠进 Python 自带的语言机制：

| Agent 概念 | NOOA 里的载体 |
|---|---|
| 动作（工具） | 类的方法 |
| 状态 | 类的字段 |
| 提示词 | docstring |
| 运行时契约 | 类型注解 |
| 交给模型的步骤 | 方法体 `...` |
| 确定性步骤 | 普通方法体 |

![减法设计：四件套折叠成一个类](/imgs/202608/2026-08-20-nvidia-nooa-diagram.png)

折叠之后，Agent 行为就变成了普通软件：能 diff、能 code review、能单测、能重构，人类和 AI 编程工具用同一套工具链操作它（来源：NOOA 官方技术博客）。

论文把这套接口归纳为六种能力：类型化输入输出、引用传递、代码即动作、可编程循环、显式对象状态、模型可调用的 harness API（来源：NOOA 论文 arXiv 2607.20709）。

这个观点最锋利的地方，在**确定性默认**。

大多数 Agent bug 不是模型失败，是编排失败——本应确定性的逻辑，被路由给了模型。比如"把这条记录追加到列表"，这件事不需要任何智能，但很多框架把它交给模型决定，于是出现"这次记了下次没记"的玄学。NOOA 让普通方法永远精确执行，只有 `...` 方法才交给模型。边界在语法层面可见，这就是可审计性。

代价也要说清楚：类即 Agent 把结构做到了极致简单，但复杂多分支的编排，不如 LangGraph 那种可视化图直观——这是它刻意放弃的那一极。而且 NOOA 还是 alpha，API 随时可能变。

## 省 token 的工程思路

NOOA 在省 token 上有两个设计，都冲着"上下文膨胀"去的。

一个是 **pass-by-reference 活对象**。别的框架把状态序列化成 JSON 塞进上下文，模型读到的是一坨静态快照；NOOA 传的是活对象引用，模型操作的是真实的 Python 对象（来源：NOOA 官方技术博客）。

另一个是**有界预览**。一个 100 元素的列表，上下文里只渲染约 30 token 的头部尾部样本，完整对象留在 REPL 里，模型要用时再取。

官方自报的数据：SWE-bench 上每个任务约 1.1M token、28 次模型调用；对比方案约 2.2M token、66 次调用（来源：NOOA 官方技术博客）。

注意这句话的限定词：**厂商自报，未经独立复现**。所以 1.1M 对 2.2M 的"省一半"，当成可参考的数量级看，别当成精确结论——这是省 token 的代价。

记忆也走同一条路。NOOA 带一个可选的长记忆子系统：记录落在 SQLite 文件里，由模型通过可调用的工具自己写、自己查、自己改，人可读、可审查（来源：NOOA 官方技术博客）。记忆和状态都放在可审计的地方，而不是埋在对话历史里——这是"类即 Agent"思路的延伸：不仅行为可审计，连"它记得什么"也可审计。对要做 Agent 落地的团队，这比"记忆很强"更值钱——你可以直接查数据库确认它记住了什么，而不是靠追问模型"你还记得吗"。

## 82.2%？先给基准加个星号

NVIDIA 在基准上给出了不少数字，先列全（以下均为厂商自报，未经独立实验室复现）：

- SWE-bench Verified（500 任务，GPT-5.5 xhigh）：NOOA 82.2%，同模型同档位只换 harness 的 OpenCode 78.6%、PI 78.2%。也就是说，光换 harness 就值 3.6 个点
- 换 Claude Opus 4.6：79.8%
- Terminal-Bench 2.0（89 任务）：PI 75.3% > NOOA 73.0% > OpenCode 60.7%——注意，这个榜 NOOA 没赢
- CyberGym L1：86.8%；ARC-AGI-3 mean RHAE：85.1%（GPT-5.6-sol）
- 一个 253 行代码构建的 Agent 拿到 82.2%

![同模型只换 harness，值 3.6 分](/imgs/202608/2026-08-20-nvidia-nooa-benchmark.png)

这里有几点要克制着看。

"harness 值 3.6 分"只在同模型、同推理档位的对比下成立，不是"换 NOOA 就涨 3.6 分"的普适结论。

NVIDIA 把自己输的榜也发了。大多数 harness 论文只挑赢的放，它把 Terminal-Bench 2.0 上 PI 领先的结果原样公开，这比多数框架诚实。但诚实归诚实，82.2% 仍是自报、无独立实验室复现，也没有和 LangGraph/CrewAI 做同模型 head-to-head——别写成定论。

模型无关是加分项。NOOA 通过 LiteLLM 接入，hosted API、本地 Ollama、vLLM 都行，不锁 NVIDIA 自己的模型。这意味着想用 Qwen、Kimi、豆包跑它，理论上可以直接接——这是对国内开发者最实在的一点。

## AST 检查不是沙箱

这篇最值得读的，其实是安全部分。NVIDIA 的 README 把丑话说在了前面，原文：

> "NOOA validates generated code (AST checks) and applies module deny-lists before execution. These are defense-in-depth guardrails, not a containment boundary."

翻译过来：AST 检查和模块黑名单只是纵深防御，**不是安全边界**。它们的存在是为了防止生成代码冻结事件循环、抓住常见错误，不是为了拦住一门心思要逃逸的代码。

README 接着列了风险清单：数据泄漏、文件删除、环境修改——这不是边缘情况，是官方明说的三件事。

更关键的一段推理：静态检查器无法给出保证——`open()` 能给任意文件访问，`importlib` 能按路径加载模块，反射能摸到其余部分。所以真正的边界是 OS 级隔离：容器、VM，或者 NVIDIA 自己的 OpenShell（来源：NOOA GitHub README）。

这个警告放在当下格外应景。时间线是这样的：

- 7 月 21 日，一个 OpenAI 的自主 Agent 逃逸，在 Hugging Face 上造成入侵，FBI 介入——受害者 Hugging Face 后来正是联盟创始成员
- 7 月 24 日，NVIDIA 签了开源权重信
- 7 月 27 日，三十多家公司官宣成立 Open Secure AI Alliance：Adobe、CrowdStrike、Hugging Face、Dell、微软、Meta、Cloudflare 都在列
- 7 月 30 日，NOOA 开源

NOOA 是"带着代码来的联盟"——不是发个宣言，是直接交付一个可复现的开源实现。但这也意味着：**跑 NOOA，必须容器/VM，别裸奔。** 尤其你的 Agent 要处理不可信输入时，AST 检查那层皮挡不住真正想动手的代码。

## 图也可以不要

我 8 月 7 日写过一篇《Loop 才火六周，Graph 就来了》，讲编排从手写循环进化到图。NOOA 站在相反的那一极：**图也可以不要，一个类就是 Agent。**

两篇合起来看，Agent 编排的钟摆在两个方向之间晃：一边是图，把每个步骤显式画出来，适合复杂、多分支、需要可视化审计的流程；一边是类，把 Agent 折叠成一段可读、可测、可 review 的代码，适合边界清晰、结构简单的场景。没有哪一边是唯一解——NOOA 论文自己也说，它只是把六种 harness 能力第一次整合在同一套接口上，而不是发明了六种新东西。

Java 开发者看这个设计，会有特别的亲切感。"模型决定 vs 代码决定"的边界在源码里一眼可见——方法体是 `...` 还是普通代码，决定了这段逻辑交给谁。这正是安全审查最想要的东西：责任边界在代码里，不在文档里。Java 侧的 Spring AI、LangChain4j 也在往"Agent 抽象"方向走，但大多还是"对话 + 工具注册"的组合，NOOA 把整层折叠进语言本体的做法更激进。

国内对照一句话带过：DeepSeek Harness 8 月 13 日也开源了（那篇另写过），走的是"一切皆插件"的路子；NOOA 走的是"一切皆类"。国产的 CodeBuddy、WorkBuddy 这类编程工具，也在把 Agent 能力拆成可审查、可配置的工程件——方向上和 NOOA 殊途同归。两条路都指向同一个判断：Agent 的工程化，正在从"框架给你一堆抽象"回归到"语言本身"。

## 周末可以试，别急着迁移

最后说结论。

NOOA 现在是 v0.0.8 alpha，PyPI 上明晃晃标着 alpha，没有任何生产环境的大规模实践证明。适合先试的人群：AI 原生初创、平台团队、企业 AI 研究，以及 issue 分类、终端自动化、漏洞验证、批量数据提取这些边界清楚的场景。

受监管的生产负载，先等稳定版。

给你两条落地建议：第一，周末用一个小任务（比如把工单分类的脚本改成 TriageBot）跑一遍，感受"类即 Agent"到底是不是你想要的结构；第二，凡是涉及执行生成代码的，一律丢进容器里再谈，别拿裸进程赌。

一个类装下整个 Agent，听起来很美。但它值不值，得等独立复现、生产实践，还有时间给出答案。

---

**延伸阅读**

- [NOOA GitHub 仓库（NVIDIA-NeMo/labs-OO-Agents）](https://github.com/NVIDIA-NeMo/labs-OO-Agents)：README 里有安全边界原话与安装说明
- [NOOA 论文（arXiv 2607.20709）](https://arxiv.org/abs/2607.20709)：六种 harness 能力的完整论证与评测方法
- [NVIDIA 官方技术博客：Six Agent Harness Capabilities for Higher Model Performance](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)：NOOA 的设计思路与基准数据出处

**参考资料**

- NOOA GitHub 仓库与 README，2026 年 7 月。安装要求、Apache 2.0、v0.0.8 alpha、AST 检查安全边界原话、风险清单。
- NVIDIA 官方技术博客 "Six Agent Harness Capabilities for Higher Model Performance"，2026 年 7 月。一个类即 Agent、pass-by-reference、有界预览、六种能力。
- NOOA 论文 arXiv 2607.20709（Paul Furgale 领衔，15 作者，2026 年 7 月提交）。评测方法与六种 harness 能力。
- 事件时间线（2026 年 7 月）：OpenAI 自主 Agent 逃逸与 Hugging Face 入侵、NVIDIA 签署开源权重信、Open Secure AI Alliance 成立、NOOA 开源，综合多方媒体报道。
