---
title: "Spring AI 2.0 只支持 Boot 4"
author: 唐悦玮
date: 2026-11-23 20:48:00 +0800
categories: [后端开发, 工程实践]
tags: [Spring AI, Spring Boot 4, JDK 21, 升级迁移, Jackson 3, 工具调用]
pin: false
comments: true
keyword: Spring AI 2.0, Spring Boot 4 升级, Spring Boot 3.5 EOL, JDK 21, Jackson 3, 工具调用上限, 升级顺序
---

> **摘要**：想用 Spring AI 2.0，Boot 得先到 4.x。而 3.5 的免费补丁六月就停了，4.0 只剩一个月。这篇把三条时间线算清，再给一个不会返工的升级顺序。

现在能同时拿到正式版的组合，只有一套：JDK 21、Spring Boot 4.1、Spring AI 2.0.1。

往上再走一步，Boot 4.2 是十一月十九号刚发的，Spring AI 那边配它的 2.1 还停在 milestone。往下退一步，Boot 4.0 的免费补丁十二月三十一号到期。

一个多月后还得再来一次。

中间这条线窄，但能走通。

你翻 Spring AI 的文档，看到 `@McpTool` 标在方法上，启动就得到一个 `/mcp` 端点，Controller 都不用写。挺顺。

翻到安装那页，坐标没问题，再往下看，第一行写着 Spring Boot 4 基线。

这就不是加个依赖的事了。

## 六月那一周，Spring 把账结清了

先把时间摆出来，后面所有判断都架在这几行上。

| 日期 | 发生了什么 |
| --- | --- |
| 2026-06-10 | Spring Boot 4.1 GA |
| 2026-06-12 | Spring AI 2.0.0 GA；同一天，Spring AI 1.0.9 和 1.1.8 也发了 |
| 2026-06-25 | Spring Boot 3.5.16，3.5 线最后一个公开补丁 |
| 2026-06-30 | Spring Boot 3.5 的 OSS 支持结束 |
| 2026-11-19 | Spring Boot 4.2 GA，4.1.3 和 4.0.10 同日发布 |
| 2026-12-31 | Spring Boot 4.0 的 OSS 支持结束 |
| 2027-07-31 | Spring Boot 4.1 的 OSS 支持结束 |
| 2027-12-31 | Spring Boot 4.2 的 OSS 支持结束 |

六月八号到十四号这一周，Spring 把整条发布列车压了进去。原本排在五月的火车被挪了两次，最后挤进这一周集中发车。

4.1 在十号落地，两天后 Spring AI 2.0.0 GA，再三天后 Spring Tools 5.2.0。

关键是六月二十五号那个补丁。3.5.16 发出来，五天后 3.5 的 OSS 支持就关了。

最后一个补丁和停止维护之间隔五天，这不是巧合，是正常节奏——一条线在关门前把攒着的修复推完。

所以六月不是一个普通的发布月。它同时做了三件事：给 4.x 一个稳定落点，把 AI 框架搬上 4.x，关掉 3.x 的门。

你现在的选择，是在这三件事都发生完之后做的。

## 落点选错，等于白干一轮

4.0 是第一个坑，而且很隐蔽。

它是 2025 年十一月发的，比 4.1 早半年，教程和博客上一大半还在写 4.0。你照着升，编译过了，启动正常，团队验收通过。

然后十二月三十一号，这条线的 OSS 支持到期。

从今天算，一个月的窗口。二〇二七年一月开始，你手上是一个没有任何免费补丁的 Boot 4.0。

Boot 每个 minor 的 OSS 支持大概十三个月，够不到两年。这条规则本身没什么问题。

问题是它把"最新的大版本"和"能长期待的版本"拆成了两个概念。4.0 是最先到的大版本，不是能待的那个。

真正能待的是 4.1 和 4.2。4.1 到 2027 年七月底，4.2 到 2027 年十二月底。

有意思的地方在 2027 年八月到十二月这五个月。按目前公开的发布日历推，Spring 还没给 4.2 之后的线排期，而 4.1 在七月底就到期了。

也就是说这段时间里，4.2 是唯一还有 OSS 支持的线。这是推断，不是承诺——日历随时会变，但至少现在看不到下一条线。

落到执行上，结论很干脆：现在就从 3.5 跳到 4.1，别在 4.0 停。

等你把 4.1 跑稳了，4.2 已经发了三个月，再升一次就顺了。反过来说，如果现在就冲 4.2，等于把"升大版本"和"踩新版本第一波坑"两件事叠在一个迭代里。

急和稳，在这里是两条路，不是一条路上的两档速度。

