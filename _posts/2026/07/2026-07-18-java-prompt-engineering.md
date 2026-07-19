---
title: "给 Java 后端写 Prompt，不是玄学"
author: 唐悦玮
date: 2026-07-18 20:00:00 +0800
categories: [Java后端]
tags: [Prompt工程, AI编程, Java, Spring Boot, MyBatis]
pin: false
comments: true
keyword: Java Prompt 工程, AI 编程提示词, Spring Boot AI, MyBatis AI 生成, 后端提示词模板
---

> **摘要**：同样的需求给同一个 AI，不同 Prompt 写出来的代码质量可能差一个数量级。本文不讲通用的 Prompt 技巧，讲 Java 后端四个高频场景下具体怎么写——生成 CRUD、生成 MyBatis 映射、Debug 定位、单元测试——每场景给"差的写法"和"好的写法"，附带可直接改项目名使用的模板。

上周同事找我，问了一个很实际的问题。

"你们用 AI 写代码怎么就能直接跑？我每次跟 AI 说'写一个用户管理的 CRUD 接口'，它给我的代码 Controller 里全是 `HashMap`，没有 Service 层，没有参数校验，返回裸的 `List<Map>`。我跟他说这儿不对、那儿不对，来回七八轮，改完的代码还不如我自己写得快。有这功夫我早写完了。"

我看了他的 Prompt："写一个用户管理的 CRUD 接口，用 Spring Boot。"

然后我让他把 Prompt 改成这样——

"项目用 Spring Boot 3.2 + MyBatis-Plus，包结构 com.xxx.controller/service/mapper/entity。表结构如下（贴了 DDL）。统一返回体 Result<T>（code/message/data）。Controller 只做路由和参数校验，业务逻辑全放 Service。禁止 Controller 直接操作 Mapper。"

他重新发了一遍。AI 生成的代码：Controller、Service、ServiceImpl、Mapper、Entity 全齐，参数用 `@Valid` 校验，异常抛 `BusinessException`，返回体套了 `Result<T>`。改个包名直接跑。

同事愣了几秒："就这么简单？"

就是这么简单。同一个需求、同一个 AI。差别不在于你"会不会跟 AI 说话"，在于**你给了 AI 多少它能用的上下文**。

---

## 好的 Prompt 不是技巧，是上下文打包

很多人把 Prompt 工程当成一套"咒语"——用对词 AI 就听话，用错词 AI 就乱来。

实际情况是：AI 不是不听你的，是**你给的信息不够它判断"这个项目的代码应该长什么样"**。

让它写 Java 代码，它能写出能编译的、语法正确的 Java。但它不知道你的项目用 Spring Boot 2.7 还是 3.2、用 MyBatis-Plus 还是 JPA、异常是抛 `RuntimeException` 还是 `BusinessException`、返回到前端的是 `Result` 还是 `ApiResponse`。

这些东西，你不写进 prompt，AI 就只能猜。猜错怎么办？代码重写。

我总结了一个 Java 后端 Prompt 的六要素模板，每次写 prompt 套一遍：

```
1. 角色      → 你是一个资深 Java 后端工程师
2. 技术栈    → Spring Boot 3.2 + MyBatis-Plus 3.5 + MySQL 8.0
3. 业务需求  → 做什么、规则是什么、边界条件是什么
4. 项目规范  → 包结构、分层规则、统一返回体、异常处理方式
5. 输出要求  → 要哪些文件、要不要注释、要不要请求示例
6. 禁止项    → 不要硬编码、不要编造不存在的类、不要省略判空
```

其中第 4 项（项目规范）和第 6 项（禁止项）是绝大多数人漏掉的，也是 AI 写出不合群代码的主要原因。

下面用四个最常用的 Java 场景，演示这套模板怎么落地。

---

## 场景一：生成 CRUD 接口

最频繁的场景。大部分人第一反应是"写一个 XX 管理接口"，然后抱怨 AI 写的 Controller 里塞了 SQL。

**❌ 差的写法：**

```
写一个用户管理接口，包含增删改查。
```

AI 会给你一坨 Controller 里直接拼 HashMap 的代码。不是 AI 不行，是你没告诉它"这个项目不允许这样写"。

**✅ 好的写法：**

