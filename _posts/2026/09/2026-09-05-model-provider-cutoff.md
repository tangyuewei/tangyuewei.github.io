---
title: "模型商和工具商，正式开战"
author: 唐悦玮
date: 2026-09-05 09:10:00 +0800
categories: [AI编程, 趋势]
tags: [AI编程, OpenAI, Cursor, 模型供应, 断供, 护城河]
pin: false
comments: true
keyword: OpenAI, Cursor, SpaceX, 断供, change of control, 模型供应, AI 编程工具, 护城河
---

> **摘要**：Cursor 被收购一个月后，OpenAI 宣布 11 月停供模型。表面是两位老板的旧账，底层是结构问题：你的模型供应商，随时可能变成你的对手。本文拆解断供的博弈机制，和对写代码的人意味着什么。

今天打开 Cursor 的模型下拉菜单，里面躺着一排名字：Claude、GPT、Grok、Gemini。你点哪个，看心情或者看任务。但这排名字背后是几张互不通气的合同，其中一张，在 8 月 28 日被单方面撕掉了。

那天，OpenAI 在[官网发声明](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex)：已通知 SpaceX，将从 11 月 12 日起停止向 Cursor 供应模型。理由写得直白——无法确信 SpaceX 会在服务条款内使用技术，依据是与马斯克旗下公司打交道的经验。按 Cursor 联合创始人的说法，OpenAI 模型只占其流量约 5%；Anthropic 当天表态要加算力顶上，马斯克在 X 上回了一句：我根本不在乎。

停在新闻层面，这就是两位老板的又一次吵架，能拍连续剧那种。但把时间轴拉长，过去 14 个月里类似的事发生了三次，其中两次跟马斯克没有半点关系。

断供不是恩怨，是这个行业的结构性动作。

## 合同里那把撤回权

![模型商-工具商竞合结构：一家模型商管道断裂断供、另一家正常供应，编辑器居中、与供应商产品路线图重叠](/imgs/202609/2026-09-05-model-provider-cutoff-infographic-2.jpg)

先看这次是怎么发生的。SpaceX 在 6 月宣布以 600 亿美元全股票收购 Cursor 母公司 Anysphere，8 月 14 日交割。OpenAI 和 Cursor 的合作合同里有一条平时没人注意的条款——change of control：客户一旦发生控制权变更，供应商有权在有限窗口内终止合同。

这条款平时躺在合同深处，不触发就是废纸。一旦触发，就是供应商的退出保险：不需要证明你违约，不需要谈价格，只要你的股东换了人，我就可以走。

OpenAI 的走法还带信号意义。声明里点名的不是 Cursor 团队，是 SpaceX 的合规记录：X 被收购后违反过 OpenAI 合同；马斯克今年初在法庭宣誓作证时，承认 xAI 违反过 OpenAI 服务条款。翻译一下：我不信任新老板，所以我行使合同权利。

多数人忽略的是另一层——为什么 OpenAI 的合同里会有这么一条？因为 OpenAI 从来不是 Cursor 的"纯供应商"。OpenAI 自己卖 Codex，Cursor 的直接竞品。把模型卖给一个竞品当零件，靠的就是合同里留着这把撤回权兜底。给出去的模型可以收回来，这条保险丝从一开始就埋好了。

## 供应商和客户，只隔一条路线图

![14 个月三次断供时间线：通知期从不到 5 天到 11 周不等，三案共同汇聚到同一结构性原因](/imgs/202609/2026-09-05-model-provider-cutoff-infographic-1.jpg)

把镜头再拉远。过去 14 个月，AI 编程圈至少发生了三次断供：

- 2025 年 6 月，Anthropic 切断 Windsurf 的 Claude 访问，通知期不到 5 天。当时 OpenAI 传出要收购 Windsurf。
- 2025 年 8 月，Anthropic 终止 OpenAI 的 Claude API 访问——OpenAI 工程师被指拿 Claude Code 测试自家 GPT-5，触碰"禁止用 Claude 开发竞品模型"的条款，几乎即时生效。
- 2026 年 8 月，OpenAI 断供 Cursor，给了 11 周通知。

三次断供，两次与马斯克毫无关系。把私人恩怨剥干净，共同条件只有一个：你的模型供应商，同时在往你的赛道上走。

Anthropic 有 Claude Code，OpenAI 有 Codex，Google 有自己的 agent——数得上名字的主流模型商，没有几家是"纯粹卖模型"的。当供应商的路线图与你的产品重叠，API 是否继续开放，就从技术问题变成商业判断。

一次收购、一次条款争议、一次控制权变更，任何一根稻草都可能终结这段关系，而终结方式永远是同一句话：按合同通知。

这次事件里最值得品味的细节是 Anthropic 的站位。它一边在去年切断 Windsurf，一边在 8 月 28 日当天宣布给 Cursor 增加算力，Replit 的 CEO 当场阴阳了它一句。但 Anthropic 的逻辑自洽——它不是双标，是在每一段关系里都算自己的账：Windsurf 挡路就断，Cursor 是渠道就供。模型商的字典里没有忠诚，只有路线图。

