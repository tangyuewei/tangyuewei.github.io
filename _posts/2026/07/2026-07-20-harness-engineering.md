---
title: "给 AI 套上缰绳：Harness Engineering 是什么"
author: 唐悦玮
date: 2026-07-20 20:03:00 +0800
categories: [AI编程, 工程实践]
tags: [Harness Engineering, AI编程, Spring Boot, AGENTS.md, 上下文工程]
pin: false
comments: true
keyword: Harness Engineering, 驾驭工程, AI编程, AGENTS.md, 上下文工程, Spring Boot
---

> **摘要**：换了更强的模型，AI 还是把活干砸——漏改文件、动无关代码、自作主张扩大范围。2026 年圈内新共识 Harness Engineering 说：问题不在模型聪不聪明，在它跑的环境。本文用一个 OpenAI 百万行真实案例，讲清"给 AI 套上缰绳"到底是改了什么，以及 Java 后端怎么用 AGENTS.md、verify 脚本、权限 hooks 落地。

"换了个更强的模型，AI 还是把活干砸了。"

这大概是今年上半年我听到最多的一句话。同事把更强的模型接进 IDE，本以为能早下班，结果 AI 改一个工单导出功能，漏改了三个文件、顺手把权限校验那段也动了一下、还自作主张把日志格式全换成英文。Code Review 的时候我才发现——模型变聪明了，干的活反而更离谱。

问题出在哪？不是模型不够聪明。是我们把一匹好马扔进没路的山里，还指望它自己跑到目的地。

2026 年圈里冒出个新词，叫 Harness Engineering，翻译过来就是"驾驭工程"。它的核心一句话：别老想着换更强的模型，先把模型跑的那套环境收拾好，给它套上缰绳。

## 从 Prompt 到 Harness：三次重心转移

回头看这两年，我们折腾 AI 编程的重心换了三回。

第一回叫 Prompt Engineering，研究"怎么把话说清楚"。第二回叫 Context Engineering，研究"让 AI 看什么"。这两件事都还在"跟模型对话"的层面。

第三回就是 Harness Engineering，重心从"对话"挪到了"环境"——AI 到底在什么系统里跑、能干啥不能干啥、干完怎么验证。

这个区别有多实在？两个数据就能说明。

LangChain 的团队没换底层模型，只把 Agent 的运行环境收拾了一遍：把文档补全、加了自动验证回路、加了执行追踪。结果在 Terminal Bench 2.0 上，排名从 30 冲到 5，得分从 52.8% 涨到 66.5%。

工程师 Can Boluk 更绝，他只改了一件事：让 AI 整块替换代码，而不是一行一行改。就这一个格式调整，Grok Code Fast 1 在 SWE-bench 上从 6.7% 飙到 68.3%。

模型一行没动，环境一换，效果天差地别。

所以有人给了个公式：Agent = Model + Harness。模型是 CPU，Harness 是操作系统。CPU 再快，没有操作系统调度，也跑不起来像样的程序。

## Harness 到底是什么

Harness Engineering 这个词，是 Mitchell Hashimoto 在今年 2 月初提的。他的定义很朴素：每次 Agent 犯一个错，你就把它工程化成一个约束，让它永远别再犯第二次。

OpenAI 后来出了份报告，讲了他们内部怎么用 Codex 干活。一个 3 人小队，从空仓库起步，5 个月没手写一行代码，靠 Codex 生成了大概 100 万行、提了 1500 个 PR，效率大概是人工的 10 到 12 倍。

但他们踩的坑，比成绩更有参考价值。四个坑，四个 harness 解法：

**坑一：代码库没有"共享理解"。** Agent 不知道这个项目约定在哪、该看哪个文档。他们的解法是把 AGENTS.md 压到 100 行以内，只当"地图"——指路，不堆细节，指向 docs/ 目录；而且用 linter 和 CI 校验这些链接是不是还有效。AGENTS.md 的官方格式可以参考 https://agents.md/ 。

**坑二：人类 QA 跟不上 AI 的产出速度。** 人测不过来。他们接了 Chrome DevTools Protocol，让 Agent 自己截图、自己读日志查询（LogQL/PromQL），并且定死一条规矩：服务启动响应低于 800 毫秒，才算这个任务真的做完了。

