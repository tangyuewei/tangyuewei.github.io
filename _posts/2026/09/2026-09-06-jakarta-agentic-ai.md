---
title: "Java Agent，终于有了官方写法"
author: 唐悦玮
date: 2026-09-06 10:21:00 +0800
categories: [AI编程, Java]
tags: [Java, Jakarta EE, Agent, AI编程, CDI, LangChain4j, 规范]
pin: false
comments: true
keyword: Jakarta Agentic AI, Jakarta EE, Java Agent, CDI, LangChain4j, AI 编程规范
---

> **摘要**：Eclipse 基金会发布 Jakarta Agentic AI 1.0-M1：Agent 就是 CDI Bean，注解描述工作流，事务持久化直接复用。企业 Java 第一次为 Agent 立规范。

先做一道选择题。你的后端项目要接一个 AI 智能体：要检索增强，有人推荐 LangChain4j；要跟 Spring 深度集成，有人推荐 Spring AI；场景很轻，有人干脆自己封装一个循环去调模型 SDK。

三套方案的 API 完全不同，换一套等于业务重写。

8 月下旬，Java 企业版的标准流程给这个局面递了个新答案。Eclipse 基金会旗下的 Jakarta EE 工作组上线了 Jakarta Agentic AI 1.0 的第一个里程碑（1.0.0-M1）。

