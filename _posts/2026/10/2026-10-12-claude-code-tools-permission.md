---
title: Claude Code 的工具与权限：怎么在放手和失控之间画线（中）
author: 唐悦玮
date: 2026-10-12 10:22:00 +0800
categories: [AI编程, 工程实践]
tags: [ClaudeCode, 工具系统, 权限模型, Hook, 沙箱, 工程化]
pin: false
comments: true
keyword: Claude Code工具, 权限模型, deny-first, Hook拦截, 沙箱隔离, agentic harness
image:
  src: /imgs/202610/2026-10-12-claude-code-tools-permission.png
  alt: Claude Code 的工具与权限：怎么在放手和失控之间画线（中）
---

上篇把主循环讲完了。循环本身很简单：模型产出工具调用，SDK 执行，结果回灌。真正决定一个 agent 是「好用」还是「危险」的，是循环两侧的两样东西——**工具给了它什么手，权限给它套了什么缰绳**。中篇就拆这两样。

## 工具池：最多 54 个，怎么拼出来的

所有内置工具不是一次性全塞给模型的，而是由 `tools.ts` 里的 `assembleToolPool()` 动态拼装。设计空间论文给了一个具体数字：最多 54 个内置工具，其中 19 个无条件开放，35 个受功能开关和用户类型控制。拼好之后，再和 MCP 提供的工具合并。

为什么要这样分批？因为工具的「可见成本」不低：每个工具定义都要占上下文，每个工具都是模型可能走的一条岔路。把不常用、或当前用户用不上的工具折叠起来，既省 token，也减少模型「挑花眼」的概率——这跟我们之前聊过的「工具给到六十个它开始挑花眼」是同一个机理，只不过 Claude Code 是在 harness 层用功能开关主动控量。

官方把内置工具归成五类，每一类代表一种「能动性」：

- **文件操作**：读文件、改代码、建新文件、重命名和重组。
- **搜索**：按模式找文件、用正则搜内容、探索代码库。
- **执行**：跑 shell 命令、起服务、跑测试、用 git。
- **网页**：搜网页、抓文档、查报错。
- **代码智能**：编辑后看类型错误和警告、跳定义、找引用（需代码智能插件）。

此外还有一类「编排工具」：派生子代理、向你提问等等。

![图1：内置工具的五类划分与一次典型调用链路（模型选工具 → SDK 执行 → 结果回灌）。](/imgs/202610/2026-10-12-claude-code-tools-permission-infographic-1.jpg)

## 几个关键工具，值得单独看

- **Read**：默认一次读约 2000 行，超了要分页。这是刻意的设计——防止一次把整个大文件灌进上下文，把窗口吃爆。
- **Grep / Glob**：Grep 是完整正则，对标 ripgrep 的能力。有意思的是官方明确选了正则而不是向量库或 embedding——模型本来就懂代码结构，能自己写出精准正则，省掉维护索引的复杂度。这也呼应了上篇说的「先做最简单的事」。
- **Edit**：做的是外科手术式的 diff，只改目标片段；Write / Replace 负责整文件或新建。终端只显示最小 diff，但每次改动都可追溯。
- **Bash**：维护持久 shell 会话（环境变量、工作目录跨调用保留），并对命令做风险分级和确认。它还会主动过滤注入尝试（比如拦反引号和 `$()` 结构），在灵活和安全之间取平衡。
- **Task / Agent**：派生子代理——这块下篇会展开，它是把噪音挡在主会话之外的关键手段。

## 权限系统：为什么是 deny-first

工具越多，越需要一道闸门。Claude Code 的权限系统核心是 `permissions.ts` 里的 **deny-first（先拒后放）** 求值。规则分三档：

- **allow**：直接放行，不弹窗。
- **ask**：弹窗让你确认。
- **deny**：直接阻断。

求值顺序是先查 deny，再查 allow，都不命中就落到 ask。这个顺序很重要——**deny 优先于 allow**，意味着你可以先写一条严防死守的 deny（比如 `Bash(rm -rf *)`），再在上面开若干安全的 allow（比如 `Bash(npm test:)`），既不会漏掉危险操作，也不用每次都点确认。

`settings.json` 里就是这么配的：

```
{
  "permissions": {
    "allow": ["Bash(npm test:)", "Read(**)"],
    "ask":   ["Bash(git push:)"],
    "deny":  ["Bash(rm -rf /)", "Read(.env)"]
  }
}
```

除了手写规则，Claude Code 还有一个 **auto-mode 机器学习分类器**：对模糊操作，它自动判断该放行还是拦截，减少「审批疲劳」。生产里常见的一个反模式是：让 Claude 一天问你四十次 `npm test` 要不要跑，问到最后你闭眼全点 yes——那一刻，整套安全模型就成了摆设。把高频安全命令写进 allow，本质上是在保住安全模型的严肃性。

## Hook：比 CLAUDE.md 狠得多的那层

理解 Claude Code 的人和不理解的人，分水岭往往就在一句话：**CLAUDE.md 是建议，Hook 是强制**。

CLAUDE.md 的内容是作为上下文喂给模型的，模型「尽量照做」，但文档自己也说不保证严格服从。如果某件事必须每次都发生、零例外，别写进 CLAUDE.md，写个 hook——一个在生命周期事件上确定性执行的 shell 命令。

Hook 挂在哪些事件上？`PreToolUse`（工具执行前）、`PostToolUse`（执行后）、`UserPromptSubmit`（你提交消息时）、`SessionStart`、`Stop`、`PreCompact` 等。`PreToolUse` 有个关键机制：**退出码 2 直接阻断该工具调用，并把 stderr 回灌给 Claude 当错误信息**。比如下面这段拦危险 Bash 的逻辑：

```
COMMAND=$(jq -r '.tool_input.command' <<<"$CLAUDE_TOOL_INPUT")
if echo "$COMMAND" | grep -q "rm -rf"; then
  echo "rm -rf blocked" >&2
  exit 2   # ← 阻断
fi
exit 0     # 放行
```

退出 0 放行，退出 2 阻断，其它退出码是非阻断的警告。这才是真正的护栏：拦写受保护目录、在内容推进前先打分——这类事，写在 Markdown 里的建议永远保证不了。

![图2：deny-first 权限判定树，以及 PreToolUse hook 在工具执行前的拦截点。](/imgs/202610/2026-10-12-claude-code-tools-permission-infographic-2.jpg)

## 沙箱：执行环境的最后一道墙

权限管的是「该不该做」，沙箱管的是「做了会不会炸到宿主」。执行环境由 `shouldUseSandbox.ts` 决定是否走可选沙箱隔离——把 shell 执行、文件系统操作关进隔离边界里，危险命令即使被放行，影响也被框住。

把这几层连起来看：模型想调工具 → 权限系统先判 deny/allow/ask → 若放行，PreToolUse hook 还能最后拦截或修改 → 真正执行时，沙箱决定隔离边界。这是一条层层递减的防线，不是一道开关。

## 一句话总结

工具决定了 agent 能碰什么，权限决定了它敢碰什么。**deny-first 保证危险操作优先被挡，hook 保证关键流程零例外执行，沙箱保证即便漏了也不炸宿主**。这三层加起来，才是「放手让 agent 干活」却不会「失控」的真正原因。

## 参考资料

- Anthropic. *How Claude Code works*. https://docs.anthropic.com/en/docs/claude-code/how-claude-code-works
- Anthropic. *Sub-agents*. https://code.claude.com/docs/en/sub-agents
- Anonymous. *Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems*. arXiv:2604.14228
- Community. *Claude Code: Behind-the-scenes of the master agent loop*. https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/

