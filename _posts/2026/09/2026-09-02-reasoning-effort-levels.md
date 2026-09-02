---
title: "同一个 high，不是一个刻度"
author: 唐悦玮
date: 2026-09-02 09:34:00 +0800
categories: [AI编程, 工具实践]
tags: [推理档位, reasoning effort, thinking budget, Claude, OpenAI, Gemini, DeepSeek, 通义千问, token成本]
pin: false
comments: true
keyword: 推理档位, reasoning effort, thinking budget, thinking level, Claude effort, GPT-5, Gemini, DeepSeek, 通义千问, token成本, AI编程
---

> **摘要**：各家的 low/medium/high 推理档位名字一样，刻度、默认值和计费方式却各不相同。对照官方文档理清这个旋钮真正控制什么，以及什么时候调高反而更贵更差。

一年前，模型"想多久"还是个固定属性。你要么用一个会思考的模型，要么不用，没有中间地带。

现在不一样了。Anthropic 的 API 里有 `effort` 参数，OpenAI 有 `reasoning.effort`，Gemini 有 `thinking_level`，DeepSeek 和通义千问也各自支持。落到工具层面，Claude Code 里一条 `/effort` 就能切换，Visual Studio 的 Copilot 对话窗口上摆着三档按钮。推理深度从模型自带的能力，变成了每次调用都能拧的旋钮。

问题出在这些旋钮长得太像。low / medium / high，名字一模一样，很容易让人以为大家共用一把尺子。把各家官方文档摊开对照一遍，会发现不是这么回事。

## 名字一样，控制的东西不一样

先看一张对照表。所有参数名、档位、默认值都取自各家官方文档：

| 厂商 | 参数 | 档位 | 默认值 | 实际控制范围 |
| --- | --- | --- | --- | --- |
| Anthropic Claude | `output_config.effort` | low / medium / high / xhigh / max | high（Claude Code 中 Opus 4.7 起为 xhigh） | 响应中的**全部** token：正文、工具调用、扩展思考 |
| OpenAI | `reasoning.effort` | none / minimal / low / medium / high / xhigh（取值随模型而定） | gpt-5.5 为 medium | 推理过程；输出长短另由 `verbosity` 控制 |
| Google Gemini 3 | `thinking_level` | minimal / low / medium / high | — | 思考深度；2.5 系列改用 `thinking_budget` 直接给 token 数 |
| DeepSeek | `reasoning_effort` + `thinking.type` | low / high / max | high（思考默认开启） | 思考强度，官方文档附带一份实际映射表 |
| 通义千问 | `enable_thinking` + `thinking_budget` | 开关 + 1–32768 的 token 预算 | 多数模型默认开启，预算默认 4000 | 是否思考，以及思维链长度上限 |

![五家推理档位参数对照：参数名、档位、默认值与控制范围各不相同](/imgs/202609/2026-09-02-reasoning-effort-levels-infographic-1.png)

关键差异在第一行的最后一列。Claude 的 effort 不只管"想多久"，它管整次响应花掉多少 token——包括工具调用的次数和正文的长度。Anthropic 官方文档的原话是：较低的努力程度会让 Claude 把多个操作合并成更少的工具调用、减少工具调用的总次数、直接动手而不加前言。同一个 `high`，在 Claude 这里是"整体节流阀"，在 OpenAI 那里只是"推理节流阀"——后者把输出长短交给了另一个独立的 `verbosity` 参数。

Gemini 走的是第三条路。3 系列给档位名，2.5 系列干脆不给，直接要一个 `thinking_budget` 数字（2.5 Pro 默认 8192，可调范围 128–32768；2.5 Flash 是 0–24576）。国产模型多数又是第四种形态：一个 on/off 开关加一个 token 预算，语义上更接近 Gemini 2.5。

所以"我把两边都设成 high"这句话，跨厂商是不成立的。Claude Code 的官方模型配置文档里有一句说得很直白：**effort 刻度是按模型标定的，同一个档位名在不同模型下不代表相同的底层值。**

## 默认值是厂商替你做的决定

这一点值得多看两眼，因为默认值暴露了厂商对"典型负载"的假设。

