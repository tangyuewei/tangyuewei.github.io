---
title: "AI 编程三件套：Spec Kit 协同实战"
author: 唐悦玮
date: 2026-07-11 14:20:00 +0800
categories: [AI开发]
tags: [Spec Kit, Superpowers, ECC, AI编程, 工程化]
pin: false
comments: true
keyword: Spec Kit, Superpowers, ECC, AI编程, SDD, TDD, Claude Code, 项目实践
---

# Spec Kit + Superpowers + ECC 最佳项目实践指南


> **摘要**：本文系统介绍了 Spec Kit（规范治理）、Superpowers（工程质量）和 ECC（能力增强）三款 AI 编程工具的组合实践方法。通过 Spec Kit 的 SDD 工作流确保"按规范做"，Superpowers 的 TDD 和验证机制确保"把东西做对"，ECC 的 agents 和 hooks 确保"有能力做好"。文章详细阐述了三组件的核心机制、完整配合流程、场景决策矩阵和快速参考，为中型以上功能开发、多人协作和长期维护项目提供了完整的 AI 辅助编程解决方案。

AI 写代码越来越强，但随之而来的是三个新问题：
- **规范问题**（AI 知道该按什么标准写吗？）
- **质量问题**（写完的代码怎么验证它真的对？）
- **能力问题**（AI 能不能持续学会项目的上下文？）

这三个问题，正好对应三个工具：Spec Kit 解决规范问题，Superpowers 解决质量问题，ECC 解决能力问题。它们单独用都还说得过去，但组合在一起，效果是乘法级的。之前写过一篇有简单介绍，这一篇继续迭代加深印象。

> AI 编程的痛点不在于 AI 写不对，而在于写完没人知道合不合规范、质量可不可信。本文介绍 Spec Kit（规范治理）+ Superpowers（工程质量）+ ECC（能力增强）三件套的实战配合方法，覆盖从项目初始化到代码收尾的完整流程。

---

## 1. 三组件定位

