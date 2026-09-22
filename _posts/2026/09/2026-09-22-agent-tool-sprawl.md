---
title: "Agent 工具给到六十个，它开始挑花眼"
author: 唐悦玮
date: 2026-09-22 08:46:00 +0800
categories: [AI编程, Java]
tags: [Agent, 工具调用, MCP, SpringAI, LangChain4j]
pin: false
comments: true
keyword: Agent 工具调用, MCP 工具膨胀, 工具选择准确率, Tool Search, Spring AI, 上下文工程
---

> **摘要**：工具定义不是免费的元数据，是每轮请求都要付的固定税，还会让模型在名字相近的工具之间瞎猜。这篇把账算清，说清按需检索治得了什么、治不了什么，以及 Java 侧接进去要留意哪几件事。

企业内部 Agent 上线一个月，接了几个 MCP server，工具总数六十多个。有人问一句"查一下华东区的库存异常"，它调了工具。没报错，返回格式也对，结果是错的。

它挑的是名字最像的那个，参数里有一半是从另一个工具的描述里凑来的。

翻上下文才发现问题在哪。Anthropic 官方举过一个五服务器的例子：GitHub 35 个工具、Slack 11 个、Sentry 5 个、Grafana 5 个、Splunk 2 个，一共 58 个。

这些定义加起来约 55,000 token，在用户说第一句话之前就全塞进去了。再挂一个 Jira，多 17,000。他们提到内部见过工具定义单独吃掉 134,000 token 的情况。

六十个工具，就是这么来的。

## 工具定义是每轮都要付的固定税

先说这笔看得见的账。

工具定义不是一个名字。它是完整的对象：名称、自然语言描述、参数的 JSON Schema。描述写得越仔细，token 越多。业界估算是单个工具 100 到 500 token，取决于描述啰嗦到什么程度。

关键在于"每轮"。工具定义要放进每一次请求，因为模型自己不记上下文。用户问题、系统提示、对话历史、真正检索回来的数据，全都在同一个池子里跟它抢空间。

有一组实测把差距摆得很清楚：一台挂了 172 个工具的编码 Agent，用户还没打字，141K token 已经没了。同一批工具打开按需加载之后，这些定义占的 token 起步是 0，实际用到时也只涨到 2.6K。同一套工具、同一份工作，只是加载方式不同，差五十倍以上。

还有一份被引得不多的研究值得单独说。《Help or Hurdle? Rethinking Model Context Protocol-Augmented Large Language Models》那篇论文，跨三个任务域、六个模型测下来，把 MCP 工具接进模型之后，效果平均**下降约 9.5%**，比同一个模型不接任何工具的基线还差。

工具是相关的，数据是真的，模型还是变差了。"接了总比不接强"这个默认假设，是有反例的。

## 更要命的是准确率断崖，不是缓坡

token 是明面上的成本。选择准确率才是贵的那笔。

一个被引用最多的数字来自 MCP 工具检索研究：工具列表变长，Agent 挑对工具的比例从 43% 掉到 14% 以下。这不是缓慢退化，是塌陷。同一份分析还提到，常规 MCP 配置下工具定义能吃掉上下文窗口的七成以上。

厂商给的数字收敛得出奇一致，三家独立推导出来的都落在同一个数量级：

- Anthropic 的口径是工具超过 30 到 50 个，选择能力开始退化，建议在 10 个工具或 10K token 定义时就上检索
- OpenAI 建议每轮开头的可用函数少于 20 个
- Gemini 的指引把活跃工具集压在 10 到 20 个

机会修正之后的数据更有意思。今年五月那篇《How Many Tools Should an LLM Agent See? A Chance-Corrected Answer》在 BFCL 的 370 个工具上测。

给模型看 50 个工具，选择准确率 60.9%；把名单收到 7 个左右，涨到 76.8%。把"瞎蒙也能中"的运气成分修正掉之后，名单长度的影响比原始数字还明显。

