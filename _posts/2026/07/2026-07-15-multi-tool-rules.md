---
title: "六款 AI 工具，用同一套 Rules"
author: 唐悦玮
date: 2026-07-15 15:00:00 +0800
categories: [AI开发]
tags: [AI_RULES, Cursor, Copilot, 灵码, everything-claude-code]
pin: false
comments: true
keyword: AI_RULES, everything-claude-code, Cursor Rules, Copilot 配置, 灵码规则, AI编程规范
---

> **摘要**：团队同时用六款 AI 编码工具，每款的 Rules 放在不同目录、用不同格式，维护起来是噩梦。本文引入 everything-claude-code 开源的分层 Rules 体系（common 通用层 + 13 种语言扩展层），给出六工具的落地配置和 SSOT 同步方案。

# 六款 AI 工具，用同一套 Rules

我们团队当前同时在用六款 AI 编码工具：Cursor、Copilot、灵码、Trae、CodeBuddy、Qoder。

不是我们闲得慌，是真实的异构局面——有人写 Java 用 IDEA 配 Copilot、有人写前端用 Cursor、有人做 Agentic 长任务用 Qoder、公司统一采购了灵码。

然后问题来了：A 在 Cursor 里写的编码规范，B 的 Copilot 完全读不到。C 给灵码配了一套 Rules，D 的 Trae 只能靠自己手动记忆。每个人都在各自工具里"调教 AI"，产出风格对不齐，CR 的时候满屏格式冲突。

但反过来想：**如果六款工具能读到同一套 Rules，是不是所有 AI 都能产出风格一致的代码？**

换个问法：**有没有一套现成的、开箱能用的规则库，拷进各个工具的规则目录就能跑？**

还真有。

---

## 开源的分层 Rules：everything-claude-code

