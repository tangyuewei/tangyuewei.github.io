# 如何选择与搭配：Superpowers、ECC、OpenSpec、spec-kit、Trellis

这五个工具并非竞争关系，而是各自解决不同的问题。核心思路：**用方法论约束思路，用规范固化决策，用工具箱补足能力，用编排串联全局**。

## 1. 核心定位对比

| 工具 | 定位 | 思路 | 触发方式 | 强制性 |
|---|---|---|---|---|
| **[Superpowers](https://github.com/obra/superpowers)** | 方法论（教练） | 强制按正确的软件工程流程走：`brainstorming` -> `writing-plans` -> `subagent-driven-development` -> `TDD` | 自动触发（靠 `using-superpowers`） | ★★★★★（最高） |
| **[ECC (Everything Claude Code)](https://github.com/affaan-m/everything-claude-code)** | 工具箱（瑞士军刀） | 提供大量预设的 agents、slash commands、hooks、skills，按需调用 | 手动（`/tdd`、`/security`、`/code-review` 等） | ★☆☆☆☆（最低） |
| **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** | 轻量 SDD（变更文档） | 变更优先（change-first）。用 `proposal`、`specs`、`tasks` 记录每一次变更的意图、需求和拆解 | 半手动（CLI 或 slash 命令） | ★★★☆☆（中等） |
| **[spec-kit](https://github.com/github/spec-kit)** | 全量 SDD（企业文档） | 规范优先（spec-first）。用 `constitution`、`specify`、`plan`、`tasks`、`implement` 严格走全套流程 | 半手动（slash 命令为主） | ★★★★☆（较高） |
| **[Trellis](https://github.com/mindfold-ai/Trellis)** | 工作流编排（调度器） | 将任务、上下文、Agent、子任务编排成可执行的工作流。更像是"任务图"而不是"方法论"本身 | 半自动（定义工作流后，由 Trellis 调度执行） | ★★★☆☆（取决于你设计的工作流） |

## 2. 如何选择

| 场景 | 推荐 | 原因 |
|---|---|---|
| **不知道从哪下手，想强制养成好习惯** | **Superpowers** | 装上就够用。它会在你还没想清楚就开始写代码时把你拉回到设计和规划。 |
| **临时做专项检查（安全、语言审查、死代码清理）** | **ECC** | 点对点最省事。特别适合 OpenCode，用 `/ecc:*` 命令比让 Agent 去猜 skill 要快且可控。 |
| **中小型项目，需要记住"为什么改"** | **OpenSpec** | 轻量又实用。每个变更自成一篇小文档，项目越大也不会膨胀成一堆巨型 spec。 |
| **大型项目、团队协作、要交接或严格审批** | **spec-kit** | 流程最完整，产出的文档最适合团队共识和后续维护。 |
| **要同时调度多个 Agent、复杂任务拆解或跨会话编排** | **Trellis** | 它的价值是"编排"，而不是"教你怎么写代码"。适合已经有明确流程，需要自动化调度多个 Agent 并行执行的场景。 |

## 3. 推荐搭配方案

别全都装上。选一套主干，再按需补充即可。

| 方案 | 组合 | 适用人群 | 说明 |
|---|---|---|---|
| **极简（个人最常用）** | `Superpowers + ECC` | 大多数个人开发者 | **最省心的组合**。Superpowers 负责全流程（思考->规划->实现），ECC 负责临时的专业化审查和清理。你已经在用这个组合，完全够用。 |
| **轻量 SDD（个人注重文档）** | `Superpowers + OpenSpec` | 想既要流程约束，又想留下变更记录的开发者 | Superpowers 帮你规划和执行，OpenSpec 把关键变更固化成可追溯的文档。特别适合长期维护的个人项目。 |
| **企业级 SDD（团队）** | `spec-kit + ECC` | 需要强规范、多人协作的团队 | spec-kit 定义"做什么、怎么做"的全套规范，ECC 提供各语言、各场景的审查和工具。Trellis 可选加上做调度。 |
| **全自动编排（重度 Agent 使用者）** | `Superpowers + Trellis + ECC` | 已经非常熟悉 Agent，用得特别多且任务特别复杂的人 | Superpowers 约束方法论，Trellis 编排多 Agent 并行和依赖，ECC 提供专项能力。上手成本最高，但最能压榨多 Agent 效率。 |

## 精简建议

- **如果只想选一个装上**：选 **Superpowers**。它是唯一能真正"改变 Agent 行为"的工具。
- **如果已经装了 Superpowers，还想补充**：优先补 **ECC**（实用性最高，几乎零冲突）。
- **如果特别在乎变更留痕**：再加 **OpenSpec**。比 spec-kit 更适合个人日常使用。
- **如果你正琢磨"怎么让十个 Agent 同时干活还不打架"**：才考虑 **Trellis**。单纯写代码用不到它。

**核心原则：方法论（Superpowers） > 规范（OpenSpec/spec-kit） > 工具箱（ECC） > 编排（Trellis）。主干用方法论约束思路，其他的都是锦上添花。**