但别急着得出"越少越好"。同一批研究里有一条反向结果：在 ToolBench 的 3,251 个工具上，固定给 5 个的名单在聚合覆盖率上赢了（64.7% 对 61.9%），可在困难查询上——正确工具排在第 6 到第 20 位那种——它一个都找不到。往深里搜能捞回来 16.7%。

所以两头都是死法：给太少，该用的工具不在名单里；给太多，模型挑错。要算的不是"几个合适"，是"错在哪一环"。

![工具定义每轮都发、模型在一排名字相近的卡片里挑错、结果不报错也是错的](/imgs/202609/2026-09-22-agent-tool-sprawl-infographic-1.jpg)

## 断崖的主因不是看不过来，是长得像

到这里，最顺手的解释是注意力稀释：窗口太长，埋中间的内容模型看到了但没用上，也就是常说的 lost in the middle。

这个解释今年被实测顶了一下。

有研究专门看工具选择到底在哪一步失败。结果是：模型在 80% 的情况下注意力确实落在正确工具上，随机基线是 21%。

失败案例里，"正确工具恰好是被忽视的那个"只占约 10%。作者的原话是这反驳了关于工具列表拥挤的 lost-in-the-middle 假设。他们还给工具重排过顺序，最多只能救回 23% 的失败。

病灶不在注意力分配，在语义重叠。

三个可观测性 server 接在一起是什么样：`sentry·list_issues`、`datadog·search_logs`、`aws·get_log_events`、`github·list_issues` 排成一排。对着人类这是四件不同的事。

对着一个在重上下文压力下做模糊匹配的模型，它们之间的语义边界会糊掉——它会挑中一个 schema，填进去从另一个工具那里记来的参数。

这种重叠有多普遍，有人量过：377 个可注册 MCP server、7164 个工具、十七万多个工具对逐个比对，名字共享大部分词或描述高度重叠的算"容易混"。结论是大约每四个 server 里就有一个，存在至少一对容易混的工具。

这个数字本身有个来回。作者第一版算出来是 45.8%，后来自己更正到 23.8%。原因很实在：样本里 97 个 URL 是同一家网关的不同路径，同一份工具设计被数了 97 次。他还提到，混淆集中在工具面大的 server 上，不是均匀铺开的。

一个接近一半的惊人数字，缩水成一个大约四分之一的正常数字。原文里那句反思比数字本身有价值——他本来对更窄的那个指标做了去重，却没把修正带回最惊人的那个指标上。

回到主线。最能说明问题的是研究里那句拆解：就算给到 oracle 检索，也就是正确答案百分之百保证可见，**仍然差大约 10 个百分点**。原文说这 10 个点不是检索能补回来的，短名单缩小了候选集，但路由器仍然会混淆语义相近的工具。

这句话决定了后面这些方案的适用范围。把工具描述写短，能治第一类（吃上下文），对第二类一点用没有。只有把重叠的工具真的删掉或者合并，才动得了那 10 个点。

![真正的病灶不是看不过来，是那几张几乎一模一样的卡片](/imgs/202609/2026-09-22-agent-tool-sprawl-infographic-2.jpg)

## 三条路，各治一种病

现在被讲得最多的有三条路线。它们不等价，因为治的不是同一种病。

**按需检索——治数量。** 把工具定义全部延迟加载，初始只放一个搜工具的工具。模型需要什么能力就用自然语言去搜，返回三到五个相关定义展开进上下文。

