---
title: "如何把 Java 仓库改造成 AI Native？"
author: 唐悦玮
date: 2026-07-31 10:00:00 +0800
categories: [AI 工程化]
tags: [Java, SpringBoot, AI编程, 程序员日常, 后端开发]
pin: false
comments: true
keyword: Java, SpringBoot, AI编程, 程序员日常, 后端开发
---

> **摘要**：2026 年，AI 编码工具已经能写出可运行的代码，但团队很快发现：Agent 改得好 CRUD，改不了核心逻辑。根因不是模型能力不够，而是仓库结构从未为 AI 设计过。本文提出 AI Native Repository 六层模型，从模块边界、架构约束、规则宪法、团队记忆到验证闭环，给出一套可落地的 Java 仓库改造方案。

---

## 一个 Spring Boot 团队的一周

2026 年，团队接入了 Claude Code。

**第一天。** Agent 写 CRUD 又快又准。Controller、Service、Mapper 一气呵成，团队成员觉得捡到宝了。

**第三天。** Agent 开始改错误模块。让它给工单审批加个超时逻辑，它跑去改了角色权限的代码。让它修一个 NPE，它在三四个 Controller 里加了判空，但真正的 bug 在 Service 层。

**第七天。** 没人敢让 Agent 碰核心代码了。团队又回到了手写时代，AI 退化成了高级自动补全。

这不是个案。我聊过三个用 Spring Boot 接入 AI Agent 的团队，反馈高度一致：Agent 写新东西可以，改老代码就出事。

根因不是模型能力不够。Claude Opus 4.6 在 SWE-bench 上能独立修复 53% 的 issue。问题是——

**传统 Java 仓库不是为 AI 设计的。**

换一个角度说：当你的代码库结构是为"人类逐文件理解"设计的，AI 进来就像让一个视力正常的人戴着重度散光的眼镜干活——它看得见，但定位不准，上下文混乱。

---

## 传统仓库为什么 AI 用不好

看一个典型的 Spring Boot 项目结构：

```
src/main/java/com/company/
├── controller/
│   ├── OrderController.java
│   ├── PaymentController.java
│   └── UserController.java
├── service/
│   ├── OrderService.java
│   ├── PaymentService.java
│   └── UserService.java
├── mapper/
│   ├── OrderMapper.java
│   ├── PaymentMapper.java
│   └── UserMapper.java
├── entity/
│   ├── Order.java
│   ├── Payment.java
│   └── User.java
```

从人类视角看，按技术层次分，清晰明了。

从 AI 视角看，这是灾难。

当你让 AI "给工单加点功能"，它面对的是 3000 个分散在技术层里的类。模型的注意力在长上下文中会衰减——后面读到的文件"看是看到了，但用不上"。它不知道哪些类属于工单域，哪些属于支付域。上下文窗口 200K token 是够大，但注意力窗口没这么大。

这就是 Context Engineering 要解决的问题：不是给 AI 更多代码，而是给 AI 更清晰的边界。

---

## AI Native Repository 六层模型

在动手改造之前，需要先建立一个全局视角。AI Native 仓库和传统仓库的差异不是加个配置文件就完事——它涉及从代码组织到工作流的六个层次。

```
              AI Engineering Layer（规则与工作流）
                    AGENTS.md + Skills + Workflows
                              |
              Knowledge Layer（显性知识）
           架构文档 + 领域模型 + API 契约 + 已知坑
                              |
              Code Structure Layer（模块边界）
             Spring Modulith + Hexagonal Architecture
                              |
              Verification Layer（质量门禁）
               测试金字塔 + 静态分析 + Review Gate
                              |
              Automation Layer（自动化管道）
              CI/CD + Git Hooks + MCP 集成
                              |
              Runtime Layer（运行时）
              Spring Boot Application + 可观测性
```

从上往下，每一层都为 AI Agent 答一个问题：

- **Engineering Layer**：我应该怎么干活？（规则、边界、禁止项）
- **Knowledge Layer**：这个系统是干什么的？（架构意图、领域知识）
- **Code Structure Layer**：代码在哪儿、我能改哪儿？（物理边界）
- **Verification Layer**：我写对了吗？（反馈循环）
- **Automation Layer**：怎么把结果跑起来？（执行环境）
- **Runtime Layer**：线上是什么状态？（可观测性）

