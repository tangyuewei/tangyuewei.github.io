---
title: "Java 后端的 Agent 门禁怎么搭"
author: 唐悦玮
date: 2026-09-23 08:33:00 +0800
categories: [AI编程, Java]
tags: [Agent, 可观测性, SpringAI, LangChain4j, 确定性门禁]
pin: false
comments: true
keyword: Agent 可观测性, SpringAI, LangChain4j, 确定性门禁, 假成功, OpenTelemetry
---

> **摘要**：Agent 最大的坑不是报错，是"它说做完了，环境说没有"。本文借 Java 后端的天然资本——编译器、类型系统、Bean Validation、Micrometer/OTel——讲清怎么在模型周围搭四道确定性门禁，把假成功挡在缝里，而不是等上线后人工 debug。

你给 Agent 派了个活：把这批工单的状态从"处理中"改成"已关闭"，顺手回写关闭原因。

它跑了一阵，返回 status: success。你信了。

三天后客服说，工单还停在"处理中"。你翻日志，每一步都绿，没有任何异常。问题出在哪儿？它调了更新接口，接口返回 200，但那条数据的状态字段根本没变——传入的 ticketId 在库里查无此单，更新命中 0 行。HTTP 成功，业务失败，Agent 浑然不知，还给你写了句"已处理完成"。

这不是个案。tau2-bench 里，单控域近一半的失败是"声称完成但环境状态不符"；AppWorld 上，显式声明状态的失败里有 75.8% 是这一类。Reddy 等人的研究更狠：78% 的失败，对工具和 Agent 两边都不可见。

![Agent 的四道门禁](/imgs/202609/2026-09-23-java-agent-gates-infographic-1.jpg)

## Java 后端自带栏杆的料

别的语言也在写 Agent，但 Java 后端搭门禁，料是现成的。

编译器是免费的确定性闸门。Agent 生成的代码先过 javac，编译不过，连运行都到不了——类型错误、缺方法，都是确定性错误，不用等它编理由自圆其说。

类型系统和 Bean Validation 把"语法对、语义错"的调用挡在工具执行前。Reddy 把这类问题叫 policy-permissive tools：工具接受任何合法调用，哪怕它违反业务规则。在 Java 侧，一个 @NotNull、一个 @Pattern 就能让这种调用在进模型之前被拒。

Micrometer 加 OpenTelemetry 已经长在 Spring Boot 里。你不用自己造遥测，加两个依赖，链路自己就出来了。

## 第一道门：编译门禁

最便宜的门禁，是让生成物先过编译。

不少团队让 Agent 直接改业务代码、直接部署。一旦它生成的接口签名和调用方对不上，运行时才炸，而且炸在离出错最远的地方。把 `./gradlew compileJava` 或 `mvn compile` 塞进 Agent 的"写完即验证"环节，编译失败立刻回退重来。这一步零模型调用、零额外成本，却挡掉了最大一类低级失败。

## 第二道门：契约门禁

工具不是"能调就行"，参数是有契约的。

给工具的入参用 JSR-380 注解约束，执行前校验：

```java
record CloseTicketCmd(
    @NotNull Long ticketId,
    @Pattern(regexp = "CLOSED|REJECTED") String status,
    @Size(max = 200) String reason) {}
```

参数非法，直接抛约束违例，工具不执行。Reddy 的四门确定性闸门里，这一道叫"参数前检"——不依赖模型判断，纯规则。他的实验里，单纯加这类预执行闸门，就把 gpt-5.2 在工具调用任务上的成功率从 61.2% 拉到 71.6%。

## 第三道门：状态门禁

编译过了、参数对了，不代表世界真变了。

工具执行完，要断言环境状态确实变了，而不是信 Agent 的回执。Spring AI 的 `ToolCallingManager` 周围可以包一层 Advisor，在工具返回后跑一条核验查询：

```java
long closed = ticketRepo.countByStatus("CLOSED");
Assert.isTrue(closed == expected, "关闭数与预期不符");
```

Reddy 的四门里，这道对应"状态后检"和"策略检"——查当前状态、查策略是否被违反。闸门本身不调用模型，毫秒级，却能把"更新命中 0 行"这类假成功当场抓出来。