**坑三：架构漂移。** Agent 随手加一层、改依赖方向，时间长了代码结构散架。他们定了严格单向分层——Types → Config → Repo → Service → Runtime → UI，用自定义 linter 强制依赖只能往下走。

**坑四：静默技术债。** 有些坏味道不会立刻炸，但会慢慢烂。他们把核心架构原则直接写进仓库，后台定时用 Codex 扫一遍偏离，发现就自动提重构 PR。

你看，这四个解法没有一个是"换更好的模型"。全是在给 Agent 套缰绳。

反过来看，没有缰绳会怎样？今年就有一起真实事故：一个 AI Agent 在没有任何约束的情况下，改了 340 个文件、删掉 2.8 万行代码，还自己伪造了一份"三轮 AI 会诊"的合规报告。约束缺失的代价，就是这么直白。

## Java 后端怎么落地

说了半天概念，落到咱们 Java 后端，到底怎么干？先记一句十六字心法：

**需求先工件化，知识先显性化，执行先加护栏，评审与验证必须分离。**

拆开看仓库怎么组织。以企业工单系统为例：

```
AGENTS.md          # 地图：本地命令、架构约束、受保护目录
docs/              # 知识沉淀：领域模型、接口约定
.claude/           # permissions + hooks：拦危险操作
skills/            # Spring 分层审查、SQL 风险审查、代码评审
src/               # 业务代码
```

AGENTS.md 别写成说明书，100 行封顶，只告诉 AI 三件事：怎么构建、不能碰哪、架构长啥样。给你一段真实可用的例子（企业工单系统）：

```markdown
# 本仓库给 AI 助手看的地图

## 本地命令
- 构建：./mvnw -q clean compile
- 测试：./mvnw -q test
- 启动自检：./scripts/verify-local.sh

## 架构约束
- 严格分层：controller → service → repository，禁止跨层调用
- 所有数据库访问走 MyBatis-Plus，禁止在 service 里拼 SQL 字符串

## 受保护目录（AI 禁止修改）
- src/main/resources/application*.yml   # 含密钥与线上配置
- migrations/                           # 数据库变更脚本
```

光有地图不够，AI 得能自己验证干没干对。给它一个可执行脚本，比给它一百条 Checklist 都管用：

```bash
#!/usr/bin/env bash
./mvnw -q clean compile || exit 1
./mvnw -q test          || exit 1
curl -fsS http://localhost:8080/actuator/health >/dev/null || exit 1
echo "本地验证通过"
```

注意最后那行健康检查——这正是 OpenAI 那招的平替：AI 改完工单导出，得自己把服务跑起来、health 返回 200，才算完。

还有一道质量门禁：CI 里别只看构建 SUCCESS，要额外校验 `total_tests > 0`。不然 AI 把测试全删了，流水线还是绿的，那才叫恐怖。

再补一道硬约束，用权限直接拦住危险动作（`.claude/settings.json` 片段）：

```json
{
  "permissions": {
    "deny": [
      "Bash(git push:*)",
      "Write(src/main/resources/application*.yml)"
    ]
  }
}
```

最后，写代码的 Agent 和 Review 的 Agent 一定要分开。让同一个人又写又审，等于没审；让同一个 Agent 又写又审，也一样。评审必须独立。

## 现在就能动手的 4 件事

不用等大版本重构，马上就能做四件：

1. **写一份 100 行以内的 AGENTS.md**，把构建命令、架构红线、受保护目录写清楚。
2. **加一个 verify 脚本**，让 AI 改完能自己编译、自己测、自己起服务。
3. **用 hooks 或 permissions 拦住危险操作**——比如禁止 AI 直接改配置文件、禁止 push 到 main。
4. **把一次踩坑变成永久规则**：AI 又漏改了文件？别骂完就算，把它写进 AGENTS.md 或加条 linter。

给 Agent 套上缰绳，上升到操作系统那一层。模型会一直换，但套缰绳的手艺，才是咱们后端工程师真正值钱的东西。

**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。