## AI 框架的基线，总落后 Boot 一个身位

第二条时间线更麻烦，因为它是滚动落后的。

Spring AI 2.0 的 GA 公告原话是「designed to be used with Spring Boot 4.0 / 4.1 and Spring Framework 7.0」。注意它写的是 4.0 和 4.1，不是"4.x"。框架作者在给自己圈一个已验证的范围。

等到 Spring AI 2.1.0-M1，基线换成了 Boot 4.2。

看出来了吗？Boot 每往前走一个 minor，Spring AI 要等下一个版本才跟上来，而且先出的是 milestone。

这意味着你永远拿不到"Boot 最新 + Spring AI 最新 GA"这个组合，最多只能拿到"Boot 次新 + Spring AI 最新 GA"。

想把 Boot 4.2 和 Spring AI 用在一起，就得吃 2.1 的 milestone。

这不是不能干，是要清楚自己在干什么：milestone 的 API 会变，你的代码要跟着变，生产上出问题没有人给你背书。

所以那道选择题其实是这样：

- 要两边都是正式版，Boot 停在 4.1，Spring AI 上 2.0.1
- 要 Boot 撑到 2027 年底，Spring AI 吃 2.1 的 milestone

落到排期上，前一个组合更省事。二〇二六年剩下的时间里，4.1 的 OSS 支持还有大半年，够你把 AI 这条链路跑出真实流量。等到 2.1 GA 出来再动 Boot，两次升级拆开做，每次都能单独定位问题。

一次升两个大版本，出了事你连是框架的问题还是 AI 层的问题都分不清。

## 留在 3.5 要付的账

那能不能干脆不动？

商业支持确实还在。3.5 是 3.x 的最后一个 minor，所以拿到了延长线，商业支持到 2032 年六月。听起来能扛六年。

代价写在细节里。3.5 的公开补丁停在 3.5.16，之后 Spring Security 和 Spring Framework 在 3.5 线上的修复不再公开发布，只出企业版构建。

也就是说你拿不到完整的修复列表，只能等厂商打包。Broadcom 不公开这套支持的报价，得谈。

还有一条更实际的：Spring AI 2.0 不能跑在 Boot 3 上。你留在 3.5，AI 那条线就只能停在 1.x。

1.x 还没死——六月十二号那天 1.0.9 和 1.1.8 是和 2.0.0 GA 一起发的。但 1.x 拿不到新东西，工具循环外移、`@McpTool` 注解、Tool Search 这些全在 2.x 里。

这就是"留后路"的真实含义：路还在，只是不通向新地方。

对一个要接企业知识库、智能审批这类场景的后端来说，这个代价不难算。你真正在赌的不是框架版本，是接下来两年能不能用上官方主线的 AI 能力。

## 顺序反了，会返工

真要动，顺序比版本更重要。同一批改动，排错了就得做两遍。

### JDK 先动，单独一轮

Boot 4 本身只要 Java 17，官方文档列出的兼容范围到 Java 27。Spring AI 2.0 在 M1 公告里写的是要求 Java 21。

两份材料口径不完全一致。稳妥的做法是按 21 起步——Boot 4.1 里有些托管依赖的门槛比框架本身高，比如 jOOQ 3.20 就要 21。你先按 21 走，不会因为某个库卡住。

这一轮只改三样东西：编译的 source/target、CI 的镜像、启动参数。别和 Boot 升级混在一个分支里。JDK 升级踩的坑是运行时的——GC 日志格式、`--add-opens` 的报错文本、某些反射库的行为——这些和 Boot 的编译错误混在一起，排查成本翻倍。

跑一轮全量回归，确认干净了，再开下一个分支。

### 从 3.5 直接到 4.1，中间不停

Boot 4 的破坏性改动集中在编译期，机械但量大。

`spring-boot-starter-web` 改成了 `spring-boot-starter-webmvc`，`spring-boot-starter-aop` 改成了 `-aspectj`。

`@MockBean` 和 `@SpyBean` 被移除了，换 Spring Framework 的 `@MockitoBean` 和 `@MockitoSpyBean`。

这两个新注解不能写在 `@Configuration` 类里。测试基建要是把 mock 声明在共享配置类，得拆成 `@TestConfiguration` 加 `@Import`。

`@SpringBootTest` 也不再自动装 MockMvc，Web 层测试要显式加 `@AutoConfigureMockMvc`，否则注入点全是空指针。

Undertow 直接没了。Boot 4 的 Servlet 基线是 6.1，Undertow 跟不上，整个 starter 被移除。用它的服务得先切 Tomcat 或 Jetty，而且不是改一行配置——压缩配置、access-log 配置项都要重写。

