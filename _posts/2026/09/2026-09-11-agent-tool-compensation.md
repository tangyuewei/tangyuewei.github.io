---
title: "给 Agent 的工具调用加上事务"
author: 唐悦玮
date: 2026-09-11 08:08:38 +0800
categories: [AI编程, Java]
tags: [LangChain4j, Agent, 工具调用, 补偿事务, Saga, Java, AI编程]
pin: false
comments: true
keyword: LangChain4j 工具补偿, CompensateFor, compensateOnError, Agent 事务, Saga 补偿模式, Java Agent
---

> **摘要**：Agent 连调三个工具，第三个挂了，前两个的副作用留在系统里，传统事务管不到。LangChain4j 1.17 起给工具加补偿动作，1.19 扩到整个 Agent 层级。补偿不等于回滚，边界在哪。

后端工程师对事务的直觉是刻进肌肉记忆的：一个方法里连着写三张表，第三步抛异常，前两步自动撤销，数据库回到干净状态。

把这套直觉搬到 Agent 上，当场失效。

一个工单 Agent 连着调三个工具：建工单、占用供应商配额、发通知。第三个超时挂了。前两步的副作用留在系统里——工单建了，配额占了，没人管。

这不是代码写得烂。事务能回滚，是因为三个写操作在同一个数据库连接里，数据库自己知道怎么撤销未提交的改动。而 Agent 调的是三个不同接口，跨进程、跨系统，其中一个可能是别人的 SaaS。

更麻烦的是调用顺序。模型决定调什么、按什么顺序调，这个顺序是运行时才长出来的，你写代码的时候根本不知道。

## 补偿：撤不回来，就再发一个反向动作

Saga 模式的核心思路不复杂：把长流程拆成若干本地操作，每个都配一个补偿动作。失败时从后往前，逐个执行补偿。

一句话记住它：**补偿不是撤销，是再发一个业务上相反的动作。**

数据库回滚是"当没发生过"。补偿是"我转出去了 100 块，再转回来 100 块"——账面上多两条流水，时间戳骗不了人。

这个区别听着像抠字眼，但它决定了后面所有的边界。

![三个工具正序执行，第三个失败后逆序补偿：释放配额、取消工单，前两步的副作用被反向动作抵消，但流水记录保留](/imgs/202609/2026-09-11-agent-tool-compensation-infographic-1.jpg)

## LangChain4j 的答案：一个注解加一个开关

LangChain4j 1.17.0（2026-06-26 发布）把补偿做进了框架。给工具方法配一个补偿方法，用 `@CompensateFor` 标上：

```java
@Tool("占用供应商配额")
String reserveQuota(String supplierId, int amount) {
    // 调外部接口占配额
    return "QUOTA-" + amount;
}

@CompensateFor("reserveQuota")
void releaseQuota(String supplierId, int amount) {
    // 释放配额
}
```

开关在构建 AI Service 的时候打开：

```java
Assistant assistant = AiServices.builder(Assistant.class)
        .chatModel(model)
        .tools(new SupplierService())
        .compensateOnToolErrors(true)
        .build();
```

官方文档把语义写得很明确：任一工具执行失败，此前所有已成功执行、且带 `@CompensateFor` 的工具，**按逆序**执行补偿。后做的先撤。

两个细节值得单独拎出来。

第一，`@CompensateFor` 方法**不暴露给模型**。它是内部补偿基础设施，不出现在工具的 JSON Schema 里。模型不会"想起来"去调它，也没法绕过它。

第二，补偿**永远串行逆序执行**，即使你开了 `.executeToolsConcurrently()` 让工具并发跑。文档专门加了一条 note 说明这件事——并发省下的时间，失败时要用串行补偿还回来。

## 补偿方法的两种写法

参数按类型匹配，有两种写法。第一种和正向工具同参数：

```java
@CompensateFor("reserveQuota")
void releaseQuota(String supplierId, int amount) { ... }
```

第二种只接一个 `ToolExecution`，从里面把正向调用的结果捞出来：

```java
@CompensateFor("reserveQuota")
void releaseQuota(ToolExecution execution) {
    String quotaId = execution.result();  // 正向返回的 "QUOTA-42"
    // 拿这个 ID 去释放
}
```

第二种更实用。正向调用返回的流水号、订单号、事务 ID，补偿时基本都要用上，靠原始入参拼不出来。

## 三个坑

### 坑一：补偿必须幂等，因为框架不知道它到底成没成

最典型的是超时。工具调用超时，框架判定失败，触发补偿。但对面系统可能已经执行成功了，只是响应慢。

这时候补偿跑起来，就是"释放一个已经释放过的配额"。补偿方法得能吞下这种情况——先查状态再决定，或者干脆设计成幂等操作。

框架层面不解决这个问题，也不会提醒你。文档用的词是"尽力而为"。

### 坑二：只覆盖 @Tool 注解方法

这条是硬限制，写在注解的源码注释里：

> Only `@Tool`-annotated methods support compensating actions. Programmatically or dynamically defined tools (e.g. MCP tools, tools registered via `ToolSpecification`) are not supported.

翻译一下：MCP 工具、通过 `ToolSpecification` 动态注册的工具，**全都不在保护范围内**。

这个限制在企业场景里很要命。现在不少团队的做法是把内部系统接口批量用 MCP 暴露给 Agent——恰恰是这些写操作最需要补偿。工具暴露方式一换，补偿能力就没了。