Anthropic API 默认 high，但在 Claude Code 里，Opus 4.7 及之后的默认档位是 **xhigh**——理由是编码和 agentic 类任务确实从更深的推理里受益。OpenAI 的 gpt-5.5 默认 **medium**。DeepSeek 的 thinking 模式默认开启、默认 high。

也就是说，同一个开发者、同一类编码任务，在不同工具链里拿到的默认推理量能差出两档。你没动过旋钮，不代表旋钮不在动。

还有个容易忽略的边界：Gemini 3 系列无法彻底关闭思考，最低只到 minimal。而通义系的某些模型反过来——在阿里云百炼上，GLM-5.3 与 kimi-k3（阿里云直供版）的官方文档写明"该模型始终开启思考，`enable_thinking` 仅支持 true，传入 false 会导致 API 请求失败"。把"关掉思考"当降本手段，在有些模型上根本不是合法选项。

DeepSeek 这里还有个值得知道的细节。它的 `reasoning_effort` 名义上接受 low / high / max 三档，但官方文档给了映射表：medium 会映射到 high，xhigh 按模型映射到 high 或 max。文档同时注明，deepseek-v4-pro 的实际映射在 2026 年 8 月初有过一次调整。换句话说，你传进去的档位名，和模型真正执行的推理强度，不一定是同一个东西。

## 调高，很多时候不划算

档位拉满的直觉是"多想总没错"。厂商和学术两边的证据都不太支持。

Anthropic 在 computer use 的最佳实践文档里给了一条相当明确的否定结论：**不推荐在 computer use 上使用 max effort，在我们的测试中，它相对 high 没有准确率收益，却进一步推高了输出 token 成本。** 理由是 UI 任务以感知判断为主而非深度逻辑，多出来的推理预算要么用不上，要么变成过度思考。同一份文档里还有个更实用的发现：**medium 配上重试，能达到和 high 相当的表现，token 成本只有一半。**

Claude Code 官方文档对 max 的描述同样克制：可能提升高难度任务的表现，但存在边际收益递减，且容易过度思考，建议先测试再广泛采用。

学术那边有一个更系统的观察。一篇分析编码 Agent 花销的论文（OpenReview，《How Do Coding Agents Spend Your Money?》）把同一道题的多次运行按成本从低到高分成四档，统计准确率相对最低成本档的变化系数：最低档 0.00，次低档 +0.032，次高档 +0.025，最高档 +0.005。准确率在中等成本处见顶，再往上反而回落。论文把它归为 inverse test-time scaling——多出来的算力没变成更好的解题，而是变成了反复试错和上下文膨胀。作者还观察到一个具体行为：高成本且失败的运行里，重复查看、重复编辑同一文件的频次显著上升。

堆推理量买到的，常常不是"想得更深"，而是"绕得更远"。

需要给这条证据划个边界：它衡量的是 Agent 整体运行的成本，不完全等同于单次请求的档位设置。但它指向的方向和厂商自己的结论一致——越过某个点之后，多花钱换不来准确率。

![推理档位与准确率的非单调关系：准确率在中等成本处见顶，最高档回落](/imgs/202609/2026-09-02-reasoning-effort-levels-infographic-2.png)

## 真正该做的是路由，不是调档

既然旋钮存在，正确用法就不是全局设一个值，而是按任务分档。Anthropic 官方给出的分档定位是现成的：

| 档位 | 官方定位 | 适用 |
| --- | --- | --- |
| low | 最高效，显著节省 token，能力有所降低 | 简单分类、快速查询、高吞吐、子代理 |
| medium | 平衡，有适度的 token 节省 | 需要速度、成本、性能三者平衡的 agent 任务 |
| high | 高能力，等同不设参数 | 复杂推理、困难的编码问题、agent 任务 |
| xhigh | 编码与 agentic 任务的推荐起点 | 反复工具调用、详细网络搜索与知识库检索 |
| max | 绝对最高能力，无 token 上限 | 真正前沿的难题；多数负载下不划算 |

Visual Studio 的 Copilot 在 2026 年 8 月的 18.9 版本里也上了三档，官方定义是：Low 给快速响应、使用更少 token；Medium 平衡推理深度与响应速度，适合日常编码任务；High 做更深推理，适合棘手算法、架构决策和难调的 bug。这三句定义本身就是一份任务分类表。

