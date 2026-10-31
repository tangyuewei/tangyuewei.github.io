---
title: 老 Java 项目接 Agent，写接口还是建目录
author: 唐悦玮
date: 2026-10-31 11:03:00 +0800
categories: [Java, AI编程]
tags: [LangChain4j, AgentScope, 遗留系统, Agent, Spring, 改造]
pin: false
comments: true
keyword: LangChain4j, AgentScope Java, 老项目改造, AI Service, HarnessAgent, Java Agent, 遗留系统
---

> **摘要**：两条路都能让老项目接上 Agent，但入口完全不同。LangChain4j 让你声明一个接口，老 Service 加注解变成工具；AgentScope Java 让你建一个 workspace 目录，项目约定写成 Markdown。改动落在哪，决定你后面要维护什么。

改一个跑了七八年的 Spring 项目，让它接上 Agent，最容易想到的问题是"选哪个框架"。

真正决定工作量的问题在另一个地方：**改动落在代码里，还是落在目录里**。

LangChain4j 和 AgentScope Java 正好是这两条路的代表。

## 两条路的入口不一样

| | LangChain4j | AgentScope Java |
|---|---|---|
| 你要写的东西 | 一个 interface | 一个 workspace 目录 |
| 老 Service 怎么变成工具 | 加 `@Tool` 注解 | 挂 MCP server，或写进 `skills/` |
| 上下文放哪 | 接口入参 + ChatMemory | `AGENTS.md`、`MEMORY.md`、`knowledge/` |
| 动业务代码吗 | 动，但基本是加法 | 基本不动 |
| 运行时模型 | 同步为主，也有 `Flow.Publisher` | 基于 Project Reactor |
| 最低 JDK | 8 起 | 17 |

![两条路的入口形状对照](/imgs/202610/2026-10-31-legacy-java-agent-two-paths-diagram-1.png)

## LangChain4j：把老 Service 声明成接口

官方文档给 AI Services 的类比很直白：它像 Spring Data JPA 或 Retrofit——你声明一个接口，框架给你一个代理实现。

```java
interface OrderAssistant {
    String answer(@MemoryId String sessionId, @UserMessage String question);
}

OrderAssistant assistant = AiServices.builder(OrderAssistant.class)
    .chatModel(model)
    .tools(new LegacyOrderService())
    .chatMemoryProvider(id -> MessageWindowChatMemory.withMaxMessages(20))
    .build();
```

老 Service 一行不用改，加个注解就行：

```java
@Tool("按订单号查订单详情，返回状态、金额、下单时间")
public OrderDetail queryByNo(String orderNo) { ... }
```

`@Tool` 里那句描述要当回事。它是模型决定调不调这个方法的唯一依据。老方法名往往叫 `queryByNo`、`getDetail`、`selectById`，模型看不出差别，描述必须自己写清楚。

这条路对老项目友好在**改动是加法**：老的 Service、Controller、Mapper 都不动，新增一个接口加一个配置类。Spring Boot starter 会自动把接口注册成 bean，连 `AiServices.create` 都不用调。

但有个坑得提前知道。官方文档写得很明确：同一个 `@MemoryId` 的 AI Service 不能被并发调用，会损坏 ChatMemory，而且框架没做任何防护。

老系统恰恰是高并发的。用户快速点两下、页面轮询、重试机制，同一个 sessionId 就会并发进来。这不是"可能出问题"，是设计上就没打算管。要么在入口加锁，要么保证一个会话同时只有一个请求，要么干脆不用 ChatMemory。

## AgentScope：把项目知识搬进一个目录

AgentScope 是阿里的多智能体框架，Java 版 2026 年 7 月 GA，JDK 17 起，Maven 坐标 `io.agentscope:agentscope-harness`。

它的入口不是接口，是一个目录：

```text
workspace/
├── AGENTS.md          # 角色与项目约定
├── MEMORY.md          # 长期记忆，框架自己维护
├── knowledge/         # 领域知识与检索索引
├── skills/            # 可复用的技能文件
└── subagents/         # 子 agent 规格
```

