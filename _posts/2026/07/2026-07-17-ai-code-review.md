---
title: "AI 时代，Code Review 的重点彻底变了"
author: 唐悦玮
date: 2026-07-17 21:00:00 +0800
categories: [AI开发]
tags: [AI编程, Code Review, 代码质量, 团队协作]
pin: false
comments: true
keyword: AI Code Review, AI 代码审查, AI 生成代码质量, PR Review, AI 编程规范
---

> **摘要**：AI 让代码产出翻了数倍，但人类阅读速度没变。Faros AI 数据显示，团队引入 AI 编码后零审查合并率飙升 31.3%，事故/PR 比上升 242.7%。本文基于最新行业数据，拆解 AI 代码在审查中的六种典型"假动作"，并给出 AI 时代的专属 CR 检查清单和三层审查策略。

上周 Review 了一个 PR。同事用 AI 给公司的 SaaS 后台加了一个 RBAC 权限拦截器，200 多行，格式工整、命名规范、单测全绿。

我差点就点 Approve 了。

多看了一眼角色校验的逻辑。AI 写的是 `userRole.contains("admin")`——用 String 的 `contains` 方法来判断当前用户是否是管理员。

这段代码编译完全没问题。单测全绿——因为测试用例里传的 role 就是 `"admin"` 这一个字符串，`contains` 精确命中，通过了。但生产环境里，系统里还有一个 `"superadmin"` 角色和一个 `"content_admin"` 角色。`contains("admin")` 把这些非管理员角色**全部放行了**。任何一个带 `admin` 子串的角色名都能绕过整个权限体系。

同事看了一眼我的注释，挠头："AI 写的，我看着逻辑挺对的……没往 `contains` 那边想。"

这种"看起来全对，一上线就出事故"的情况不是个例。Black Duck 的 2026 OSSRA 报告显示，代码库平均漏洞数同比上升了 107%（来源：Black Duck, "2026 OSSRA Report"）。更隐蔽的是 npm 生态里正在蔓延的"slopsquatting"攻击——AI 在生成代码时幻觉出一个看起来完全合理的包名，比如 `lodash-utils-sync`，开发者直接 `npm install`，装了一个恶意仿冒包进去。代码能跑，行为"正常"，直到数据被泄露才发现。

这些事故的共同特征：**代码"看起来全对"——编译过、测试绿、逻辑通顺——但实际暗藏雷管。**

---

## 数据比直觉更残酷

先说一组数字。

Faros AI 在 2026 年 3 月发布了一份覆盖 22,000 名开发者、4,000 个团队的报告（来源：Faros AI, "State of AI in Software Engineering 2026"）。团队从低 AI 采用率过渡到高 AI 采用率后：

- 代码变更量上升了 **861%**
- 事故/PR 比上升了 **242.7%**
- 开发者缺陷率从 9% 飙升到 **54%**
- 审查中位耗时增加了 **441.5%**
- 最触目惊心的数字：**31.3% 的 PR 在零审查下直接合并**

不是有人决定不审查。是审查者根本跟不上产出量。代码在没有人类阅读的情况下就上线了，然后这变成了"正常"。

CodeRabbit 对比了 470 个开源仓库的 AI 生成代码与人工代码（来源：CodeRabbit, 2025.12），结论是 **AI 代码的缺陷密度是人工的 1.7 倍**。

Black Duck 的 2026 OSSRA 报告更直接：代码库平均漏洞数同比上升了 **107%**（来源：Black Duck, "2026 OSSRA Report"）。

一句话总结：代码产出翻了 4 倍，人类阅读速度没变。**瓶颈从"写"转移到了"审"。**

而且旧的 CR 方法，审不动 AI 的代码。

---

## AI 代码在 CR 中的六种典型"假动作"

旧的 CR 检查清单管用是因为——人类写代码时的错误模式是可预测的：命名不规范、边界条件漏判、逻辑写反了。但 AI 的失败模式完全不同。它不是"写错了"，是**"写了个看起来对但其实不对的东西"**。

以下六种模式，你在 AI 生成的 PR 里大概率遇到过。

### 1. 幻觉依赖——名字看起来像真的

AI 知道 Spring Boot 有十几个官方 starter，也知道命名规则是 `spring-boot-starter-xxx`。于是当它需要接入一个认证中间件时，它会自然地给你的 `pom.xml` 或 `build.gradle` 里加一个 `spring-boot-starter-auth-v3`。

这个名字完全符合命名规范，版本号也合理。但它不存在于 Maven Central。AI 不是"查了官方仓库发现没有"，它是根据见过的几百个 starter 名字自己拼出来的。

