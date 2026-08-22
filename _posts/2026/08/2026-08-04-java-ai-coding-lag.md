---
title: "都是 AI 写代码，为什么 Java 慢一拍"
author: 唐悦玮
date: 2026-08-04 18:40:00 +0800
categories: [AI编程, Java]
tags: [Java, Spring Boot, MCP, AI编程, Spring AI, 开发体验]
pin: false
comments: true
keyword: Java AI编程, Spring AI, MCP Java SDK, Java开发体验, Spring Boot, Harness Engineering
---

> **摘要**：MCP 的 Java SDK 其实存在——由 Spring AI 团队与 Anthropic 协作维护，社区活跃，规范通过率 100%。但为什么 Java 开发者的 AI 编程体验仍然差了一个量级？问题不在 SDK，在 Java 项目本身的结构性特征：依赖注入让 Agent 找不到边界、AOP 让执行路径不可见、微服务架构让项目跑不起来。本文拆解这四个结构性问题，给出可操作的改善建议。

---

先说一个会让人意外的事实。

MCP 其实有官方 Java SDK。

代码仓库在 `github.com/modelcontextprotocol/java-sdk`，与 Spring AI 团队联合维护。贡献者名单里有 Broadcom、Oracle、Google、Apache Pekko 的工程师。规范通过率：Server 端 100%（40/40），Client 端 90%，Auth 端 98.9%。

Spring AI 还在此基础上封装了 Boot Starter——`spring-ai-starter-mcp-server-webmvc`，用 `@Tool` 注解就能把 Spring Bean 暴露为 MCP 工具。教程不缺，文档不烂，社区不冷。

但现实是另一回事。

你跟任何一个 Java 后端聊天，聊到 AI 编程体验，十有八九会得到类似评价："还行，但跟写 JS 或者 Python 比起来，就差了一个级别。"

这个差别跟 MCP SDK 有没有无关。它不是"少了个工具"的问题。它是 Java 项目本身的结构，天然对 AI Coding Agent 不友好。

## 问题一：依赖注入让 Agent 找不到边界

Java 开发者最习惯的事，可能是 AI 最困惑的事。

`@Autowired` 是 Spring 的魔法，也是 Agent 的噩梦。你在 Controller 里写一个 `private UserService userService`，不需要 `new`，不需要工厂方法，Spring 容器在启动时自动帮你搞定。这对人来说是便利，对 Agent 来说是困惑——"这个对象从哪来的？为什么没看到初始化？"

更麻烦的是多实现注入。如果你的 `PaymentService` 接口有三个实现——`AlipayPaymentService`、`WechatPaymentService`、`UnionPayPaymentService`——Agent 需要理解 `@Qualifier` 的语义、理解 Spring 的 Bean 命名规则、理解为什么有时候用 `@Primary` 有时候不。这些都不是"读代码"能读出来的，需要项目级的上下文。

一个典型的场景：你让 Claude Code 修一个支付回调的 Bug。它找到 `PaymentService` 接口，找到调用的那个方法，然后愣住了——应该注入哪个实现？它能猜，但猜错的概率不低。

AI 编程工具擅长的模式是"函数式"的——输入明确、输出明确、路径可追踪。依赖注入打破了这种线性追踪，控制流在 XML 配置、注解和容器之间跳转。Agent 能看到每个 Bean 的定义，但看不到 Bean 之间的连接关系是在运行时才建立的。

## 问题二：AOP 让你的执行路径不可见

Spring AOP 是另一个 Agent 杀手。

你写了一个 `saveOrder` 方法，里面只有三行代码。但实际运行时，这个方法被切面包了几层——`@Transactional` 套了事务管理，`@Cacheable` 套了缓存逻辑，`@PreAuthorize` 套了权限校验，可能还有自定义的日志切面、监控切面、链路追踪切面。

Agent 读源码的时候只看到三行。它不知道这三行外面还裹了五层代理。

后果很直接。Agent 生成的测试可能忽略事务边界，它修 Bug 可能绕过权限校验，它重构代码可能打破缓存策略。不是它"笨"，是它看不到代理层。

这是 Java 项目独特的信息不对称。Python 也有装饰器，但 Python 的装饰器模式是显式的、逐层堆叠的，调用栈可读。Spring AOP 基于动态代理，切面逻辑在运行时织入，字节码层面才能看到真实路径。Agent 读的是源码，不是字节码。

## 问题三：微服务架构让项目跑不起来

这是最致命的问题。

Addy Osmani 在讨论 Harness Engineering 时反复强调一点：Agent 需要能在本地运行的环境来验证输出。Claude Code 在 Node.js 项目里厉害，很大程度上是因为 `npm install && npm test` 在绝大多数项目中能直接跑通。

Java 微服务项目不一样。

一个典型的 Spring Cloud 项目依赖：Nacos 做服务发现、Sentinel 做流量控制、RocketMQ 做消息队列、Seata 做分布式事务、XXL-JOB 做定时任务。每个依赖都是一个独立的中间件，在云端跑得很稳，在本地基本不可用。

结果是一个很熟悉的死循环：

```text
本地写代码 → 推到预发部署 → 在预发验证 → 把结果反馈给 AI → AI 继续改 → 再推预发 → 再验证 → ...
```

每一步，人都是阻塞点。跟那些本地能直接跑的项目——AI 自己迭代几十轮——比起来，Java 微服务项目里 AI 每做一步都得等人。

一篇社区讨论把这个差距总结得很准："CLAUDE.md 写得再好，AI 连代码能不能编译通过都验证不了，后面的一切都是空谈。"