代码这边很短：

```java
var agent = HarnessAgent.builder()
    .name("order-helper")
    .model(new QwenConfig("qwen-plus"))
    .filesystem(new LocalFilesystemSpec("./workspace"))
    .session(new RedisSession(jedisPool))
    .build();
```

这套设计的取舍很清楚：**项目约定写成 Markdown，不是写成代码**。`AGENTS.md` 里写一句"这个项目的订单状态只有五种，不要臆造第六种"，比在代码里加一层校验好改，也更容易让不写代码的人参与。

代价在另一面。业务逻辑不在你熟悉的类里了，出问题翻的不是堆栈，是几个 Markdown 文件和对话记录。

部署要求也比 LangChain4j 高。会话默认落本地 workspace，上生产要换成 Redis 或远端存储。官方文档提到，用了沙箱或远端存储却没把会话配置切过去，框架会在启动时直接失败——宁可起不来，也不让生产丢数据。

![两条路的取舍](/imgs/202610/2026-10-31-legacy-java-agent-two-paths-diagram-2.png)

## 怎么选

判据不在框架好不好，在你的老项目价值在哪。

**价值在代码里**——一堆业务规则、状态机、复杂 SQL——选 LangChain4j。它的做法是把这些已有方法包成工具，让模型来调。业务逻辑留在原处，模型只是多了一个入口。

**价值在知识里**——一堆口径、约定、历史决策，散在文档和人脑里——选 AgentScope 那套 workspace。它允许你先把这些写下来，再让 agent 去读。

**如果是高并发对外服务**，LangChain4j 的 `@MemoryId` 并发限制要提前处理，或者干脆不用 ChatMemory，每次请求无状态。

**如果要嵌进现有 Spring Boot 微服务、上 K8s 横向扩容**，AgentScope Java 2.0 的会话外置就是为这个场景做的，前提是能接受它的存储依赖。

## 代价

三条要说清楚。

LangChain4j 是同步为主的库。虽然有 `Flow.Publisher`，但线程和上下文传递得自己管。它最近一个 PR 就在修这个：非阻塞调用下，工具执行和 RAG 卸载跑在"投递答案的线程"上，调用方的 MDC、trace span、security context 全丢，解法是给 `ExecutorProvider` 加 `captureContext()`。老项目那套链路追踪，接完 Agent 可能要重新接一遍。

AgentScope 的 JDK 17 门槛意味着不少存量项目（还在 8 或 11）先得升 JDK，这本身就是一次改造，跟选框架是两笔账。

两个框架都不解决"改完怎么验证"。那是另一件事。

## 最后

回到开头那个问题。选框架之前先看清楚：你是要给老代码加一个入口，还是要给项目知识找一个落脚点。

写接口的那条，动的是代码，换来的是确定性——逻辑在哪、谁调的、出错看哪，全都清楚。

建目录的那条，动的是文档，换来的是可改性——规则谁都能改，改了立刻生效，但边界也松了。

都不轻松，只是疼的地方不一样。

## 参考资料

1. LangChain4j AI Services 官方文档 — <https://docs.langchain4j.dev/tutorials/ai-services>（接口代理、`@Tool`、`@MemoryId` 并发限制均出自此页）
2. LangChain4j 仓库 README — <https://github.com/langchain4j/langchain4j>（官方原话："Despite the name, LangChain4j is not a Java port of LangChain"）
3. LangChain4j PR #6623：把调用方上下文传播到 AI Services 卸载的工作 — <https://github.com/langchain4j/langchain4j/pull/6623>
4. AgentScope Java 官方文档 — <http://java.agentscope.io/en/intro.html>（`HarnessAgent`、workspace 结构、MCP/A2A、沙箱与多租户）
5. AgentScope Java 2.0 发布说明 — <https://www.alibabacloud.com/blog/603231>（会话外置、K8s 横向扩容、启动自检）