这不是六个独立工具，而是一个完整的闭环。缺任何一层，Agent 就会在某一步"迷失方向"——常见症状是改错模块、重复造轮子、或改完不自测。

下面重点展开前三层，这是目前绝大多数 Spring Boot 团队最欠缺的部分。

---

## Spring Modulith：给 AI 画出模块边界

Spring Modulith 的传统卖点是"单体应用的模块化方案"——让你用 `@ApplicationModuleListener` 发事件、用 `verify()` 测模块隔离，最终可以平滑拆成微服务。

但 AI 时代，Modulith 最大价值换了一个维度：**帮助 Agent 理解系统边界。**

换句话说，模块化的核心收益不再是"将来好拆微服务"，而是"现在 Agent 就知道哪里能改、哪里不该碰"。

### 改造前

```
src/main/java
├── controller
├── service
├── mapper
├── entity
```

AI 读到的：一堆按技术层堆叠的类，没有领域概念。

### 改造后

```
order/
├── api/          # REST 接口 + DTO
├── application/  # 用例编排
├── domain/       # 领域模型 + 业务规则
└── infrastructure/  # 数据库 + 外部服务

payment/
├── api/
├── application/
├── domain/
└── infrastructure/

ticket/           # 工单域
├── api/
├── application/
├── domain/
└── infrastructure/
```

AI 现在读到一个明确的信号：这个项目的业务被切成了三个独立的上下文——工单、订单、支付。每个模块内部有自己的分层。

效果：当你告诉 Agent "在工单模块里加一个审批超时自动关闭功能"，它能定位到 `ticket/` 目录，不会跑错门。

### 加上 Modulith 校验

改造不只是目录移动。加上 Spring Modulith 的模块测试，让 CI 帮你守住边界：

```java
@SpringBootTest
class ModularityTest {
    @Test
    void verifyModuleStructure(ApplicationModules modules) {
        modules.verify();
        // 违反模块访问规则 → 测试直接挂
    }
}
```

Agent 一旦在工单模块里直接引用了支付模块的内部实现，`verify()` 会在 CI 上炸掉。相比口头规范，这种物理约束对 Agent 更有效——因为它不是"被建议不要改"，而是"改了就跑不通"。

---

## 六边形架构：用结构限制 Agent 的修改半径

六边形架构（Hexagonal Architecture，也叫 Ports & Adapters）的传统价值是解耦——让你可以换数据库、换消息队列而不改业务逻辑。

AI 时代的价值换了一个角度：**降低 Agent 修改的影响面。**

### 没有六边形时

```
Controller → Service → Mapper → SQL
```

Agent 改一个"工单负责人可以转给别人"的需求：

- 可能改 Controller 的参数校验
- 可能改 Service 的业务规则
- 可能改 Mapper 的 SQL 查询
- 可能连带影响到消息通知、审批流转

影响面不可控。一次修改走出 4 个文件是常有的事。

### 加上六边形后

```
        REST API (Adapter)
              ↓
     Application Service (用例编排)
              ↓
        Domain (Port 接口)
              ↓
    Infrastructure (Adapter 实现)
```

Agent 需要修改时，边界天然限制了它能深入的程度：

- 改调用方行为，只碰 Application 层
- 改业务规则，只碰 Domain 层
- 换数据库实现，只碰 Infrastructure 层

不是说 Agent 不会改错，而是错了以后爆炸半径小得多。

### 用代码说明

把核心业务规则定义在 Domain 层的 Port 接口里，让 Agent 必须通过接口调用，而不是直接访问实现：

```java
// Domain Port —— 定义契约，Agent 必须遵守
public interface TicketRepository {
    Ticket save(Ticket ticket);
    Optional<Ticket> findById(TicketId id);
    List<Ticket> findPendingByAssignee(UserId assignee);
}
```

```java
// Infrastructure —— 实现细节，Agent 换了数据库不影响业务层
@Repository
class MySqlTicketRepository implements TicketRepository {
    // JDBC / MyBatis 实现
}
```