工程上真正好用的是**把档位写进配置，而不是每次手调**。Claude Code 提供了几种粒度：

```bash
/effort xhigh                        # 当前会话切换
claude --effort high                 # 单次启动
export CLAUDE_CODE_EFFORT_LEVEL=medium   # 环境变量，优先级最高
```

更细的一层是 skill 和 subagent 的 frontmatter 可以单独指定 effort：

```yaml
---
name: quick-lint
description: 跑一遍 lint 并汇报结果
effort: low
---
```

这解决的是一种很具体的浪费：一个负责跑 lint 或格式化检查的子代理，根本不需要和主代理相同的推理深度。把子代理压到 low、主代理留在 xhigh，省下的钱比全局降一档多得多，而且不伤主任务的质量。官方对 low 的推荐用例里，"子代理"本来就被明写出来。

还有个不太常被提到的开关：`ultrathink`。把它写进 prompt，可以让当前这一轮临时加深推理，而会话的 effort 设置不变。适合一次性的难题——不必为了一个问题把整个会话的档位抬上去。要注意的是 Claude Code 只认 `ultrathink` 这一个关键词，"think hard" 之类会被当成普通文本传进去。

我自己目前的配置是三层：全局 `effortLevel` 设成 `high`，跑 lint、格式化、依赖检查这类工具型 skill 的 frontmatter 全部压到 `low`，遇到需要跨模块重构的会话再手动 `/effort xhigh` 抬一档。

这套配法没什么技巧，真正的收益来自第三层：因为知道抬档是要手动做的，我在起一个会话前会先想清楚它属不属于"智能敏感"。分错的代价很直观——lint 子代理跑到 xhigh 是纯浪费，重构会话停在 medium 则是要返工。旋钮的存在本身就在逼你给任务分类。

![按任务路由推理档位：主代理保持高档，工具型子代理压到低档，一次性难题用 ultrathink](/imgs/202609/2026-09-02-reasoning-effort-levels-infographic-3.png)

## 几个容易踩的坑

**中途改档位会打断提示缓存。** Anthropic 官方文档明确写了：在请求之间更改 effort 值会使提示缓存失效。在长会话里频繁切档，省下的输出 token 可能被反复重建缓存的输入成本吃掉。

**思考 token 按输出价计费，藏起来的也算钱。** Gemini 官方文档的说法很直接：开启思考时，响应价格等于输出 token 与思考 token 之和，且计费基于模型生成的全部思考 token——尽管 API 只吐出摘要。Claude Code 文档同样写明：即使思考内容被折叠或经过脱敏处理，你仍然要为生成的所有思考 token 付费。通义的文档还补了一条例外：开了思考模式但模型实际没产出思考内容时，按非思考模式的价格计费。

**档位掉了，别先用 prompt 补。** Anthropic 给 Opus 4.7 的建议是：如果在复杂问题上看到推理变浅，**提高 effort，而不是试图用 prompt 补偿**。反过来，如果因为延迟必须压在低档位，那就加一句具体指引，比如"这个任务涉及多步推理，回答前仔细想清楚"。

## 旋钮背后是预算责任

推理量从"模型的能力"变成了"调用者的预算"，这是这个旋钮真正带来的变化。一年前你挑模型，现在挑完模型还得挑档位。厂商把决定权交出来了，同时也把责任交出来了——而那个默认值，是厂商按它设想的典型负载替你选的，不是按你的。

明天能做的一件具体的事：把你手上的 skill、subagent 和脚本按"智能敏感"和"延迟敏感"分成两堆，前者默认 xhigh，后者压到 low，中间地带给 medium，然后跑一周看账单。别凭感觉调档位——感觉会告诉你"调高总没错"，账单不会。

主要来源：Anthropic《Effort》与 Claude Code《Model configuration》官方文档（[Effort 文档](https://platform.claude.com/docs/en/build-with-claude/effort)）、Google《Gemini API thinking》官方文档（[thinking-mode](https://ai.google.dev/gemini-api/docs/thinking-mode)）、DeepSeek《思考模式》官方文档（[中文版](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode/)）、OpenAI《Reasoning》文档、通义千问《Thinking》文档、阿里云百炼 OpenAI 兼容接口文档、Microsoft《Visual Studio 18.9 release notes》。