| 组件 | 本质 | 来源 |
|------|------|------|
| **Spec Kit** | Spec-Driven Development 工具包 + CLI | [github/spec-kit](https://github.com/github/spec-kit) |
| **Superpowers** | 工程方法论体系（15 skills） | [obra/superpowers](https://github.com/obra/superpowers) |
| **ECC** | Claude Code 增强插件 | [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) |

**核心分工：**

```
Spec Kit     → 治理层：Constitution + SDD 工作流（确保"按规范做"）
Superpowers  → 工程层：TDD + 验证 + 审查（确保"把东西做对"）
ECC          → 能力层：agents + hooks + 持续学习（确保"有能力做好"）
```

---

## 2. Spec Kit 核心机制

**SDD 工作流（8 步）：** Constitution → Specify → Clarify → Plan → Validate → Tasks → Implement → Converge

**Slash 命令速查：**

| 命令 | 职责 |
|------|------|
| `/speckit.constitution` | 创建项目宪法（编码质量、测试标准、安全规则） |
| `/speckit.specify` | 定义需求：用户故事 + FR + 成功标准（What） |
| `/speckit.clarify` | 消除需求歧义（Plan 前必执行） |
| `/speckit.plan` | 技术方案：架构、数据模型、API 规格（How） |
| `/speckit.tasks` | 依赖排序的任务列表，`[P]` 标记可并行 |
| `/speckit.implement` | AI agent 按 tasks.md 执行 |
| `/speckit.converge` | 评估代码与规格的差距，生成关闭任务 |

**关键概念：** Constitution（项目宪法）、Primitives（Extensions/Presets/Overrides 三级覆盖）、Bundles（角色预配置包）、CLI（`specify init/bundle/extension`）

**产出物：**
```
.specify/memory/constitution.md     ← 项目宪法
specs/001-feature/
  spec.md                           ← 需求 + 用户故事 + 成功标准
  plan.md / data-model.md / tasks.md / contracts/
```

---

## 3. Superpowers 核心机制

| Skill | 铁律 / 关键规则 |
|-------|----------------|
| brainstorming | 一次一个问题，2-3 方案，分段确认 |
| writing-plans | 精确文件路径 + 完整代码，2-5 分钟/步 |
| using-git-worktrees | 必须验证 gitignore 后才创建 |
| subagent-driven-development | 规格合规审查 → 代码质量审查（不可颠倒） |
| executing-plans | 批量执行（3 任务）+ 检查点 |
| test-driven-development | **无失败测试不写代码** |
| verification-before-completion | **无验证证据不言完成** |
| systematic-debugging | 根因 → 模式 → 假设 → 修复；3 次失败质疑架构 |
| requesting-code-review | 每任务/批次后派发 code-reviewer |
| finishing-a-development-branch | 测试不过不合并，4 选项收尾 |
| dispatching-parallel-agents | 仅用于独立问题域 |

---

## 4. ECC 核心机制

| 命令 | Agent | 产出 |
|------|-------|------|
| `/plan-prd` | — | `.claude/prds/{name}.prd.md` |
| `/plan` | planner | `.claude/plans/{name}.plan.md` |
| `/tdd` | tdd-guide | TDD 引导实现 |
| `/code-review` | code-reviewer | 代码审查 |
| `/security-scan` | security-reviewer | 安全报告 |
| `/build-fix` | build-error-resolver | 构建修复 |
| `/learn` / `/evolve` | — | 持续学习 |

**Hooks：** session-start/end（跨会话记忆）、pre-compact/suggest-compact（压缩管理）
**Rules：** common/（通用）+ 语言特定（TS/Python/Go/Java/Kotlin），始终生效

---

## 5. 完整配合流程

### 阶段一：项目治理（Spec Kit）
```
specify init → /speckit.constitution → .specify/memory/constitution.md
```

### 阶段二：需求工程（Spec Kit）
```
/speckit.specify → spec.md（用户故事 + FR + 成功标准）
/speckit.clarify → 消除歧义，更新 spec.md
```

### 阶段三：技术规划（Spec Kit）
```
/speckit.plan → plan.md + data-model.md + research.md + contracts/
验证计划（对齐 Constitution）
/speckit.tasks → tasks.md（依赖排序，[P] 标记）
```

### 阶段四：实现细化（Superpowers）
```
brainstorming → docs/plans/YYYY-MM-DD-design.md（细化实现方案）
writing-plans → docs/plans/YYYY-MM-DD-feature.md（极细粒度步骤）
```

### 阶段五：执行（三组件协同）
```
环境：git worktree（Superpowers） + ECC hooks/rules 自动生效

每任务循环：
  1. 按 writing-plans 步骤执行（Superpowers TDD 铁律）
  2. 阻塞 → systematic-debugging（Superpowers） / /build-fix（ECC）
  3. 完成 → verification-before-completion（Superpowers）
  4. 审查 → 规格合规（对齐 Spec Kit spec.md）→ 代码质量
  5. 标记完成，下一任务

全部完成 → /speckit.converge 评估差距
```

### 阶段六：收尾
```
finishing-a-development-branch（Superpowers：4 选项收尾）
/speckit.taskstoissues（可选：转 GitHub Issues）
/learn + /evolve（ECC 持续学习）
```

---

## 6. 场景决策矩阵

| 场景 | Spec Kit | Superpowers | ECC |
|------|:---:|:---:|:---:|
| 修 typo / 配置 | ✗ | ✗ | ✗ |
| 简单 bug | ✗ | ✓ debugging + TDD | ✓ rules |
| 小型功能（1-3 文件） | ✗ | ✓ brainstorming + TDD | ✓ rules |
| 中型功能（4-10 文件） | 可选 | ✓ 核心 | ✓ agents |
| 大型功能（10+ 文件） | ✓ 完整 | ✓ 完整 | ✓ 完整 |
| 多人协作 | ✓ 完整 | ✓ 完整 | ✓ rules 共享 |

---

## 7. 快速参考

### 文件产出总览

```
.specify/memory/constitution.md    ← Spec Kit: 项目宪法
specs/001-feature/spec.md          ← Spec Kit: 需求
specs/001-feature/plan.md          ← Spec Kit: 技术方案
specs/001-feature/tasks.md         ← Spec Kit: 任务分解
docs/plans/YYYY-MM-DD-design.md    ← Superpowers: 设计细化
docs/plans/YYYY-MM-DD-feature.md   ← Superpowers: 极细粒度计划
.claude/prds/{name}.prd.md         ← ECC: PRD
.claude/plans/{name}.plan.md       ← ECC: 计划
.worktrees/<branch>/               ← Superpowers: 隔离环境
```

### 铁律清单

| 铁律 | 来源 |
|------|------|
| 所有产物对齐 Constitution | Spec Kit |
| 每阶段用户确认后才进入下一阶段 | Spec Kit |
| 无失败测试不写生产代码 | Superpowers TDD |
| 无验证证据不言完成 | Superpowers verification |
| 规格合规审查先于代码质量审查 | Superpowers |
| 3 次修复失败 → 质疑架构 | Superpowers debugging |
| 测试不过不合并 | Superpowers finishing |

### 三组件对比

| 维度 | Spec Kit | Superpowers | ECC |
|------|----------|-------------|-----|
| 本质 | SDD 工具包 + CLI | 工程方法论 | AI 增强插件 |
| 核心 | 治理 + 规格驱动 | 代码质量 + 纪律 | 能力增强 + 自动化 |
| 需求产物 | `spec.md`（故事+FR+标准） | `design.md`（细化） | `.prd.md` |
| 计划粒度 | 任务级 | 步骤级（2-5分/步） | 阶段级 |
| 治理文档 | `constitution.md` | 无 | 无 |
| TDD | 支持排序 | 铁律 | 可选 |
| 审查 | 无 | 双阶段 | 单次 |
| 差距评估 | converge | 无 | 无 |
| 跨会话 | 无 | 无 | hooks+学习 |
| CLI | `specify` 系列 | 无 | 无 |

---

用了这套组合拳三个月，最大的变化不是代码写得有多快，而是**我敢说"这代码能上线了"**。

以前 AI 写的代码，我心里永远有个"万一"。万一测试覆盖不够？万一它跳过了边界条件？万一 PR 审查的人看不出来？这些"万一"，现在都有机制兜底：Constitution 管住了"该不该写"，TDD 管住了"对不对"，双阶段审查管住了"好不好"。

但我必须说，这套流程不是银弹。

如果你只是修个 typo、改个配置，别走这套流程，纯属浪费时间。如果是一个人做的小脚本，Spec Kit 的完整工作流也显得太重。这套东西最适合的场景是：中型以上功能、多人协作、代码需要长期维护。

还有一个心得：别一上来就把三个工具全配齐。我的建议是先装 ECC（零成本，hooks 和 rules 装完就生效），然后引入 Superpowers 的 TDD 和 verification 两个 skill，最后再上 Spec Kit 的完整工作流。渐进式地加，每个阶段适应一两周，团队才不会抗拒。

说到底，这些工具不是替代你的判断力，而是帮你把"不放心"变成"有据可查"。AI 写的代码不再是黑盒，每一步都有迹可循。这才是它们真正的价值。


*基于 [Spec Kit](https://github.com/github/spec-kit)、[Superpowers](https://github.com/obra/superpowers)、[ECC](https://github.com/affaan-m/everything-claude-code)编写*

---
**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。