量大的部分可以交给 OpenRewrite。`org.openrewrite.java.spring.boot4.UpgradeSpringBoot_4_0` 这个配方把这些改名串成一次执行，包括 starter 替换和 `@MockBean` 的替换。

跑之前先看许可证。它在 rewrite-spring 里，走的是 Moderne 的源码可见许可，公司合规可能卡。跑完的 diff 当同事的 PR 那样读一遍，别直接合。

还有个过渡手段：`spring-boot-starter-classic` 和 `spring-boot-starter-test-classic`，把所有模块一次性拉进来，先让构建跑通，之后再逐个收拾。这是给大仓库用的，先通后优。

### Spring AI 放到最后

它动的是业务代码，得在框架稳定之后再动。

最根本的一条：`ChatModel` 不再跑工具调用循环。

1.x 里每个模型的实现内部都藏着自己的 loop，`internalToolExecutionEnabled` 那个开关就是给它用的。2.0 把 loop 提到了 Advisor 链上，`ToolCallAdvisor` 改名 `ToolCallingAdvisor`。

你的代码如果依赖过模型自带的循环，现在要么交给 `ChatClient`，要么自己驱动 `ToolCallingManager`。

Options 全部变成不可变，只能通过 builder 创建，`copy()` 和 `fromOptions()` 都没了。

```java
// 1.x：先建对象再改属性
OpenAiChatOptions options = OpenAiChatOptions.builder().build();
options.setTemperature(0.2);   // 2.0 里这行不编译

// 2.0：一次成型
OpenAiChatOptions options = OpenAiChatOptions.builder()
        .temperature(0.2)
        .build();
```

模块也砍了。`spring-ai-azure-openai` 被删除，Azure 走统一的 OpenAI SDK 模块。Anthropic 的实现重写成了官方 Java SDK 的薄封装，`maxTokens` 的默认值从 500 变成 4096——这一条会直接改变你的账单和响应长度。

数据层有一处要迁移：JDBC 的 chat memory 表新增了 `sequence_id` 列，老表得补。空表无所谓，有历史会话的表就得写迁移脚本。

MCP 的注解包和传输包都换了位置，服务端工具入参校验默认打开。

## 三个不会报错的变更

上面那些都会在编译或启动时给你一巴掌。真正难查的是下面这些——编译过、启动成功、冒烟测试通过，然后在某个下游系统里悄悄变形。

**Jackson 3 改了默认值。** Boot 4 从 Jackson 2 换到 Jackson 3，包名从 `com.fasterxml.jackson` 搬到 `tools.jackson`，注解包没动，`@JsonProperty` 这些照旧能用。

麻烦在默认行为，四个开关翻了：

- `WRITE_ENUMS_USING_TO_STRING`
- `SORT_PROPERTIES_ALPHABETICALLY`
- `FAIL_ON_NULL_FOR_PRIMITIVES`
- `FAIL_ON_TRAILING_TOKENS`

反着翻的有两个：`WRITE_DATES_AS_TIMESTAMPS` 和 `DEFAULT_VIEW_INCLUSION` 默认关闭。

容易被漏掉的是异常：所有 Jackson 异常都改成了非检查异常，`catch` 里那些 `JsonProcessingException` 得重写。

`WRITE_ENUMS_USING_TO_STRING` 这条最阴。你的枚举如果覆写过 `toString()` 为了日志好看，序列化输出就从 `IN_PROGRESS` 变成了中文。自己的服务照样跑，下游那个按 `"IN_PROGRESS"` 分支的 `switch`，可能一个分支都进不去。

兜底有两个开关：`spring.jackson.use-jackson2-defaults=true` 让自动配置的 `JsonMapper` 尽量回到 3.x 行为，或者引 `spring-boot-jackson2` 模块把 Jackson 2 留着。

后者官方标了废弃，未来版本会删。两个都算拖延，不算方案。

要真正确认没变形，得写契约测试，而且测的必须是 Spring 实际配置出来的那个 mapper：

```java
@SpringBootTest
class OrderJsonContractTest {

    @Autowired
    JsonMapper mapper;   // tools.jackson.databind.json.JsonMapper

    @Test
    void orderJsonMatchesContract() throws Exception {
        var actual = mapper.writeValueAsString(sampleOrder());
        var expected = contract("order.json");
        JSONAssert.assertEquals(expected, actual, STRICT);
    }
}
```

`order.json` 这个期望文件在升级前、在 Boot 3 那边生成一次存进去，升级后它告诉你具体哪个字段换了形状。每个对外 payload 写一个，不是每个端点写一个。