Anthropic 那篇[官方工程博客](https://www.anthropic.com/engineering/advanced-tool-use)给的数字是：55K 降到 8.7K，降幅 85%；Opus 4 的选择准确率从 49% 涨到 74%，Opus 4.5 从 79.5% 涨到 88.1%。搜索工具自己占约 500 token。

代价得说清楚。这只治数量，而且检索本身会引入一种新的死法——检索没命中，"找不到该用的工具"，比"工具太多选错"好不到哪去。省下的 token 要拿一部分去建评测集、验证检索命中率，这笔账得一起算。

**合并同类项——治重叠。** 名字像、描述重叠、干的事差不多的工具，合并成一个。GitHub Copilot 把自己的工具从 40 个砍到 13 个，同时拿到约 400 毫秒的延迟改善和 2 到 5 个百分点的准确率提升。一个有充分动机宣传能力广的团队，主动把能力交少了，数字还变好了。

厂商自己也在做同一件事。Datadog 的 MCP server 到今年 6 月长到 22 个 toolset、142 个工具，官方文档里专门给了一个 `toolsets` 查询参数，让客户端只要其中一部分。这个参数本身就是一句承认。

合并不是随便合。边界是**在同一个后果等级里合，不跨等级合**。把查询和退款并成一个工具，或者把写操作藏在读操作的 schema 里，那不是优化选择准确率，那是把可靠性问题升级成治理问题——后者修不了。

这一条至少说明一件事：删掉重叠的工具，收益是能被量出来的——延迟和准确率同时改善，而且是主动收窄能力的团队自己报出来的。

**换交付单位——治中间结果。** 前两条还在选哪个工具这个层面打转。第三条换的是单位：让模型写代码去编排工具，中间结果在沙箱里被脚本处理掉，只有最终结果进上下文。

Anthropic 那个差旅预算的例子里，20 多次工具调用、2000 多条费用明细，上下文从 200KB 的原始数据降到 1KB 的结果；整体 token 省 37%，消掉 19 次以上推理往返。

有一个产品把这套做得更彻底：会话那一层根本不放 schema，只放一份目录——接了哪几个系统、一句话说它能干什么。目录够用来判断该找哪个系统，不够用来编造一次调用。工具只有被某条场景规则引用到了，才进这一轮对话。

![按需检索、合并同类、换交付单位，三条路治的病各不相同](/imgs/202609/2026-09-22-agent-tool-sprawl-infographic-3.jpg)

## 按需检索有个反噬：它可能把缓存打破

这一条最容易踩，因为它藏在一个看起来最省 token 的做法里。

直觉是这样：每轮按需取该用的那几个工具，token 最少，所以最好。不对。

原因在提示缓存的层级。模型算前缀的顺序是工具定义、系统提示、消息历史。工具定义在最顶上，它一变，下面所有层级的缓存全部作废。

而命中缓存的 token 单价是未命中的十分之一。以 Claude Sonnet 4 为例，缓存读取是每百万 token 0.3 美元，基础输入是 3 美元。

所以，如果每一轮都动态取一个不同的工具子集，你省下的那点定义 token，一次缓存失效就全赔回去了。

正确的做法和直觉反着来：**核心工具三到五个常驻，且顺序稳定；其余延迟加载。** 延迟的工具是加载进消息历史，不碰前缀。Anthropic 那套设计之所以不破坏 prompt 缓存，就是因为前缀始终是同一份。

顺带一个更隐蔽的坑：有些语言序列化 JSON 时字典键顺序是随机的，Swift 和 Go 都有这个行为。同一批工具每次序列化出来的字节流不一样，缓存照样失效。修法是序列化前把键顺序固定下来。

这套账也不是什么时候都成立。工具本来就少、每轮都用的场景，定义占不了多少缓存前缀，破不破都无所谓。

本地推理也一样。有些自托管后端不跨请求复用 KV 缓存，那十倍价差根本不存在，缓存这一条也就不咬人了。它咬的是多轮对话、走 API、有重复前缀的场景。

## Java 侧怎么接

Spring AI 2.0 把按需检索做成了可替换的 Advisor。加个 starter，开一个开关，默认的 `ToolCallingAdvisor` 就被换掉：

```properties
spring.ai.chat.client.tool-search-advisor.enabled=true
spring.ai.chat.client.tool-search-advisor.tool-index-type=regex
spring.ai.chat.client.tool-search-advisor.max-results=5
```

索引有三种，[官方文档](https://docs.spring.io/spring-ai/reference/api/tools/tool-search-tool.html)列的是 regex、lucene、vector。regex 是默认值，零额外依赖。

迁移指南的口径很一致——先用 regex 起步，等量过目录规模、检索精度和延迟之后，再换 lucene 或 vector。别一上来就架向量库。

有两个点容易翻车。

**一是索引按 session 隔离，调用方每次请求都必须传 session ID。** 默认从 `ChatMemory.CONVERSATION_ID` 取；你们要是习惯用 `tenantId`，可以用 `sessionIdKeyName("tenantId")` 改。

不传的后果不是报错，是几个租户看见彼此的工具。

**二是官方给了三条启用判据**：工具 10 个以上、工具定义每请求超过 10K token、已经观察到选择出错。三条都不占，就老实用默认 Advisor，别为了显得先进多一跳。

LangChain4j 的路线不是同一个形状。它把要不要给模型看做成了工具自己的属性：标 `SEARCHABLE` 的工具，只有被检索策略找到才可见；标 `ALWAYS_ALLOW` 的每轮都在。

上下文里同时维护两个集合：`availableTools`（全部注册的）和 `effectiveTools`（这一轮真正发出去的）。[官方文档](https://langchain4j.cn/tutorials/tools.html)里 `ToolProvider` 那段更实用——按 `userContext`、`chatMemoryId` 在每次请求时决定给哪些工具：

```java
ToolProvider provider = request -> {
    if (request.userContext().contains("admin")) {
        return List.of(new AdminTools());
    }
    return List.of(new UserTools());
};
```

这段对多租户是刚需。不同角色本来就不该看见同一批工具，权限边界不能靠工具描述去兜。

还有两个现成的护栏别浪费：`hallucinatedToolNameStrategy`（模型编了个不存在的工具名时，返回一条安全的错误话术，而不是把栈抛出去），以及 `toolArgumentsErrorHandler`（参数错了回一条模型读得懂的话）。

## 动手之前先量三样

真要动工具层，第一件事不是改配置，是量。打一次请求，看工具定义占了多少 token。把工具清单列出来，标出名字相近、描述重叠的对。建评测集，里面必须放名字相近的、危险的、跨权限边界的工具。

评测集里没有容易混的样本，你测不出检索有没有用。这三样量完，配置改不改、往哪个方向改，自己就清楚了。

最后一个运维上的坑：工具的"健康"不能只看 HTTP 200。有份实测拿 11 个公开 MCP server 做了真握手测试——最快的 97 毫秒，最慢的 20.8 秒，中位数 522 毫秒，差了 215 倍。

这 11 个 server 一共 245 个工具，而一个普通的 uptime 探测，在工具被改名、入参变了之后，照样报健康。

回到开头那个查库存的 Agent。它不缺能力，缺的是清单里那几个工具彼此分得清。工具列表是一份预算，不是一份能力清单——多加一个工具，你同时买到一次新能力，和一次新的选错机会。六十个工具不等于六十项能力，那是六十次挑错的机会。

## 参考资料

1. [Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use) — Anthropic Engineering（defer_loading 机制、58 工具 55K token、134K token 实例、Opus 4 与 4.5 的准确率变化、程序化调用的 token 与延迟数据）
2. [Tool Search Tool](https://docs.spring.io/spring-ai/reference/api/tools/tool-search-tool.html) — Spring AI 官方文档（三类 ToolIndex、maxResults 默认值、session 隔离与 sessionIdKeyName、三条启用判据）
3. [Tool Calling · Scaling to Hundreds of Tools](https://docs.spring.io/spring-ai/reference/api/tools.html) — Spring AI 官方文档（默认 Advisor 的全量发送行为、单属性开关、MCP 工具不自动注册的原因）
4. [工具（函数调用）](https://langchain4j.cn/tutorials/tools.html) — LangChain4j 官方中文文档（ToolProvider 动态工具、ToolSpecification 与 ToolExecutor 配对）
5. [Tools and Function Calling](https://deepwiki.com/langchain4j/langchain4j/3.1-streaming-responses) — DeepWiki 对 LangChain4j 源码的结构化说明（SearchBehavior 的 SEARCHABLE 与 ALWAYS_ALLOW、ToolServiceContext 的 availableTools 与 effectiveTools、hallucinatedToolNameStrategy）
6. [Advanced Tool Use: Scaling Agent Tool Libraries](https://agentpatterns.ai/tool-engineering/advanced-tool-use) — Agent Patterns（三家厂商工具数量建议汇总、Tool Search 两种检索变体、程序化调用的 token 与准确率数据）
7. [Dynamic Tool Fetching Breaks KV Cache](https://agentpatterns.ai/patterns/anti-patterns/dynamic-tool-fetching-cache-break) — Agent Patterns（工具定义位于缓存前缀顶层、缓存读取与基础输入的单价对比、非确定性 JSON 序列化破坏缓存）
8. [Skills Sprawl: When Too Much of a Good Thing Confuses Your AI Agent](https://dev.to/gde/skills-sprawl-when-too-much-of-a-good-thing-confuses-your-ai-agent-4nij) — Google Developer Experts 社区（对 Repantis 等《How Many Tools Should an LLM Agent See? A Chance-Corrected Answer》2026-05 的数据引述；该链接为技术解读，非论文原文）
9. [How Many Tools Can an AI Agent Handle? (2026 Data)](https://nerdleveltech.com/en/how-many-tools-can-an-ai-agent-handle) — Nerd Level Tech（51 至 584 工具的分档对照、混淆缺口不可由检索回收、oracle 检索后仍差约 10 点、BM25 短名单劣于不做短名单、LiveMCPBench 中检索错误的失败占比）
10. [About a quarter of MCP servers expose tools an agent could plausibly confuse](https://dev.to/theopslog/nearly-half-of-mcp-servers-expose-tools-an-agent-could-plausibly-confuse-30om) — TheOpsLog，2026-08-04 更正版（377 个 server、7164 个工具、十七万工具对的混淆度测量，以及原 45.8% 更正为 23.8% 的原因）
11. [You Connected Another Integration. Your Agent Got Worse at Choosing.](https://www.mantissaai.com/blog/agent-tool-budget-not-tool-count) — Mantissa AI（单工具 token 区间、134K 内部实例、Datadog 142 工具与 toolsets 参数、Speakeasy 的 107 工具测试、启用的三条判据）
12. [Too Many MCP Tools Makes Your Agent Worse. Here Is What We Do Instead.](https://aimdoc.ai/blog/too-many-mcp-tools-why-we-built-services) — Aimdoc（63 个工具导致三轮空转的现场记录、会话层只放目录不放 schema 的做法、skill 作为工具的准入开关）
13. [Designing Tools Agents Can Actually Use](https://www.agenticfabriq.com/blog/designing-tools-agents-can-use) — Agentic Fabriq（Anthropic 与 OpenAI、Gemini 的建议区间对照、3251 工具下固定短名单与深搜的取舍、同一后果等级内合并的原则）
14. [Should you build Openrouter for tools?](https://stealwhatworks.com/blogs/news/openrouter-for-tools) — Steal What Works（MCPWatch 2026-06 对 11 个公开 MCP server 的真握手实测：97 毫秒至 20.8 秒、中位数 522 毫秒、215 倍差距、245 个工具与 uptime 探测失效）
15. [AI Agent 开发框架选型与百炼平台 Agent 构建最佳实践](https://developer.aliyun.com/article/1760537) — 阿里云开发者社区（工具功能描述避免歧义、控制工具数量在合理范围内、复杂操作拆分粒度的官方建议）
16. [Your AI Agent Is Not Dumb. You Gave It Too Many Tools.](https://blogs.frigga.cloud/2026/08/your-ai-agent-is-not-dumb-you-gave-it.html) — Frigga Blogs（单工具 100 至 500 token、RAG-MCP 研究中 43% 降至 14% 以下与工具定义占上下文的比例、GitHub Copilot 工具数 40 降至 13 及延迟与准确率变化、五到七个 server 的经验上限；该文为二次整理，《Help or Hurdle?》论文与 RAG-MCP 原始研究均未取得可链地址）
17. [Why Loading Every Tool Into Your AI Agent Makes It Worse](https://www.milik.ai/articles/2c44b150f0) — Milik（172 个工具占用 141K token、开启按需加载后工具占用从 0 到 2.6K 的同一场景对照）