## 5%，工具商给自己买的保险

Cursor 为什么扛得住这次断供？联合创始人给出的数字是：OpenAI 模型只服务约 5% 的流量。这个数字不是运气，是 Cursor 从第一天起刻意维持的"模型中立"——同一件事，永远让用户在几家模型之间切换。

Truell 有句话信息量很大：Cursor 是 OpenAI 最早的客户之一，合作多年，一直把他们的平台当作"中立基础设施"来信任。注意这个动词——信任。现在这层信任被单方面收回了。

而 5% 恰好证明了另一件事：多供应商从来不是功能列表里的加分项，是生存策略。把身家押在任何一家模型商身上，等于把公司的命门交给别人的商业判断。

这个教训对团队同样成立。Gergely Orosz 在收购落地时就说过：不要信任任何单一 AI 供应商，用模型就走 router，让切换供应商变得毫无成本。Cursor 的 5% 是把这句话执行到极致的样本。

## 护城河在搬家

![护城河两方向搬家：工具商自研模型（数据→GPU→自用）、模型商自建场景（断供后用户被重定向到自家产品），中立工具商被两侧夹在深谷窄桥上](/imgs/202609/2026-09-05-model-provider-cutoff-infographic-3.jpg)

三次断供连起来看，真正值得留意的信号是：接入哪家模型不再是护城河，因为那根管子随时可能被供应商自己拧紧。护城河正在往两个方向搬家。

一个方向，工具商自研模型。SpaceX 收下 Cursor 后做的第一件事是喂数据：Grok 4.5 的训练里灌了数万亿 token 的 Cursor 真实编码会话，Grok 4.6 又用 Cursor 的交互日志做了增强训练，第三方评测的综合指数已经追平 GPT-5.6（[数据飞轮的分析](https://www.thenovtech.com/p/spacex-spent-60-billion-on-a-code)见参考资料 3）。

数据飞轮转了起来——Cursor 用户每一次补全都在给自家模型供弹药，自家模型再反过来成为菜单里越来越能打的选项。

代价同样清楚：这条路要求把用户每一次击键都变成训练数据，隐私与自主权的账要另算。而且目前这些领先大多出现在模型商自己的评测口径里，独立第三方验证还早。

另一个方向，模型商自建场景。OpenAI 断了 Cursor 之后，你依然能在 Cursor 里用 GPT——自带 API Key，或者走 Bedrock、Azure 这类网关。但注意一个细节：这些路径不覆盖 Cursor 最值钱的功能面，Tab 补全、Auto 模式、Agent、CLI 和 SDK 都不在其中。你可以继续用 GPT，但只能用被摘掉核心功能的版本。

剩下的深度使用流量往哪走？大概率是 OpenAI 自己的 Codex。

两条路若都走下去，指向同一个终点：模型和工具正在重新焊死。五年前"模型接入"是护城河，因为好模型稀缺；如今模型商要抢场景，工具商要抢模型，夹在中间的"中立工具商"会越来越难做。

## 对写代码的人，这意味着什么

把新闻剥干净，剩下三层事实。

第一，你的工具商和模型商随时可能变成对手，而且不需要你做错任何事。断供的决定发生在一个你不在场的房间里，理由是你没看过的一份合同上的一个条款。

第二，模型中立从加分项变成必需品。个人能做的很具体：别把全部工作流焊死在一家模型上，能在设置里一键切换的，就养成切换的习惯。团队层面，把"单一模型占比"当成和磁盘水位一样的指标来监控。

第三，这场仗的账单最终会落在使用者头上。工具商自研模型要摊成本，模型商自建场景要抢订阅，每一次护城河搬家，最后都会以功能缩减或者价格上涨的形式出现在你面前。

回到开头的下拉菜单。下次点模型的时候，可以多想一层：菜单背后是合同，合同背后是路线图，路线图背后，是几家都想做同一件事的公司。菜单里每个选项能活多久，从来不由你决定——所以别把身家押在任何一个选项上。

## 参考资料

1. OpenAI 官方声明：*Our decision on Cursor following its acquisition by SpaceX*，openai.com，2026-08-28，https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex
2. Beam.ai：*3 Model Cutoffs in 14 Months: The Case Against Single-Vendor AI in 2026*，https://beam.ai/es/agentic-insights/ai-model-cutoffs-single-vendor-concentration-risk
3. The Nov Tech：*SpaceX Spent $60 Billion on a Code Editor*（Grok 数据飞轮与 Colossus 算力分析），https://www.thenovtech.com/p/spacex-spent-60-billion-on-a-code
4. Big Hat Group：*xAI Weekly: Grok 4.6 Goes Universal, $60B Cursor Deal*，2026-08-26，https://www.bighatgroup.com/blog/xai-weekly-2026-08-26