### 坑三：补偿自己失败，只记一条 WARN

官方文档原文：

> Compensation is best-effort: if a compensating action itself throws an exception, it is logged at WARN level and the remaining compensating actions continue to execute.

补偿失败只写日志，不中断，也不抛给调用方，剩下的补偿继续跑。

工程含义是：**没有原子性保证，也不会有异常冒到你的 catch 块里**。你以为 try-catch 能兜住，实际上补偿在半路悄悄失败了，系统停在一个不一致的中间态。

想接住这种失败，得自己挂日志告警，或者用下面说的事件机制。

## 模型不知道补偿已经发生了

补偿方法不暴露给模型，这条前面提过。它还有个连带效果：模型只看到工具失败的错误消息，并不知道框架已经替它收拾过了。

后果是模型很可能自己再调一遍反向工具。你刚释放完配额，它转头又调了一次释放接口——这又回到坑一：补偿方法必须幂等，重复释放才能避免。

在系统提示词里补一句：写操作失败后框架会自动补偿，不要自行调用反向操作。一行字省掉一整类重复补偿。

![补偿的两条边界：覆盖边界上 MCP 与动态注册工具不在保护范围，语义边界上 best-effort 只保证有序清理、不保证原子性](/imgs/202609/2026-09-11-agent-tool-compensation-infographic-2.jpg)

## 从单个 Agent 扩到整个 Agent 层级

上面这些是"一个 Agent 内部"的补偿。现在的 Agent 系统多把一个任务拆给多个子 Agent 串行执行：扣款 Agent、记账 Agent、通知 Agent 依次执行。

通知 Agent 挂了，扣款和记账的副作用谁来管？

1.19.0（2026-08-14 发布）把补偿扩到了整个 Agent 层级：

```java
UntypedAgent transferWorkflow = AgenticServices.sequenceBuilder()
        .subAgents(creditAgent, debitAgent, notificationAgent)
        .compensateOnError(true)
        .outputKey("result")
        .build();
```

语义和单 Agent 层一致，只是范围更大：层级里任一代理抛异常，此前所有成功的、带 `@CompensateFor` 的工具调用按逆时间序补偿，最后执行的先撤。没有 `@CompensateFor` 的工具直接跳过。

这里有两套开关，容易搞混。`compensateOnToolErrors(true)` 管单个 AI Service 内部的工具链，是 1.17 的能力；`compensateOnError(true)` 管组合 Agent 的层级，是 1.19 的能力。

## 补偿发生了什么，得有地方看

1.20.0（2026-09-04 发布）补上了可观测性。补偿不再是黑盒，会发 `ToolCompensatedEvent`，带三样东西：被补偿工具的请求、它当初成功的返回值、以及补偿原因。

补偿原因只有两种：

```java
public enum CompensationReason {
    TOOL_EXECUTION_FAILED,   // 同一轮里另一个工具失败了
    INVOCATION_CANCELLED     // AI Service 调用被取消
}
```

一次 AI Service 调用内可以触发多次。挂个监听器，补偿就进得了告警和审计——这是坑三的正解。

## 什么时候该用，什么时候别硬用

适用场景：进程内、工具数量三五个到十个、补偿动作能写成幂等的接口调用。这种场景一个注解加一个开关就够了，比自己手写 try-catch 补偿栈干净得多。

不适用场景：补偿链跨多个独立部署的服务，且需要故障恢复——进程崩了重启还能接着补偿。框架这层补偿是进程内、内存态的，进程一挂，补偿链就没了。这种情况得上带持久化的 Saga 协调器。

补一句 Java 生态的对照。Spring AI 的工具异常处理走的是另一条路：工具抛异常包装成 `ToolExecutionException`，交给 `ToolExecutionExceptionProcessor`，要么把错误消息回给模型让它自己纠正，要么重抛给调用方。它**没有补偿能力**。

这两件事经常被混为一谈：错误处理解决"出错了怎么往下走"，补偿解决"已经落地的副作用怎么办"。前者不回答后者。

所以选型上：要模型自己从错误里恢复，Spring AI 的机制够用；要撤销已经发生的业务动作，得看 LangChain4j 这层，或者自己搭协调器。

## 事务的边界，就是你能控制的范围

回到开头那个工单 Agent。加了补偿之后，第三个工具挂了，框架逆序调用释放配额、取消工单，工单系统里不再留垃圾数据。

但要说清楚它给的是什么：**不是原子性，是一次有序的、尽力而为的清理。**

数据库事务的原子性是数据库给的保证——要么全成，要么全不成。补偿给的是"尽量收拾干净"，而且收拾本身也可能失败。这两个东西的强度差着一个量级，把补偿当事务用，出事的时候会很意外。

好在边界是清楚的：进程内、`@Tool` 注解方法、补偿动作幂等。这三条满足，它就够用。超出这三条，别指望框架，老老实实上带持久化的协调器。

## 参考资料

1. LangChain4j 官方文档 · Tools（Compensating Tool Actions），https://docs.langchain4j.dev/tutorials/tools
2. LangChain4j 官方文档 · Agents（Cross-agent compensation），https://docs.langchain4j.dev/tutorials/agents
3. Spring AI 官方文档 · Tool Calling，https://docs.spring.io/spring-ai/reference/api/tools.html