[everything-claude-code](https://github.com/obra/everything-claude-code)（以下简称 ECC）是 Claude Code 的"全家桶插件"，其中 rules 目录的设计非常精妙——它不是一篇大长文，而是一个**两层架构**：

```
rules/
├── common/          # 通用编码原则（11 个文件）
├── zh/              # common 的中文翻译版
├── java/            # Java 扩展（5 个文件：coding-style/test/patterns/hooks/security）
├── python/ php/ golang/ typescript/ rust/ cpp/
│   csharp/ swift/ kotlin/ dart/ perl/ web/
└── install.sh       # 一键安装脚本
```

### common 层写什么

common 目录 11 个文件，定义**跟语言无关**的编码原则：

| 文件 | 管什么 |
|------|--------|
| `coding-style.md` | 不可变性（immutability）、文件行数上限、错误处理、输入校验 |
| `testing.md` | 测试覆盖率、测试组织方式、Mock 原则 |
| `security.md` | 密钥管理、依赖安全扫描、无硬编码凭证 |
| `performance.md` | 算法复杂度、缓存策略、N+1 检查 |
| `patterns.md` | 设计模式、SOLID 原则 |
| `git-workflow.md` | commit 规范、分支策略 |
| `hooks.md` | 构建工具 Hook 配置（lint、format、typecheck） |
| `code-review.md` | Code Review 检查清单 |
| `agents.md` | 多 Agent 协作规则 |
| `development-workflow.md` | 开发流程规范 |

每条规则都是**"应该／不应该"的判断**，不是长篇论述。比如 `coding-style.md` 里的核心几条：

> - ALWAYS create new objects, NEVER mutate existing ones
> - MANY SMALL FILES > FEW LARGE FILES（200-400 行，上限 800）
> - ALWAYS validate at system boundaries
> - Functions < 50 lines, no deep nesting (> 4 levels)

没有"在大多数情况下建议考虑可能……"的暧昧写法。AI 不需要"建议"，AI 需要"是／否"。

### 语言层写什么

拿 Java 举例，`rules/java/coding-style.md` 开头一句话：

```
> This file extends [common/coding-style.md](../common/coding-style.md) with Java-specific content.
```

然后告诉 AI：在 Java 里，common 的"不可变性"原则具体怎么落地——

```java
// GOOD — 用 record 做值对象
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

// GOOD — 字段 final，返回防御性拷贝
public List<Item> getItems() {
    return List.copyOf(items);
}
```

同理，Python 目录写"用 `@dataclass` 和 `frozen=True`"，Go 目录写"指针接收器 vs 值接收器"。

**规则优先级：语言特定 > 通用。** 当 java 目录和 common 目录冲突时，AI 优先采信 java 目录的版本。这跟 CSS 的层叠优先级一样——通用样式 + 组件覆写。

---

## 直接拷进你的工具

以 Java 开发者为例，你需要的只是 common 目录 + java 目录。拷进去就行。

### Cursor（最好的多文件支持）

```bash
mkdir -p .cursor/rules
cp -r everything-claude-code/rules/common .cursor/rules/common
cp -r everything-claude-code/rules/java .cursor/rules/java
# 要中文版再加
cp -r everything-claude-code/rules/zh .cursor/rules/zh
```

Cursor 的新版目录结构（`.cursor/rules/`）天然支持多文件、子目录。问 AI 时通过 `@` 菜单选 Rules 就行。想让某条规则默认注入，加 `alwaysApply: true` 的 YAML frontmatter。

### Copilot（唯一的麻烦户）

Copilot 只认一个文件：`.github/copilot-instructions.md`，不支持目录结构。

所以你得把 common + java 的内容**合并**到一个文件里：

```bash
cat rules/common/coding-style.md \
    rules/java/coding-style.md \
    rules/common/testing.md \
    rules/java/testing.md \
    rules/common/security.md \
    rules/java/security.md \
    > .github/copilot-instructions.md
```

注意顺序：先 common，再 java。这样 AI 读的时候，java 的内容覆写 common 的同名规则。

Copilot 还有一个限制：它读复杂 Markdown 的能力不如 Cursor。给 Copilot 的规则要写得短、写成列表、写成祈使句。

❌ "建议在所有可能的场景下优先考虑使用不可变数据结构和纯函数式编程范式以确保代码的高可维护性和可测试性"

✅ "- 用 record 代替 class（Java 16+）\n- 字段加 final\n- 别写 setter"

### 灵码

```bash
mkdir -p .lingma/rules
cp -r rules/common .lingma/rules/common
cp -r rules/java .lingma/rules/java
```

灵码对中文支持极好。如果你团队规范里包含"所有注释用中文""业务异常用 BusinessException 封装"，写在灵码的 rules 里效果比写在 Copilot 里要好得多。

### Trae

```bash
mkdir -p .trae/rules
cp -r rules/common .trae/rules/common
cp -r rules/java .trae/rules/java
```

Trae 的机制几乎照抄 Cursor，同样支持 frontmatter 的 `globs` 和 `alwaysApply`。如果你已经在 Cursor 上配好了，Trae 可以直接复用同一套文件。

### CodeBuddy

```bash
mkdir -p .codebuddy/rules
cp -r rules/common .codebuddy/rules/common
cp -r rules/java .codebuddy/rules/java
```

CodeBuddy 读取 `.codebuddy/rules/` 目录，跟上面一样拷就行。额外支持在 IDE 设置里配全局规则——适合放一些"所有项目都要遵守"的基底规范。

### Qoder

```bash
mkdir -p .qoder/rules
cp -r rules/common .qoder/rules/common
cp -r rules/java .qoder/rules/java
```

Qoder 的规则系统跟 Cursor 很接近——支持四种生效模式：Always Apply（始终生效）、Model Decision（模型决定何时用）、Specific Files（指定文件通配符匹配）、Manual（手动 @rule 引用）。规则直接放在项目仓库 `.qoder/rules/` 下，通过 Git 和团队共享。它还兼容 AGENTS.md 文件——如果你已有 AGENTS.md，拷到项目根目录就能被 Qoder 识别。

---

## 只写项目规则还不够：全局 vs 项目的分配策略

前面六段命令拷的全是**项目规则**——放在代码仓库里，随 Git 提交，团队成员共享。但每款工具还有一个**全局规则**入口，存在你的 IDE 设置里，不跟项目走，打开任何代码仓库都生效。

两个层级的定位完全不同。混用不当，AI 会"精神分裂"。

### 核心区别

| 维度 | 全局规则 | 项目规则 |
|------|---------|---------|
| **存在哪** | 本地 IDE 设置 / 用户级配置，**不随 Git 提交** | 项目仓库根目录，**随 Git 共享给团队** |
| **管多宽** | 所有项目，打开哪个仓库都生效 | 仅当前项目 |
| **谁的** | 你的个人习惯 | 团队的技术共识 |
| **优先级** | 较低，被项目规则覆盖 | 最高 |
| **该写什么** | 回复语言、通用命名风格、代码简洁度 | 框架规范、内部 SDK、数据库表结构、业务逻辑 |

### 致命陷阱：不要把项目规则塞进全局

假设你在全局里写了"本项目使用 Spring Boot 3.2 + `@RestController`"。

第二天你打开一个 React + Java 的老项目，AI 依然死板地给你生成 Spring Boot 的 Controller 代码。**全局规则必须是"换项目不变"的中立内容。**

结论先行：**全局管习惯，项目管技术。** 二八原则——全局 500 字以内封顶，只写这些：

```
✅ 全局规则写什么：
- "始终用中文回复，代码注释也用中文"
- "保持简洁，遵循 DRY 原则"
- "给出修改建议时，先说明原因，再给代码"
- "绝不要生成硬编码密码，用环境变量"
```

```
✅ 项目规则写什么：
- "Service 层抛 BusinessException，Controller 层严禁 catch"
- "Redis 用公司封装的 XxxRedisTemplate，禁止原生 Jedis"
- "MySQL 表名 t_ 前缀，必须含 id/create_time/update_time/is_deleted"
- "包结构：controller → service → mapper，禁止跨层调用"
```

### 冲突谁说了算

如果你全局写了"用英文注释"，项目写了"用中文注释"——AI 听项目规则的。业界共识：**项目规则优先级最高**。

如果确实需要覆盖全局规则，在项目规则开头加一句："忽略全局规则中的注释语言要求，本项目强制中文注释。"

### 六工具的全局规则怎么配

| 工具 | 全局规则在哪设 | 项目规则在哪放 | 注意 |
|------|--------------|--------------|------|
| **Cursor** | `Settings → Rules for AI`（纯文本框） | `.cursor/rules/*.mdc` | 全局是单文本框，复杂规则别放这 |
| **Copilot** | VS Code `Settings → Copilot Instructions` | `.github/copilot-instructions.md` | 全局和项目会叠加生效 |
| **灵码** | IDE 插件设置 → 自定义指令 | `.lingma/rules/*.md` | 灵码中文好，"中文回复"放全局效果最佳 |
| **Trae** | `Settings → Rules` | `.trae/rules/*.md` | 跟 Cursor 一样，全局兜底、项目覆盖 |
| **CodeBuddy** | IDE 插件设置 → 自定义指令 | `.codebuddy/rules/*.md` | 同上 |
| **Qoder** | 用户级目录 `~/.qoder/rules/` | 项目 `.qoder/rules/*.md` | 用户级可放通用规则、项目级放技术栈规则 |

一句话：**全局是 AI 的"默认人格"，项目是 AI 的"当前工作手册"。** 默认人格保持中立，工作手册写满细节。

---

## 团队管理：一套源，六份分发

如果让每个人手动拷贝六个目录，早晚有人忘了更新导致规则版本不一致。

### SSOT 策略

在项目根目录建一个源目录（不被任何工具直接读取）：

```
AI_PROMPTS/
├── base/           # symlink 或 copy from ECC common/
├── java/           # symlink 或 copy from ECC java/
└── sync.sh         # 同步脚本
```

然后写一个同步脚本，把源目录里的内容分发到六个工具各自的 rules 目录：

```bash
#!/bin/bash
# 建目标目录
mkdir -p .cursor/rules .trae/rules .lingma/rules .codebuddy/rules .qoder/rules .github

# 多文件工具：直接拷
cp -r AI_PROMPTS/base/* .cursor/rules/
cp -r AI_PROMPTS/base/* .trae/rules/
cp -r AI_PROMPTS/base/* .lingma/rules/
cp -r AI_PROMPTS/base/* .codebuddy/rules/
cp -r AI_PROMPTS/base/* .qoder/rules/

# Copilot：合并成单文件
cat AI_PROMPTS/base/*.md AI_PROMPTS/java/*.md > .github/copilot-instructions.md

echo "✅ Rules 同步完成"
```

### 关键一步：Git 忽略策略

**别把六个工具的 rules 目录提交到仓库。** 一旦提交了 `.cursor/rules/`、`.trae/rules/` 这些生成的目录，六个人的六个工具版本会在 Git 里打架。

`.gitignore` 里这样写：

```gitignore
# AI 工具生成的规则目录（由 sync.sh 本地生成）
.cursor/rules/
.trae/rules/
.lingma/rules/
.codebuddy/rules/
.qoder/rules/
.github/copilot-instructions.md

# 只保留源文件
!AI_PROMPTS/
```

团队的规则修改，只改 `AI_PROMPTS/` 里的源文件。开发者 checkout 后跑 `npm run sync-rules` 就同步到自己的工具。

还可以在 CI 里加一道拦截：如果检测到 `.cursor/rules/` 等目录被提交了，直接拒绝。

---

## 踩过的坑

**1. 别把所有规则设成 alwaysApply**

ECC 的 common 有 11 个文件，如果你全设成 `alwaysApply: true`，每次 AI 对话都注入几千行规则进去。Token 会爆，而且 AI 在超长上下文里反而变笨。

做法：只说核心几条保持 `alwaysApply`（比如 coding-style 的不可变性、security 的无硬编码），其他用 `globs` 限定文件类型，或者让开发者手动 `@` 引用。

**2. 目录不能展开**

Copilot 之外的工具都支持目录结构，**别把 common 和 java 的内容展开摊平到一个目录里。** 因为 common 和 java 有同名文件（比如都有 `coding-style.md`），展开会互相覆盖。而且 java 的文件里写了 `../common/xxx.md` 的相对引用，展开后路径全断。

**3. Copilot 要单独"翻译"一次**

给 Cursor 的规则可以直接是英文（因为它是英文生态项目产出的），但给 Copilot 加一份中文简版效果更好。不需要全量翻译，挑核心 5-8 条，写成列表即可。

**4. 这是一套起点，不是终点**

ECC 的开源 rules 覆盖了通用原则和语言习惯，但不包含你们项目的**业务约束**。比如"Controller 只做路由，业务逻辑全放 Service""支付模块必须加防重锁""数据库操作必须走 Repository 层"。这些需要你自己写，放在 source 目录追加进去。

---

## 写在最后

六工具的 Rules 碎片化，本质不是"每个工具配置太复杂"，而是**缺一个统一的上游**。

ECC 的这套分层 rules 恰好提供了这个上游：common 写普适原则，语言层做本地化。拷过来就能用，改起来只改一个源头。

然后团队里谁用 Cursor、谁用 Trae、谁用 CodeBuddy，吃进去的是同一套东西。CR 的时候讨论的是业务逻辑对不对，而不是"你这行为什么用 StringBuilder 拼接而不是 String.format"。

> 作者：[唐悦玮](https://tangyuewei.com)  |  从后端出发，用 AI 拓展到全栈的工程师。