```
你是一个资深 Java 后端工程师。

技术栈：Spring Boot 3.2 + MyBatis-Plus 3.5 + MySQL 8.0。

业务需求：实现系统用户的 CRUD 接口。
- 新增：用户名/手机号/邮箱必填，用户名唯一、手机号唯一
- 查询：支持按用户名模糊搜索 + 分页
- 更新：不允许改用户名，只能改手机号/邮箱
- 删除：软删除（改 is_deleted 字段），不允许物理删除

项目规范：
- 包结构：com.xxx.controller / service / service.impl / mapper / entity
- Controller 只做路由和 @Valid 参数校验，业务逻辑全部放 Service
- 统一返回体 Result<T>(code, message, data)
- 业务异常统一抛 BusinessException，由全局异常处理器兜底
- 分页参数封装在 PageQuery 基类中

输出要求：
- Entity、Mapper（接口 + XML）、Service、ServiceImpl、Controller
- 关键逻辑加中文注释

禁止项：
- 禁止 Controller 里写任何业务逻辑
- 禁止直接操作 Mapper（必须通过 Service）
- 禁止硬编码常量，统一放 Constants 类
- 禁止编造不存在的工具类
```

贴完这段，AI 生成的代码基本改个包名就能跑。关键差异不在"有没有说需求"，而是**有没有说"这个项目不允许做什么"**。

---

## 场景二：生成 MyBatis 映射

AI 写简单 SQL 还不错，但一到多表关联就翻车——不是写了 N+1 查询，就是用了不存在的字段名。

**❌ 差的写法：**

```
写一个查询企业工单列表的接口，关联工单表、处理人表、客户表。
```

AI 大概率给你一个 MP 的 `LambdaQueryWrapper` 嵌套三层，或者一个 JOIN 写错表别名的 SQL。

**✅ 好的写法：**

```
项目用 MyBatis-Plus，但多表关联查询必须写 XML Mapper，禁止用 Wrapper 拼接 JOIN。

请生成一个工单列表查询：
- 关联表：t_ticket t LEFT JOIN t_user u ON t.handler_id = u.id LEFT JOIN t_customer c ON t.customer_id = c.id
- 支持按工单状态、创建时间范围筛选
- 分页返回，每页默认 20 条
- 结果包含：工单号、处理人姓名、客户名称、优先级、状态、创建时间

已有 Mapper 写法参考（贴一个项目中已有的 UserMapper.xml 片段）：
<select id="selectUserPage" resultType="...">
    SELECT u.id, u.username, u.email
    FROM t_user u
    WHERE u.is_deleted = 0
    <if test="query.keyword != null and query.keyword != ''">
        AND u.username LIKE CONCAT('%', #{query.keyword}, '%')
    </if>
    ORDER BY u.create_time DESC
</select>

请参照以上写法，生成 OrderMapper.xml 的对应查询。
```

给 AI 看一个已有的正确 Mapper，效果比描述 100 个字都好。AI 会模仿你的 XML 风格——`<if>` 的写法、表别名的习惯、参数命名方式——这些靠口头描述永远说不清楚。

---

## 场景三：Debug——贴报错定位

AI 的 Debug 能力被严重低估——不是因为 AI 不会，是因为**大部分人贴的报错信息根本不够**。

**❌ 差的写法：**

```
代码报错了，帮我看看。
```

或者只贴了一行 `NullPointerException`，然后把几百行的业务代码全粘过来。

**✅ 好的写法：**

```
Spring Boot 3.2 + MyBatis-Plus 项目，数据库 MySQL 8.0。

报错信息（完整堆栈）：
java.lang.NullPointerException: Cannot invoke "com.xxx.entity.User.getId()" because "user" is null
    at com.xxx.service.impl.TicketServiceImpl.assignHandler(TicketServiceImpl.java:47)
    at com.xxx.controller.TicketController.assign(TicketController.java:32)
    ...

相关代码（TicketServiceImpl.java 第 40-55 行）：
User user = userMapper.selectByPhone(ticketDTO.getPhone());
ticket.setHandlerId(user.getId());  // ← 第 47 行，这里炸了
...

预期：通过手机号查用户，关联到用户所在部门
实际：手机号对应的用户不存在时直接 NPE
```