再加一条 ArchUnit 拦住回潮——Jackson 3 把注解留在老包名下，半迁移的代码库看上去一切正常：

```java
@ArchTest
static final ArchRule noJackson2Databind = noClasses()
        .should().dependOnClassesThat()
        .resideInAnyPackage("com.fasterxml.jackson.databind..",
                            "com.fasterxml.jackson.core..");
```

**工具调用加了硬上限。** 2.0.1 引进了 `ToolCallLimits`，默认每个工具每轮最多 40 次，所有工具合计 150 次，超了直接抛 `ToolCallLimitExceededException`，finish reason 是 `toolCallLimitExceeded`。

在 2.0.0 上跑 160 次工具调用没事的 agent，升到 2.0.1 就断了。判断标准是"一轮"从最后一条用户消息算起，记忆里回放的历史不算数。

这组默认值可以改，也能改成不抛异常：

```yaml
spring:
  ai:
    tools:
      limits:
        max-calls-per-tool-default: 20      # 单工具每轮上限，-1 关闭
        max-total-tool-calls: 60            # 全部工具合计
        on-limit-exceeded: RETURN_ERROR_RESPONSE   # 默认 THROW
```

`RETURN_ERROR_RESPONSE` 是把超限当成一条错误结果喂回模型，让它换个路子。这个模式得配一个会读错误信息的模型，否则它只会继续撞。

顺带说一句，2.0.1 起工具解析的 fallback 默认关了。容器里有 Tool Bean、模型也点了名，但没执行——先确认有没有显式挂上 `tools(...)`，再考虑开 `spring.ai.tools.resolution.fallback.enabled`。

默认为关是有道理的：容器里躺着的危险工具，不该被模型撞个名字就执行。

**记忆裁剪换了切点。** `MessageWindowChatMemory` 淘汰消息的时候，现在停在最近一条用户消息的边界，不再从中间硬切。

听上去是修 bug，实际改变了多轮对话里模型看到什么。以前可能把一轮问答切成半截，模型拿着无主的工具调用记录发呆；现在不会了，但窗口里少了几条消息。上下文预算得重新算一遍。

## 最后

回到那个最开始的问题：为了一个 AI 框架，把整个后端推到 Boot 4，值不值。

答案不在"值"或"不值"，在你的 AI 代码占多少比例。企业知识库、智能审批、智能客服这类已经把模型接进主链路的系统，1.x 拿不到工具循环外移和新 MCP 注解，拖下去是能力上的欠账。只是零星调几个接口的系统，留在 3.5 买商业支持，账面上更划算。

真要动，三个组合摆在这里。

| 组合 | 版本 | OSS 支持到 | 适合谁 |
| --- | --- | --- | --- |
| 稳 | JDK 21 / Boot 4.1.3 / Spring AI 2.0.1 | 2027-07-31 | 今年要上线，两边都要正式版 |
| 长 | JDK 21 / Boot 4.2.0 / Spring AI 2.1.0-M1 | 2027-12-31 | 能等，愿意吃 milestone |
| 扛 | JDK 17 / Boot 3.5.16 / Spring AI 1.1.x | 已结束（商业支持到 2032-06-30） | 动不了，且只做轻度 AI |

顺序上只有一句话值得记住：JDK、Boot、Spring AI，从下往上，一次只动一层。反过来做，你会在一块正在移动的地基上改业务代码。

六月那一周 Spring 已经替你把版本关系定好了。你能选的不是要不要跟，是跟的时候走哪条道。

---

**参考资料**

- [Spring AI 2.0.0 GA Available Now](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/)（Spring 官方，2026-06-12）
- [Spring AI 2.0.0-M1 Available Now](https://spring.io/blog/2025/12/11/spring-ai-2-0-0-M1-available-now/)（Spring 官方，2025-12-11）
- [Spring Boot 4.1 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.1-Release-Notes)（GitHub Wiki）
- [Spring Boot End of Life &amp; Support Options](https://endoflife.ai/article-spring-boot-eol)（版本支持期，2026-11 截面）
- [Spring Boot 4.1 end of support on 31 July 2027](https://ecorpit.com/spring-boot-4-1-end-of-support-2027)（发布日历与支持期推算）
- [Upgrading to Spring Boot 4: What Breaks First](https://marc-nuetzel.de/posts/spring-boot-4-upgrade-what-breaks-first)（Jackson 3 默认值与契约测试）
- [Tool Calling Advisor &amp; Tool Search](https://www.irurueta.com/ai/spring-ai/tool-calling-advisor-and-tool-search.html)（工具调用上限的属性与默认值）