更隐蔽的变体是 npm 生态里的 slopsquatting——AI 幻觉出一个包名，恰好有一个恶意行为者注册了同名的仿冒包，你的 `npm install` 装进去的不是幻觉，是一颗定时炸弹。

**怎么查**：每个不熟悉的依赖，去 Maven Central / npm Registry / PyPI 确认它真实存在，且维护者是官方组织而非个人账户。

### 2. 正确但不对——读起来流畅，逻辑全错

AI 写的代码读起来极其通顺，但一到边界条件就崩。

```
// AI 写的一个企业数据同步服务——读起来完全没问题
public void syncEmployees(List<EmployeeDTO> dataList) {
    List<Employee> entities = new ArrayList<>();
    for (EmployeeDTO dto : dataList) {
        entities.add(convert(dto));
    }
    employeeMapper.batchInsert(entities);
}
```

看起来：遍历、转换、批量入库。没什么问题。

实际上：`dataList` 传入 5000 条没问题，生产环境上游系统一次推了 30 万条——MyBatis 批量插入直接撑爆内存，事务超时回滚。同步任务卡死，下游所有依赖这个同步数据的报表全部空白。

AI 不会自动加分批处理、不会设置批次上限、不知道你们的 JVM 堆只有 2G。它只生成"最直接的实现"，不生成"最安全的实现"。

**怎么查**：不走主路径，专门传大数据量、空列表、null、格式损坏的单条数据。

### 3. 装饰性安全——写了，但没用

AI 知道"安全检查"是好的，所以它会加。但它加的是**看起来有、实际上能绕过的**。

```
// AI 加了一个 auth 检查
@PreAuthorize("hasRole('USER')")
public UserDto getUser(Long id) {
    // 但如果传别人的 ID，没做归属校验
    return userMapper.selectById(id);
}
```

注解在、角色检查在，但任何人都能通过改 URL 里的 ID 参数看到其他用户的数据。AI 完成了"有安全检查"这个任务，但没有理解"这个 API 真正需要保护什么"。

**怎么查**：专门 review 所有带认证/授权注解的方法，确认鉴权粒度匹配业务需求。不只看有没有，看够不够。

### 4. 测试只绿不验证

AI 写的测试最容易迷惑人——绿了，就以为过了。

```
@Test
public void testSyncEmployees() {
    // AI 生成的测试——测了等于没测
    service.syncEmployees(Arrays.asList(mockDto1, mockDto2));
    // 没有断言！只要不报异常就绿
}
```

或者更隐蔽的：

```
@Test
public void testSyncEmployees_HappyPath() {
    service.syncEmployees(createTestData(100));
    List<Employee> result = employeeMapper.selectAll();
    assertEquals(100, result.size());
    // 这个断言是真的在验结果，但只有 happy path
}
```

第一个测试什么都不验证。第二个验证了主路径——100 条数据同步成功——但你没看到它没测 30 万条会怎样、没测空列表、没测单条格式损坏。

**怎么查**：随便改一行代码让逻辑变错，看测试会不会真的 fail。如果改了逻辑测试还绿——这个测试是假的。

### 5. 偷偷扩大修改范围

你让 AI 改登录逻辑，它顺便"优化"了旁边的注释、重构了一个工具类、删了一个它觉得没人用的常量。

"顺手"是 AI 的默认行为，不是 Bug。但每次超范围的修改都是额外风险。

**怎么查**：review 前先扫一遍文件变更列表，问作者"超出需求的改动有哪些，为什么"。答不上来的，拆掉。

### 6. 注释和代码说了两套话

AI 写的注释通常比代码质量高——因为注释是自然语言生成，是它的强项。代码逻辑是结构化生成，反而容易歪。

```
// 当任务执行超时时，重新入队
if (task.getStatus() == TaskStatus.FAILED) {
    taskQueue.enqueue(task);
}
```

注释说"任务超时"，代码判的是"任务失败"。超时和失败是两个完全不同的状态。人和 AI 读注释时被"超时重试"这四个字带跑了注意力，以为这段代码处理了超时场景。实际上超时的任务根本没进到这个分支。流程里超时任务永远卡在队列里不动。

**怎么查**：信代码，不信注释。注释当线索——如果注释和代码描述的不是同一件事，优先怀疑代码。

---

## AI 时代的 CR 新检查清单

旧的 CR 检查清单（变量名、缩进、用 `const` 还是 `let`）已经没意义了——格式化工具和 linter 在保存那一刻就处理完了。

以下是基于 metacto.com 和 aipolicydesk.com 两份 2026 年最佳实践（来源：metacto.com "Code Review for AI-Generated Code: 2026 Standards"；aipolicydesk.com "Reviewing AI-Generated Pull Requests"），做了本土化的 AI 专属 CR 清单：