代码仓库在 [jakartaee/agentic-ai](https://github.com/jakartaee/agentic-ai)。一句话：给"在 Jakarta EE 运行时里构建、运行 AI 智能体"立一份厂商中立的规范。

先分清"官方"的两种含义。Java SE 的官方，是 Oracle 主导的 JCP 流程；企业 Java 的官方，走 Eclipse 基金会下 Jakarta EE 工作组的流水线。

Servlet、JPA、CDI、REST 这些规范，都从这条流水线里出来。玩法也一致：一套 API 定成规范，多家厂商各自实现，实现要过兼容性测试，应用可以在实现之间迁移。这是"官方写法"和"框架写法"最本质的区别。

Jakarta Agentic AI 的定位写得很克制——官方说明里明确说，目的不是取代 LangChain4j 或各家模型厂商的 SDK（[DZone 解读](https://dzone.com/articles/java-enterprise-is-already-ready-for-the-ai-era)见参考资料 3）。

它想给的，只是让用 Jakarta EE 构建智能体的人，有一个标准的编程模型。

## M1 的注解清单

M1 摆上桌的 API 概念少而小：

- `@Agent`：声明一个类是智能体，默认带工作流作用域
- `@Trigger`：定义工作流入口，这个版本里由 CDI 事件唤起
- `@Decision`：决定工作流是否继续、怎么继续
- `@Action`：定义工作流里的一步
- `@Outcome`：标记工作流结束
- `@HandleException`：处理工作流内的异常
- `@WorkflowScoped`：每次工作流执行提供一个 CDI 上下文
- `LargeLanguageModel`：可注入的轻量门面，负责跟 LLM 交互
- `Result`：一次决策的结果

读这份清单，先要抓住的不是注解本身，而是它把 Agent 拆成了什么：一次工作流 = 入口（Trigger）→ 判断（Decision）→ 执行（Action）→ 收尾（Outcome），外加异常兜底。

## Agent 就是一个 CDI Bean

![Jakarta Agentic AI 的注解工作流：一个 Agent 作为 CDI Bean 活在容器里，由事件触发入口，经 Decision 判断、Action 执行、Outcome 收尾，事务与持久化全程复用](/imgs/202609/2026-09-06-jakarta-agentic-ai-infographic-1.jpg)

官方公告里带了一个欺诈检测的示例，我做了精简：

```java
@Agent
public class FraudDetectionAgent {

    @Inject
    LargeLanguageModel model;      // 像注入普通 Bean 一样注入模型
    @Inject
    EntityManager entityManager;   // 企业数据直接可用

    @Trigger
    void handleTransaction(@Valid BankTransaction transaction) {
        // 工作流入口，由 CDI 事件唤起
    }

    @Decision
    Result checkFraud(BankTransaction transaction) {
        String output = model.query(
            "Is this transaction fraudulent? If so, how serious is it?",
            transaction);
        return new Result(isFraud(output), null);
    }

    @Action
    void handleFraud(Fraud fraud, BankTransaction transaction) {
        // 业务副作用，留在熟悉的 Java 域里
    }

    @Outcome
    void markTransaction(BankTransaction transaction) {
        entityManager.merge(transaction);   // 收尾直接 JPA 落库
    }
}
```

这段代码跟 Spring 的 `@Service` 加 `@EventListener` 几乎是同一个语感。AI 能力不再是外面套一个独立运行时，而是作为一个普通 Bean 活在容器里。

事务、持久化、事件、安全——应用里已有的东西，Agent 全都能用。

8 月初我在《都是 AI 写代码，为什么 Java 慢一拍》里写过，依赖注入和 AOP 让外部 AI 读不懂 Java 项目。这次值得注意的反差是：当智能体从"外部读者"变成"容器内一等公民"，同一根依赖注入从障碍变成了红利。

两个方向别混——一个讲 AI 怎么读你的代码，一个讲你的代码怎么写 AI。

## 平台派，还是库派

![两条路线对照：平台派（Jakarta 注解规范，多家容器实现、语义稳定可事务）与库派（LangChain4j 式工具+检索生态，20+ 模型厂商、迭代快），底部两派以 CDI 适配层握手](/imgs/202609/2026-09-06-jakarta-agentic-ai-infographic-2.jpg)

同一周，库派也没闲着。LangChain4j 这类库的核心是"工具 + 检索"：AiServices、@Tool、EmbeddingStore、Memory，统一接 20 多家模型厂商（见参考资料 5）。

工具、RAG、记忆、结构化输出一应俱全。你写一个接口，框架在背后把模型调用、工具执行、记忆注入都编排好。

Jakarta 这派的语义重心是"工作流步骤"：入口、判断、执行、收尾，每步都落在 CDI 的容器语义上。

前者的长处是生态广、迭代快，今天的模型明天就能接上；后者的长处是语义稳定、可审计——Agent 的每个步骤都是容器管理的 CDI 方法，事务注解这类能力可以直接往上叠。

所以这不是二选一的淘汰赛。官方自己都说不是取代。LangChain4j 也做了 CDI 适配层，把接口派的模型接进 Jakarta EE 容器——两派在边界上已经开始握手。

真正该想清楚的是你的项目站在哪一端。已经跑在 Jakarta EE 里的企业应用，要的是一个能进事务、能过审计、写一次跑多家的 Agent——等规范值得。

从零搭的 Spring Boot 或 Quarkus 应用，要的是最快把 RAG 和工具调用跑起来——库派今天就能交付。

给一个更朴素的判断标准：你的 Agent 是"业务流程里的一个步骤"，还是"一个独立的产品能力"。前者跟着平台走，后者跟着生态走。

## 第一个吃螃蟹的容器

规范是纸，运行时才是真的。8 月的 Azul Payara 社区版（7.2026.8）把 Jakarta Agentic AI 1.0 API 首次集成进了 Payara 7 运行时预览——这是 Jakarta EE 11 认证容器第一次装上这套 API（[Azul 官方博客](https://www.azul.com/blog/whats-new-in-the-august-2026-azul-payara-release)见参考资料 2）。

官方的说法是：你可以像写 REST 接口一样写 Agent，不需要再维护一个独立的 Agent 运行时，也没有框架锁定。

预览的意思要读准：M1 还处于征求反馈阶段，规范草案已公开。这个阶段参与成本最低——对着 API 提意见，还来得及影响它定稿。

同期的另一个信号在数据层：Jakarta EE 12 把重心放在 Data、Persistence、NoSQL 和新起的 Jakarta Query 上，补的正是 AI 应用最需要的企业数据地基（见参考资料 3）。

Agent 规范是骨架，数据访问是血肉，两边在往同一个方向走。

## 我的判断

![Java 平台标准化历史曲线：底部散落的碎片 → 中部规范契约卷轴辐射连接线 → 顶部三座统一玻璃塔坐落于同一金色地基](/imgs/202609/2026-09-06-jakarta-agentic-ai-infographic-3.jpg)

Java 开发者对"框架乱战 → 平台收编"这条曲线不陌生。JSON 处理、HTTP 客户端、依赖注入，都经历过各家自成一派、最后由规范统一的过程。

Agent 编程模型正在走同一条路：先是框架各自定义 Agent 是什么，然后是平台下场定义一份大家都能实现的契约。这个过程不会快——M1 到 1.0，中间隔着无数轮反馈和兼容性测试的打磨——但方向很少逆转。

对写 Java 的人，两件事现在就能做。一是把 M1 的规范草案和示例代码读一遍——它不长，而且可能是你第一次用平台的语言而不是框架的语言去描述一个 Agent。

二是生产项目不必等：今天该用库派还用库派，但在接口边界上留出余地，模型调用收进一个门面，别散落在业务代码里。等 Jakarta Agentic AI 1.0 落地、容器实现跟上，迁移的成本会比现在小得多。

"官方写法"四个字很容易被读成"官方答案"。它不是。它更像一纸契约的开头——你写 Agent 的方式，正在从"跟某个框架绑定"，变成"跟一份所有实现都要遵守的约定绑定"。

对后端工程师来说，这个变量比大多数单个框架的更新都更值得跟踪。

## 参考资料

1. jakartaee/agentic-ai：*Jakarta Agentic AI* 规范仓库（GitHub），https://github.com/jakartaee/agentic-ai
2. Azul：*What's New in the August 2026 Azul Payara Release?*，2026-08，https://www.azul.com/blog/whats-new-in-the-august-2026-azul-payara-release
3. DZone：*Java Enterprise Is Already Ready for the AI Era*，https://dzone.com/articles/java-enterprise-is-already-ready-for-the-ai-era
4. Foojay：*What's New In The August 2026 Azul Payara Release?*，https://foojay.io/today/whats-new-in-the-august-2026-azul-payara-release/
5. LangChain4j 官方文档，https://docs.langchain4j.dev