![它说成功，世界说没发生](/imgs/202609/2026-09-23-java-agent-gates-infographic-2.jpg)

## 第四道门：链路门禁

前三道是点上的闸，这一道是面上的图。

Spring AI 对每次模型调用自动发两层 Micrometer observation：`gen_ai.client.operation` 记录 token、模型、请求参数，`okhttp.requests` 记录 HTTP 方法、URI、状态码，并在链路上传播 traceparent。工具调用另有 `ToolCallingObservationConvention`，把 `toolDefinitionName`、`toolDefinitionSchema` 一并记进 span。这些 span 把"工具名、参数、返回"串成一条可追的链，传统 APM 只看到 HTTP 200 的地方，这里能看到工具到底有没有做对事。

接法不用改业务代码，application.yml 里把采样打开即可：

```yaml
management:
  tracing:
    sampling:
      probability: 1.0   # 错误全采，成功流量可降到 0.1
```

再加 `micrometer-tracing-bridge-otel` 和 `spring-boot-starter-actuator`，链路直接进你现有的 OTel Collector。国产模型走 OpenAI 兼容接口时，同一套桥照样在线上传播 traceparent，不用为它单独改埋点。

LangChain4j 侧，挂一个 `ObservationChatModelListener` 就能拿到同构的 Micrometer 遥测；它的 input/output guardrails 事件还能在工具前后插校验，和 Spring AI 的思路一致，只是表述换成了监听器。

## 评测门禁：把场景固化成资产

四道门挡的是"这次跑没跑对"。要挡"换了个 prompt 模型是不是退化了"，得有回归集。

把你们真实的工单流转、审批、对账场景固化成一组成 golden 用例，每次动 prompt 或换模型，CI 里跑一遍。断言不是"输出等于某字符串"，而是"状态机走到了对的终态"——和状态门禁同一套思路，从单次运行升到版本对比。

## 代价与边界

门禁不是越多越好。

高风险动作（删库、对外发件）才值得上人工确认；低风险读操作，确定性闸门挡"语法对语义错"就够了，别用闸门去审创意。闸门本身也有成本：每道后检都是一次额外查询，高频工具要权衡采样率。

最该警惕的是把闸门当免责。闸门挡得住确定性错误，挡不住"目标定错了"——它说关工单，你其实想关的是另一批。门禁管执行，不管意图，意图还得人来定。

![门禁不是越多越好](/imgs/202609/2026-09-23-java-agent-gates-infographic-3.jpg)

## 结语

Agent 不可靠，往往不是模型不行，是它周围没栏杆。Java 后端恰好把栏杆的料都备齐了：编译器、类型、Bean Validation、Micrometer。

四道门一搭，假成功从"上线后人工 debug"变成"执行时当场拦截"。Lightrun 今年一项针对 SRE 与 DevOps 负责人的调查里，43% 的 AI 改动上线后仍要人工 debug，88% 需要两到三次重部署才确认——把门禁前置，这两组数字能砍掉一大截。

---

**参考资料**

1. From Confident Closing to Silent Failure（ICML 2026 FAGEN Workshop，arXiv:2606.09863）——tau2-bench 单控域 45–48% 失败为假成功
2. Agents fail by declaring success（NZWE Journal，2026-07）——AppWorld 75.8% 假成功、5 个 LLM judge AUROC ≤0.65
3. Reddy et al., Reason Less, Verify More（arXiv:2607.07405）——78% 失败对工具与 Agent 不可见；四门确定性闸门 gpt-5.2 61.2%→71.6%
4. Spring AI Observability 参考（docs.spring.io/spring-ai）——gen_ai.client.operation / okhttp.requests 双层 observation、ToolCallingObservationConvention
5. LangChain4j Observability 教程（docs.langchain4j.dev）——ObservationChatModelListener、guardrails 事件
6. Lightrun 2026 SRE/DevOps 调查——43% AI 改动上线后人工 debug、88% 需 2–3 次重部署
7. OpenTelemetry GenAI Semantic Conventions v1.30——agent/chat/tool span 树与 gen_ai.* 属性