AI 拿到三样东西：完整堆栈、炸的那几行代码、你的预期 vs 实际。它不需要猜你在干什么，可以直接定位：`selectByPhone` 没做空判断，需要加 `if (user == null)` 并抛业务异常。

**堆栈贴多少**：贴到最底层你自己的业务代码行号就可以了，Spring/MyBatis 框架层的不需要。

---

## 场景四：单元测试生成

AI 写测试最容易踩的坑——它只测 happy path。你在 prompt 里不写要测什么场景，它就只给你正常流程的测试。

**❌ 差的写法：**

```
给这段代码写单元测试。
```

结果：一个正常流程的测试方法，assert 了返回值。没了。空输入、异常、并发——全没测。

**✅ 好的写法：**

```
用 JUnit 5 + Mockito 给以下 Service 方法写单元测试。

需要覆盖的场景（每个场景一个测试方法）：
1. 正常流程：所有参数合法，返回预期结果
2. 参数为 null：username 为 null，抛 BusinessException("用户名不能为空")
3. 依赖异常：userMapper.insert() 抛出 DataAccessException，返回失败
4. 边界条件：username 长度等于 50（上限），应正常入库
5. 并发：两个线程同时插入相同 username，第二个应抛 BusinessException("用户名已存在")

禁止项：
- 不要用 PowerMock（项目不支持）
- 不要 mock static 方法（除非必须）
- 每个测试方法名用 should_xxx_when_xxx 格式
```

列出要测的场景，远比"写单元测试"五个字有效。AI 需要知道"你对这个方法的哪些边界有预期"——你不说，它就只测它觉得最可能的那个。

---

## 四个可复用的模板

把上面的写法抽象成填空模板。下次写 prompt，改项目名和技术栈就行。

**CRUD 模板：**

```
你是一个资深 Java 后端工程师。
技术栈：[框架 + 版本]
业务需求：[功能描述 + 校验规则 + 权限规则]
项目规范：[包结构 / 分层约束 / 统一返回体格式 / 异常处理方式]
输出要求：[要哪些文件 / 要不要注释]
禁止项：[不要做的事 1 / 不要做的事 2 / 不要做的事 3]
```

**MyBatis 模板：**

```
多表关联必须写 XML，禁止 Wrapper JOIN。
[贴一个项目中已有的正确 Mapper 片段]
请参照以上写法，生成 [表名] 的对应查询。
查询条件：[字段筛选规则]
分页：[每页条数]
```

**Debug 模板：**

```
[项目技术栈]
[完整堆栈信息]
[出错代码片段 + 行号标注]
预期：[应该怎样]  实际：[实际怎样]
```

**单元测试模板：**

```
用 [测试框架] 给以下方法写单测。
覆盖场景：
1. 正常流程：[预期行为]
2. [边界 1]
3. [边界 2]
禁止项：[不用的框架 / 不用的写法]
```

---

## 三个常见的反模式

**1. 上下文过载。** 有人觉得"给越多信息越好"，把一个 200 个文件的项目全贴进去。AI 的注意力是有限的——上下文越长，对关键信息的权重越低。只贴跟当前任务相关的 2-3 个文件。

**2. 一次性要太多。** "给我生成整个工单模块"——AI 会给你一段看起来完整但每个文件都差一点的代码。拆开：先要 Entity + Mapper，确认字段对了再要 Service，最后要 Controller。三步比一步质量高得多。

**3. 不贴规则，以为 AI 会自动读。** 你在项目里配了 `.cursor/rules`、`.codebuddy/rules`，不代表 prompt 里不用再提。AI 不会每次都去翻你的规则文件——prompt 里把关键的 2-3 条禁止项再写一遍，是性价比最高的保险。

---

Prompt 好不好，不是你语言表达能力的问题，是你给 AI 看的上下文够不够它判断"这个项目应该怎么写的"的问题。

每次写完 prompt，问自己一个问题：**AI 有没有足够的信息知道别人在这个项目里是怎么写代码的？**

如果答案是不确定——把 DDL 贴上去、把已有 Mapper 贴上去、把分层规则写清楚、把禁止项列出来。这四件事比任何"Prompt 咒语"都管用。

**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。