这时候你对 Agent 说"换个查询条件"，它大概率改 `findPendingByAssignee` 的实现，不会在 Service 里裸写 SQL。边界制造了正确的惯性。

---

## AGENTS.md：给 AI 立一份工程宪法

很多团队在项目根目录放了个 AGENTS.md，但内容只有几行技术栈说明。这大概相当于给新来的同事做入职培训，只告诉他"我们用的是 Java"——方向对了，但信息量远远不够。

AGENTS.md 的正确写法是**地图，不是手册**。你不需要把所有细节都放进去，但需要告诉 Agent：去哪找什么、什么能做、什么绝对不能碰。

以下是一个 Spring Boot 企业工单系统的 AGENTS.md 核心结构：

```markdown
# AGENTS.md

## 项目概述
企业工单管理系统。Spring Boot 4.0 + Java 21 + Spring Modulith。
核心模块：ticket（工单）、approval（审批）、notification（通知）。

## 架构约束（违反必挂）
- Controller 禁止直接调用 Repository。路径：
  Controller → Application Service → Domain Port → Infrastructure
- 禁止跨模块直接引用内部类。模块间通信只能通过 Domain Event。
- 任何对数据库 Schema 的修改必须先读 docs/db-schema.md。

## 禁止模式
- 禁止在 Service 里拼接 SQL 字符串
- 禁止吞异常（catch + log 然后 return null）
- 禁止使用 `new` 创建 Domain Entity，统一走 Factory 方法

## 关键文件索引
- 架构文档：docs/architecture.md
- 领域模型：docs/domain-model.md
- 已知问题与陷阱：docs/known-issues.md
```

三个关键设计点：

**1. 前 10 行建立心智模型。** Agent 读到第一段就知道这个项目有几个模块、技术栈是什么、顶层约束是什么。

**2. 禁止项比建议项更重要。** Agent 不缺生成代码的能力。它缺的是知道"哪些代码不该生成"。负面约束在 AI 框架里是利用率最高的信息。

**3. 用链接而非正文做渐进式披露。** 如果 AGENTS.md 膨胀到 5000 行，AI 的注意力会被稀释。把详细文档放在单独文件里，AGENTS.md 只管"去哪找"。

---

## 给仓库加一份记忆

代码是逻辑的载体，但不是知识的载体。

Agent 每次启动都是"新的一天"——它不知道团队上周在某个方案上踩了坑，不知道三个方案中为什么选了方案 B，不知道上次某个看似简单的改动为什么被 rollback 了。

这些信息散落在 PR 评论、Slack 讨论、团队 Wiki 里。人可以通过沟通找到，Agent 找不到。

解决方案很轻：在仓库里建一个 `.ai/memory/` 目录。

```
.ai/
├── AGENTS.md
├── memory/
│   ├── decisions.md
│   ├── known-issues.md
│   └── failed-attempts.md
└── docs/
    ├── architecture.md
    └── domain-model.md
```

**decisions.md** 记录架构决策：

```markdown
| 日期 | 决策 | 背景 | 替代方案 |
|------|------|------|----------|
| 2026-06-15 | 审批状态机用 Cola StateMachine 实现 | 工单审批状态多达 8 个，if-else 已失控 | Spring Statemachine（太重）、手写 enum（已试过，不可维护） |
```

**known-issues.md** 记录已知坑：

```markdown
审批超时自动拒绝的定时任务，在 Jetty 下偶发多次执行。 根因是 Quartz misfire 阈值设置过小。当前 workaround：增加分布式锁。长期方案待评估。
```

**failed-attempts.md** 记录失败的尝试：

```markdown
### 2026-07-03 Redis 分布式锁方案 A
- 尝试：用 Redisson RLock 实现审批互斥
- 问题：高并发下续期超时，锁被误释放
- 结论：改回数据库乐观锁方案
```

这三份文件的意义在于：Agent 能在开始动手前读取历史教训，避免团队已经踩过的坑被人——不对，被 AI——再踩一次。

> AI 最需要继承的不是代码，而是团队的踩坑经验。

---

## 让 AI 能自己验证自己

前面的四层解决了"AI 不乱改"的问题。但还有一面硬币的另一半："AI 怎么知道自己改对了？"