## 问题四：生态碎片化

MCP Java SDK 本身没问题。问题在于它要适配的生态。

Java 项目用 Maven 还是 Gradle？Spring Boot 2 还是 3？Java 8 还是 17？MyBatis 还是 JPA？Spring MVC 还是 WebFlux？要不要 Spring Cloud？用什么注册中心？

每种选择都对应一套不同的配置模板、启动参数、依赖组合。Agent 需要在配置驱动的世界中找到执行路径，而不是在显式代码中。项目的"灵魂"分散在 yaml、properties、XML 和注解中，没有一个集中的地方告诉 Agent "这个项目是这样工作的"。

再加上 Java 项目的七层结构——Controller、Service（接口+实现）、Mapper、Entity、DTO、VO、Config——每一层都有不同的职责和约定。Agent 要同时理解这七层之间的关系，才能在"加一个查询接口"这种看似简单的任务中不出错。

事实上，最近有开发者拿 Kimi K3 试了一个典型的 Java 场景：在一个既有 Spring Boot 项目中加一个带分页的列表查询接口。结果分了三轮：第一轮生成的 Mapper XML 里 `resultType` 写错了包名，第二轮 Controller 的 `@GetMapping` 和 Service 的参数名不一致，第三轮才改对。同样的任务，一个 Django 项目一轮就过了。

差异不在模型。差异在 Java 的工程复杂度。

## 不是无解

上面说的是问题。下面说的是解法。不是什么银弹，是一些经过社区验证的思路。

**第一，把依赖倒置做到位。**

让项目能在本地跑起来，是 AI 能自主验证的前提。如果你的 Service 层直接调了 OSS SDK、直接连了生产 Redis、直接用了云端配置中心——Agent 没法工作。

解法是经典依赖倒置：抽象接口，切换实现。线上用 `@Profile("prod")`，本地用 `@Profile("local")`。本地实现不需要真正起一个 Redis，用 H2 替 MySQL、用 `java.nio.file` 替 OSS、用 `ProcessBuilder` 替远程沙箱。

关键原则：零侵入。`@Profile("local")` 的 Bean 不应该影响线上代码路径，线上代码不应该多走一行 `if (isLocal)` 判断。

**第二，给项目写一份 AGENTS.md。**

不是 CLAUDE.md——AGENTS.md 是给所有 Coding Agent 看的，格式跨工具通用。重点是告诉 Agent 这个 Java 项目特有的规则：

- Controller 层统一用 `@RestController`，返回 `Result<T>` 包装
- Service 层接口-实现分离，实现放在 `impl` 子包
- MyBatis Mapper XML 的 `namespace` 必须写全限定类名
- `@Transactional` 只加在 Service 层，不要加在 Controller
- 本地启动命令：`mvn spring-boot:run -Dspring-boot.run.profiles=local`

这些不是"写代码"的技巧，是"让 Agent 理解你的项目"的技巧。这跟 Prompt 工程没关系，这是上下文工程。

**第三，把 CI 前置到本地。**

如果你用的是 Maven，Agent 最需要的验证手段就是 `mvn compile` 和 `mvn test`。把编译、单元测试、静态检查（checkstyle/spotbugs）都做成一条脚本，让 Agent 每轮改动之后都能跑一次。Agent 需要的是一个"看到红灯→改→看到绿灯"的闭环，不是等 CI 跑完再看结果。

对于更复杂的项目，可以考虑用 TestContainers 在本地起轻量的 MySQL、Redis、Kafka，让集成测试也能在本地跑通。

## Spring AI 2.0 的一个值得跟踪的方向

Spring AI 2.0 在 2026 年 5 月发布，带来了几个对 AI 编程友好的变化：

- `@Tool` 注解和 `@McpTool` 注解让方法能自动注册为 MCP 工具
- Streamable HTTP 替代了废弃的 SSE 传输，默认配置更简洁
- 多 Agent 协作模式：一个 Agent 规划、一个 Agent 执行、一个 Agent 验证
- 引入了 guardrails 机制：定义 Agent 可以做和不可以做的边界

但有一个社区反复提到的坑：Spring Boot 的 SSE 默认传输和 Claude Code 的 stdio 默认传输不一致。Agent 连接 MCP 服务器时无声失败，排查半天才发现是传输类型不匹配。Spring AI 1.1+ 默认切到了 Streamable HTTP，但 1.0.x 项目还是 SSE——升级前先检查配置。

## 不是换一个更强的模型能解决的

ChatGPT、Claude、Kimi K3——换更强的模型能不能改善 Java 的 AI 编程体验？

能改善一点，但解决不了根本问题。

根子不在模型层。Python 和 JS 项目的 AI 编程体验好，不是因为 GPT 和 Claude 更懂 Python，是因为 Python 项目的执行路径是显式的、依赖是轻量的、项目是能直接在本地跑起来的。

Java 项目的结构性特征——依赖注入、AOP 代理、微服务基础设施依赖、多模块工程结构——这些是语言和框架选择时做的架构决定，它们对 AI 不友好的那一面，不是靠更强的模型推理能弥补的。

更强的模型会让 Agent 猜得更准，但它改变不了"Agent 需要本地验证环境"这个物理现实。

那些在 Java 项目里 AI 编程体验已经不错了的团队，做的事情本质上都是在缩小这个结构性的鸿沟：让项目能在本地跑起来、让 Agent 有可靠的验证闭环、让项目规则以 Agent 能消费的方式写下来。

这些工作不是"AI 的活"，是工程团队的活。换个角度说，它可能是 2026 年 Java 后端团队最重要的一项基础设施建设。