**1. API 真实存在且版本匹配。** 每个 import 和调用的方法在项目当前依赖版本中存在。AI 容易混用不同版本的方法签名——你可能用的是 Spring Boot 3.1，AI 按 3.3 的 API 写了代码。

**2. 没有幻觉依赖。** 新增的 package 在 Maven Central / npm Registry / PyPI 确实存在，且不是 typo-squatting 的仿冒包。

**3. 没有硬编码密钥。** Token、密码、数据库连接串一律来自环境变量或密钥管理器。AI 最喜欢在"示例代码"里埋 `secretKey = "abc123"`。

**4. 输入校验落实到每个外部入口。** Controller 层、MQ 消费者、定时任务的入参全部有校验。AI 默认走"happy path"，不会主动加判空。

**5. 认证和授权覆盖每个新增端点。** 新加的 API 路径都有鉴权，且权限粒度匹配业务需求——不是只加个 `@PreAuthorize` 就完事。

**6. 异常处理是真的在"处理"。** catch 块有日志、有上下文、有降级逻辑。用户面不泄露堆栈。AI 会写 `catch(Exception e) {}`——空块，这就叫"装饰性异常处理"。

**7. 测试覆盖失败路径。** 不只是 happy path。空输入、超长输入、并发、网络超时都有对应的测试用例。

**8. CI 没被弱化。** Review 时检查这个 PR 有没有删除已有测试、禁用 linter 规则、降低覆盖率阈值。AI 为了"让代码简洁"有时会删掉它认为"冗余"的检查。

**9. 架构边界完整。** 新代码没有跨层调用（Controller 直接调 Mapper）、没有循环依赖、没有在 Service 层出现 SQL 拼接。

**10. 作者能解释代码。** 这就是所谓的"the explainability rule"。随便抽一行，问"这段为什么这么写"。答不上来 = 没读 = 打回。

---

## 不是让你更慢，是让你把时间花对地方

读到这里你可能在想：10 条检查清单，每条都手动查，PR 永远审不完。

实际做法不是手动逐条过。是用三层策略把审查量分层消化。

Cloudflare 公开过他们内部 AI Review 系统的数据（来源：Cloudflare, internal metrics, 2026）：30 天内处理了 131,246 次 AI Review，中位耗时 3 分 39 秒，成本 $1.19/次，人工跳过率仅 0.6%。

模型是这么排的：

**L1：自动检查——零人力。** 格式化（Prettier/Ruff/gofmt）、类型检查（TypeScript/MyPy）、lint（ESLint/Checkstyle）。这些在 CI 里跑，秒级完成。过不了 L1 的 PR 连 Reviewer 都看不到。

**L2：AI Review——自动跑，人看结果。** 选一个 AI Code Reviewer（CodeRabbit、Qoder Review、Cursor BugBot 等），每次 PR 提交自动触发。它查逻辑错误、安全漏洞、API 幻觉、缺失的输入校验。跑完后在 PR 里自动 Comment，人类 Reviewer 只需要看它标出的问题。

**L3：人类判断——时间和注意力集中在正确的地方。** 不再花时间查命名、查格式、查"这行应该换行"——AI 已经把 L1 和 L2 清干净了。L3 的 Reviewer 只做三件事：**判断业务逻辑是否正确、判断架构是否健康、判断这个改动是否真的解决了问题。**

人的时间花在 AI 做不了的事情上。

---

## 落地：三个动作这周就做

**1. PR 模板加一栏。** 在 PR 描述里加一个简单的标记：`AI 参与度：≥80% / 50% / ≤20% / 0%`。不是追责，是给 Reviewer 一个信号——高 AI 参与度的 PR，默认用 AI 专属 CR 清单审查。

**2. 400 行硬上限。** AI 生成一个 1000 行的 PR 和生成一个 50 行的一样轻松，但你审 1000 行的精力和审 50 行完全不同。超过 400 行的 AI PR 必须拆分——拆成多个堆叠 PR，每个独立审查。

**3. 问责铁律。** 批准 Merge 的人拥有最终责任，不管代码是 AI 写的还是人写的。"是 AI 写的"不是出事故时的免责声明。

这三条不需要买新工具，不需要改 CI，今天就能在团队里推行。

---

CR 过去是"代码的质检"，现在是"AI 产出的安全门"。

跳过 CR 的代价不是代码质量稍微降一点。Faros AI 那份报告里，31.3% 的 PR 在没有人类阅读的情况下直接上线。相当于每三个 AI 写的改动，就有一个未经任何审查进了生产环境。

这才是 AI 时代 CR 真正的重点——不是查格式、不是查命名、不是跟你争论三目运算符该不该换行。是确保"看起来全对"的代码，是真的对了。

