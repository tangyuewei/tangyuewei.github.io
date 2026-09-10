---
title: "给老 Spring 项目装个 AI Agent"
author: 唐悦玮
date: 2026-09-10 10:05:00 +0800
categories: [AI辅助开发]
tags: [Java, Spring AI, AI Agent, 大模型, 工具调用]
pin: false
comments: true
keyword: Spring AI, Java, AI Agent, 老系统改造, 工具调用, ChatClient, 企业工单
---

> **摘要**：老系统想接 AI，别急着搭 Python sidecar。用 Spring AI 在原有 JVM 里跑起一个三段式 Agent：planner 拆活、executor 拿白名单工具干活、reporter 汇报。能力边界靠运行时隔离强制，比在提示词里反复叮嘱管用。

我们内部那套工单系统，2020 年上线，跑了快六年——框架这些年从 Spring Boot 2.x 一路升到 3.5，但业务代码、表结构还是当年的老底子。一线客服每天被问：这周哪些高优先级工单还没关？哪个部门积压最多？以前这些得人肉查列表、拼 SQL、再敲一段回复。慢，还容易漏。

我想让它自己回答。需求一句话：把老系统"能查什么、能改什么"交给模型，让它自己动手，回话像个懂业务的同事。

先说结论，省得往下读还绕：**真正要的不是更聪明的聊天接口，是 Agent——一个能调用老系统能力的循环**。而这个东西在 Java 里就有现成做法：Spring AI 1.1.x（官方框架，2026 年 6 月发到 1.1.8），不用换技术栈，不用起 Python 服务。

---

## 先想清楚：老系统缺的是"手"

只调大模型 API 的路子，试过的人都知道三个坎：

模型不会"查"。你只能把数据整个塞进提示词，一次塞不下，塞下了也是过期快照。

输出靠运气。让它列个工单清单，它可能给你编一段 Markdown 表格，列名还是它猜的。

它管不住自己。提示词里写"只读、不要改数据"，它照样可能在你没注意的地方自作主张。

ChatGPT 是问答——你问一句，它答一句。Agent 是循环——理解目标、选工具、执行、看结果、不行再来。对后端工程师来说，这个概念其实不陌生：**Agent 就是一个有 LLM 大脑的微服务**，只是以前你写死 if-else 的分支，现在由模型决定调哪个工具、传什么参数。

给老系统装 Agent，本质是给它装"手"：把 Service 方法暴露成模型能调的工具，让它在你的代码里干活，而不是在你的提示词里猜。

## 三段式：拆活、干活、交差分开

第一个坑来得很快：让同一个模型既拆任务、又执行、又检查，长任务里它必串台——拆着拆着开始编结果，执行时忘了边界。

解法是把一次请求拆成三个角色，各用独立的 ChatClient：

| 角色 | 职责 | 手里有什么 |
|------|------|-----------|
| planner | 看懂目标，拆成任务清单 | 没有工具，只输出结构化清单 |
| executor | 一次干一个任务，把结果交回去 | 只拿当前能力组的工具 |
| reporter | 汇总各步结果，组织成人话回复 | 只读上一步的结果 |

代码长这样——三个角色共享同一个 ChatModel，但 prompt 和工具完全分开：

```java
record Plan(List<String> steps) {}

@Service
class TicketAgentService {
    private final ChatClient planner, executor, reporter;

    TicketAgentService(ChatModel model, ToolCallbacks queryTools) {
        this.planner = ChatClient.builder(model)
            .defaultSystem("你是工单客服助手。把用户目标拆成 3 步以内的执行清单，输出 JSON，不要调用任何工具。")
            .build();
        this.executor = ChatClient.builder(model).build();   // 工具按请求动态给
        this.reporter = ChatClient.builder(model)
            .defaultSystem("根据执行结果，用中文回复用户，注明数据来源，不要编造没有查到的数字。")
            .build();
    }
}
```

拆开之后每个角色的上下文都很短：planner 不需要猜执行细节，executor 一次只看一个任务，reporter 只做归纳。实践下来，模型编造结果的次数明显变少——它手里的事情少了，能编的空间也就小了。

![三段式分工与数据流：planner 只拆活不碰工具，executor 一次一件只拿白名单工具，reporter 汇总并注明来源](/imgs/202609/2026-09-10-spring-ai-agent-for-legacy-system-infographic-1.jpg)

## capability：边界靠结构，不靠提示词

这是整篇最想讲的部分。

Spring AI 2.0.1 的发布公告里有一个安全修复（CVE-2026-59318）：某些配置下，即使某个工具没有公开给当前请求，模型仍可能被提示注入"拐"到全局兜底解析，把没暴露的工具调起来。官方原话的意思很直接：**Agent 的边界不能只靠"告诉模型"维持，必须由运行时强制执行。**

所以老系统的能力要分级，我分了两个 capability：

- `query`：只读。查工单、按部门聚合、按状态筛选。
- `handle`：可写。改状态、派单、加备注。（真实客服流程里写操作往往还要人工确认一环，这里先不展开。）

实现上每个 capability 是一组独立的 ToolCallback。调用时用 `.tools()` 显式传入——Spring AI 1.1 的规则是**运行时工具完全覆盖默认工具**，也就是说这次请求里，模型手里只有你给的那几个，多一个都没有：

```java
// 只读会话：模型手里只有查询工具，物理上碰不到写操作
String answer = executor.prompt()
    .system("你只能查询工单，禁止任何修改操作。")
    .user(userQuestion)
    .tools(queryCapability.callbacks())   // 只有 query 组的工具
    .call()
    .content();
```

