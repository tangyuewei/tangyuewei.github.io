---
title: 聊聊这六个超火的 AI 编程工具
author: 唐悦玮
date: 2026-10-30 11:48:00 +0800
categories: [AI编程, 工程实践]
tags: [Superpowers, ECC, OpenSpec, spec-kit, Trellis, 规格驱动开发, 工作流]
pin: false
comments: true
keyword: Superpowers, ECC, OpenSpec, spec-kit, Trellis, mattpocock skills, SDD, 规格驱动开发
---

> **摘要**：Superpowers、ECC、mattpocock/skills、OpenSpec、spec-kit、Trellis，六个工具常被放在一起比，但它们不在同一个层面上。这篇按定位、触发方式和强制性摆开看，再给五套搭配方案。多数人装两个就够，装六个反而互相打架。

这六个工具并非竞争关系，而是各自解决不同的问题。核心思路：**用方法论约束思路，用规范固化决策，用工具箱补足能力，用编排串联全局**。

## 核心定位对比

| 工具 | 定位 | 思路 | 触发方式 | 强制性 |
|---|---|---|---|---|
| **[Superpowers](https://github.com/obra/superpowers)** | 方法论（教练） | 强制按正确的软件工程流程走：`brainstorming` -> `writing-plans` -> `subagent-driven-development` -> `TDD` | 自动触发（靠 `using-superpowers`） | ★★★★★（最高） |
| **[ECC (Everything Claude Code)](https://github.com/affaan-m/ECC)** | 工具箱（瑞士军刀） | 提供大量预设的 agents、slash commands、hooks、skills，按需调用 | 手动（`/tdd`、`/security`、`/code-review` 等） | ★☆☆☆☆（最低） |
| **[mattpocock/skills](https://github.com/mattpocock/skills)** | 技能库（可改可组合） | 技能拆小，能改能拼。动手前用 `/grill-me` 把需求问清楚，再按需挂 `/tdd`、`/diagnosing-bugs` | 手动为主（用户调用才触发，部分可被 Agent 自动取用） | ★★☆☆☆（较低） |
| **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** | 轻量 SDD（变更文档） | 变更优先（change-first）。每个变更一个目录，用 `proposal`、`specs`、`design`、`tasks` 记录意图、需求、设计与拆解 | 半手动（`/opsx:propose`、`/opsx:apply`、`/opsx:archive`） | ★★★☆☆（中等） |
| **[spec-kit](https://github.com/github/spec-kit)** | 全量 SDD（企业文档） | 规范优先（spec-first）。`/speckit-constitution` 起头，specify、plan、tasks、implement、converge 走完一个特性 | 半手动（slash 命令逐条敲，每步要人看结果） | ★★★★☆（较高） |
| **[Trellis](https://github.com/mindfold-ai/Trellis)** | 工程框架（上下文持久化） | 约定、任务上下文、历史记忆分别落在 `.trellis/` 的三个目录，每次会话自动注入 | 半自动（仓库里 init 一次，之后自动带上下文） | ★★★☆☆（取决于你写了多少约定） |

![六个工具的强制性阶梯](/imgs/202610/2026-10-30-ai-coding-frameworks-four-layers-diagram-1.png)

mattpocock/skills 和 spec-kit 是明确的路线冲突。它的 README 把 Spec-Kit 这类方案点了名：那些工具试图"拥有流程"，代价是你交出控制权，流程本身出问题的时候也难修。它的解法反过来——技能拆到你手里能改，并且分两类：只有你敲命令才触发的负责编排，Agent 能自己取用的承载纪律。前者可以调用后者，反过来不行。

## 如何选择

| 场景 | 推荐 | 原因 |
|---|---|---|
| **不知道从哪下手，想强制养成好习惯** | **Superpowers** | 装上就够用。它会在你还没想清楚就开始写代码时把你拉回到设计和规划。 |
| **临时做专项检查（安全、语言审查、死代码清理）** | **ECC** | 点对点最省事。特别适合 OpenCode，用 `/ecc:*` 命令比让 Agent 去猜 skill 要快且可控。 |
| **已经有自己的流程，只想补几个动作** | **mattpocock/skills** | 不接管你的流程。`/grill-me` 管动手前对齐，`/tdd` 管实现，`/diagnosing-bugs` 管排查，缺哪个挂哪个。 |
| **中小型项目，需要记住"为什么改"** | **OpenSpec** | 轻量又实用。每个变更自成一篇小文档，项目越大也不会膨胀成一堆巨型 spec。 |
| **大型项目、团队协作、要交接或严格审批** | **spec-kit** | 流程最完整，产出的文档最适合团队共识和后续维护。 |
| **跨多个 AI 工具，嫌每次都要重讲一遍规矩** | **Trellis** | 约定、任务上下文、历史记忆都落在 `.trellis/` 里，换个工具换个人接手都不丢。 |

![按场景选择工具的分支路径](/imgs/202610/2026-10-30-ai-coding-frameworks-four-layers-diagram-2.png)

## 推荐搭配方案

别全都装上。选一套主干，再按需补充即可。

| 方案 | 组合 | 适用人群 | 说明 |
|---|---|---|---|
| **极简（个人最常用）** | `Superpowers + ECC` | 大多数个人开发者 | **最省心的组合**。Superpowers 负责全流程（思考->规划->实现），ECC 负责临时的专业化审查和清理。你已经在用这个组合，完全够用。 |
| **轻量 SDD（个人注重文档）** | `Superpowers + OpenSpec` | 想既要流程约束，又想留下变更记录的开发者 | Superpowers 帮你规划和执行，OpenSpec 把关键变更固化成可追溯的文档。特别适合长期维护的个人项目。 |
| **只补动作（工程老手）** | `mattpocock/skills + ECC` | 已经有自己的开发节奏，只缺几个动作的人 | 不动你的流程，缺什么补什么。`/grill-me` 对齐需求，`/tdd` 管实现，ECC 补各语言的专项审查。 |
| **企业级 SDD（团队）** | `spec-kit + ECC` | 需要强规范、多人协作的团队 | spec-kit 定义"做什么、怎么做"的全套规范，ECC 提供各语言、各场景的审查和工具。Trellis 可选，用来把约定和记忆留在仓库里。 |
| **跨工具长跑（重度 Agent 使用者）** | `Superpowers + Trellis + ECC` | 同时用好几个 AI 编程工具、任务周期长的人 | Superpowers 约束方法论，Trellis 把约定和记忆留在仓库里，ECC 提供专项能力。三件叠起来每次会话灌的上下文最多，收益得自己算。 |

## 精简建议

- **如果只想选一个装上**：选 **Superpowers**。它是唯一能真正"改变 Agent 行为"的工具。
- **如果已经装了 Superpowers，还想补充**：优先补 **ECC**（实用性最高，几乎零冲突）。
- **如果特别在乎变更留痕**：再加 **OpenSpec**。比 spec-kit 更适合个人日常使用。
- **如果你已经有一套自己的流程**：用 **mattpocock/skills**。它只补动作，不抢流程。
- **如果你同时在用好几个 AI 编程工具，嫌每次都要重讲一遍规矩**：才考虑 **Trellis**。只用一个工具写代码，用不到它。

**核心原则：方法论（Superpowers） > 规范（OpenSpec/spec-kit） > 工具箱（ECC/mattpocock skills） > 编排（Trellis）。主干用方法论约束思路，其他的都是锦上添花。**

> star 数与最后提交时间取自 GitHub API，统计于 2026-10-28。工具迭代快，具体命令请以各自 README 为准。

## 参考资料

1. Superpowers — <https://github.com/obra/superpowers>（超 30.6 万 star）
2. ECC — <https://github.com/affaan-m/ECC>（超 29.1 万 star）。原仓库名 `everything-claude-code` 已改名
3. mattpocock/skills — <https://github.com/mattpocock/skills>（超 30.5 万 star）
4. OpenSpec — <https://github.com/Fission-AI/OpenSpec>（超 7.3 万 star）
5. spec-kit — <https://github.com/github/spec-kit>（超 14.3 万 star）
6. Trellis — <https://github.com/mindfold-ai/Trellis>（超 1.5 万 star）