这需要一套 Agent 能触发的验证回路。

### 测试金字塔，但换个角度

传统测试金字塔按粒度分：单元 → 集成 → 端到端。这个分层对 AI Agent 来说不够实用。Agent 需要更直接的反馈：**我改了这个文件，跑哪条命令能告诉我是否搞砸了？**

更实用的分层：

```
快速反馈（秒级）
  mvn test -pl ticket-module     # 单模块测试

完整反馈（分钟级）
  mvn verify                     # 全部测试 + 模块隔离校验 + 静态分析

预提交反馈（自动化）
  git hook + CI pipeline         # 提交后自动跑
```

在 AGENTS.md 里明确这些命令：

```markdown
## 本地验证
- 单模块测试：`mvn test -pl ticket-module`
- 全部测试 + Modulith 校验：`mvn verify`
- 代码风格：`mvn checkstyle:check`

## 提交流程（强制）
1. `mvn verify` 全部通过
2. `git diff --stat` 确认改动范围
3. 如有跨模块改动，在 PR 描述中说明理由
```

这样 Agent 的编程循环就形成了：改代码 → 跑测试 → 看结果 → 修正 → 再测。没有这个回路，Agent 写的代码永远需要人去跑一遍验证——这和生产力的初衷正好相反。

---

## 一个真实团队的三周改造记录

一个做智能问答系统的 Java 团队在 2026 年 3 月做了这件事。项目背景：Spring Boot 3.2，3000+ 类，按技术层分包。使用 Claude Code 三个月后，发现 Agent 的核心代码准确率不升反降。

他们花了三周，分三步走：

### 第一周：建立模块边界

把按技术层分包改成按业务域分包：

```
改造前：controller / service / mapper / entity / dto
改造后：qa-domain / knowledge-domain / user-domain（每个下面加 api/application/domain/infrastructure）
```

加入 Spring Modulith 的 `@ApplicationModuleListener` 做模块间通信。加入 Modulith 测试在 CI 上守住边界。

### 第二周：写入 AGENTS.md

核心内容：架构约束 5 条 + 禁止模式 6 条 + 关键文件索引 + 本地验证命令。

AGENTS.md 上线前，团队统计了一个数据：Agent 每次 coding session 的平均"正确首答率"约 35%（不改就能用的代码比例）。上线一周后，升到了 58%。单项提升最大的是——模块定位准确率，从不足 50% 到了接近 90%。

### 第三周：建立 Agent 验证回路

在 AGENTS.md 里明确验证步骤，在 CI 里加入两重 Gate：modulith-verify + checkstyle。Agent 提交的代码如果违反模块边界或代码风格，CI 直接打回，Agent 必须自行修复。

三周后的结论：

- Agent 对核心模块（知识库索引、问答匹配）的修改准确率从不足 40% 升到了约 65%
- 跨模块错误修改次数从平均每周 12 次降到 2 次
- 团队对 Agent 的代码信任度从"每条都要肉眼过"变成了"关键路径审查即可"

这不是魔法，是把工程约束翻译给了 AI。

---

## Java 工程师的新职责

回头看，过去两年 AI 编码工具的变化轨迹是：自动补全 → 代码生成 → Agent 自主执行。但如果我们一直把仓库设计成"只有人类能理解"的结构，Agent 的自主执行就永远是一句口号。

改造仓库这件事，是把隐性的工程决策变成显性的结构化信息。过去这些决策藏在架构师的脑子里、藏在 Code Review 的评论里、藏在 JIRA 里打过 tag 但没人再翻的 issue 里。AI 来了以后，这些信息得从"脑子里"搬到"文件里"——不是因为 AI 比人笨，恰恰相反，AI 能读的文件量远超人类，但它不会脑补你省略掉的意图。

未来 Java 工程师的核心能力会从"写什么代码"转向另一个方向——

**定义 Agent 应该在什么边界内、用什么规则、基于什么知识来写代码。**

这是从 Coder 到 Engineer 的切换。而 AGENTS.md、Spring Modulith、六边形架构、仓库记忆和验证回路，就是完成这个切换的工具箱。

---

**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。