想走"处理流程"（关单、派单）？那需要另一个带着 `handle` 工具的 executor 实例，并且由业务代码决定什么时候构造它——**是否放权是代码逻辑，不是模型自觉**。

![capability 边界：靠提示词叮嘱是软约束一戳就破，靠 .tools() 运行时隔离才是物理硬墙](/imgs/202609/2026-09-10-spring-ai-agent-for-legacy-system-infographic-2.jpg)

## 落地：老 Service 怎么变成 Agent 的手

老系统的 Service 不需要大改，加注解就行：

```java
@Service
class TicketQueryService {
    @Tool(description = "按部门统计未关闭工单的数量，按数量降序返回")
    List<DeptCount> countOpenByDept() { ... }   // 老方法原样保留
}
```

`@Tool` 是 Spring AI 的声明式工具注解（`org.springframework.ai.tool.annotation`），一个方法一个工具，方法签名自动变成模型可理解的参数协议。

planner 的输出要结构化成任务清单，用 `entity()` 把 JSON 直接映射成 record：

```java
Plan plan = planner.prompt().user(userQuestion)
    .call().entity(Plan.class);   // 输出非法 JSON 时这里会抛异常，见下文踩坑
```

然后是循环与兜底，三件事缺一不可：

**步数上限。** 1.1.x 没有内置的工具调用次数限制，我手写：任务不超过 3 步，executor 单任务重试不超过 2 次。超过就报错退出，让 reporter 如实告诉用户"这个问题我没处理完"，绝不编一个"已完成"。

**超时。** 整个 Agent 调用包一层超时（60 秒），超时直接回退"已转人工"。客服场景里，宁可让人等，不能让机器人空转烧钱。

**校验。** planner 拆出来的任务如果不在已知能力清单里，丢弃并跳过，reporter 如实说明哪些没做。

## 踩坑记录

**坑一：模型想调用不存在的工具。** 执行"把单号 T20260901007 直接关了"时，executor 手里只有查询工具，模型仍尝试调用 `closeTicket`。工具名解析失败，请求直接报错——我最初把报错透传给了用户（"系统错误"），后来改成捕获并让 executor 用文本返回"当前会话只能查询工单，不能改单"。拦截是结构保证的，但这个台阶要自己铺。

**坑二：循环烧 token。** 有次 executor 在同一个问题上连续调了十几轮工具，每次都差一个数据，始终没停下来。加了步数上限后，这类问题从"悄悄烧钱"变成"快速失败"。工具调用循环必须有预算——这条后来写进了团队的代码规范。

**坑三：结构化输出翻车。** planner 偶发返回非法 JSON——被截断，或者外面多包了一层 Markdown 代码块。处理：解析失败重试一次，仍失败就把整件事降级为"暂时处理不了"，转人工。

**坑四：工具描述就是泄密面。** 一开始我把 `@Tool` 的 description 写得很"内部"："查询 t_ticket 表按 dept_id 聚合"。工具描述是要发给外部模型厂商的——这等于把表结构送出去了。改成业务化描述："按部门统计未关闭工单数"。查什么、怎么查，留在方法里。

**坑五：事务边界别指望 Agent。** 老 Service 方法各自带 `@Transactional`。Agent 一次任务调多个方法，不代表一个事务。需要原子性的操作，绝不能拆成多步让模型自己拼——拆之前先想清楚哪些是"一个动作"，那部分留给普通代码。

## 怎么验证这套东西

我把上面这套装进一个模拟工单库的示例工程，跑了客服最常见的几类问题做对照：单轮"全量上下文"直答，对比三段式 Agent。样本小、没做严格基准，结论只能当方向参考，但有两个差异是**结构上必然成立**的：

越权被拦，是必然的。写工具根本不在 executor 的工具列表里，模型想调也调不到——这不是它"自觉"，是它手里没有。

多条件组合查询的格式稳定，是设计出来的。reporter 只做归纳，输出口径由它的 prompt 约束，不会出现"这次表格、下次散文"的漂移。

代价也要说清楚：三段式明显更烧 token——拆解、执行、汇总，每个角色都在消耗。**多花的 token 买的是可控性**，值不值，取决于你的场景对"乱来"的容忍度。客服这种对用户可见的场景，值。

## 总结

给老系统装 Agent，不是重写一遍，是加一个会调工具的大脑。核心三件事：**拆角色**（planner/executor/reporter）、**分能力**（capability 隔离工具）、**设上限**（步数、超时、重试）。

适用场景：Service 边界清晰、操作可枚举、对一致性要求不高的查询与辅助场景。不适用：一次动作横跨多库多事务、需要强一致的场景——那是人的活，别硬塞给 Agent。

版本提示：本文代码基于 Spring AI 1.1.8（Java 17 + Spring Boot 3.5 可直接用，参考[官方文档](https://docs.spring.io/spring-ai/reference/1.1/api/tools.html)）。2.0 已于 2026 年 6 月 GA，要求 Java 21 + Boot 4，把工具循环挪进了 ToolCallingAdvisor，循环预算（`maxToolCalls`）和执行校验都有了原生配置（见[2.0.1 发布公告](https://spring.io/blog/2026/08/21/spring-ai-2-0-1-available-now/)）。老系统升 2.0，本质是一次 Boot 大版本升级，别当小版本顺手升。
