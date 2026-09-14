---
title: "你的模型下个月就退役了"
author: 唐悦玮
date: 2026-09-12 09:43:00 +0800
categories: [AI编程, 工程实践]
tags: [模型退役, 模型治理, GitHub Copilot, 阿里云百炼, 模型迁移]
pin: false
comments: true
keyword: 模型退役, 模型下线, GitHub Copilot 模型退役, 阿里云百炼 10月10日下线, 模型迁移, AI 模型清单, 模型生命周期管理
---

> **摘要**：GitHub Copilot 六周内退役 11 个模型，阿里云百炼把百余个模型统一压到 10 月 10 日下线。这批退役的模型一点都不老。本文拆解退役通知里藏着的三个机制，以及企业真正缺的那张表——模型清单与它的负责人。

某天上午你收到一条短信。

不是催缴，不是营销。是云厂商发来的模型下线通知：你正在调用的模型，将于 10 月 10 日零点停止服务，请务必在此之前完成迁移。措辞客气，落款理由是"为保障您线上业务的稳定性"。

同一个 10 月，另一批人经历的是另一种通知方式——没有短信。他们打开 Copilot 的模型下拉框，发现那个钉了半年的名字不见了。

两件事没有因果关系，但指向同一个事实：模型的寿命，正在比你对它的依赖更短。

## 一、10 月挤了两批

先把日期摊开。

GitHub 这边，六周内发了三波退役通知。9 月 1 日，六个模型在 Copilot 全线下线：Gemini 3.1 Pro、Claude Opus 4.5、Claude Opus 4.6、Claude Sonnet 4.5、Claude Sonnet 4.6，外加一个 Raptor Mini。9 月 10 日，MAI-Code-1-Flash 到点。10 月 2 日，又是四个：Gemini 3.5 Flash、Gemini 3.6 Flash、Kimi K2.7 Code、Claude Opus 4.7。

三波加起来十一个模型，覆盖 Copilot Chat、行内编辑、ask 和 agent 模式，还有代码补全——[公告原文](https://github.blog/changelog/2026-09-03-upcoming-deprecation-of-selected-github-copilot-models/)写得很直白，范围是"all GitHub Copilot experiences"。

阿里云百炼那边是另一副样子。10 月 10 日零点，一张表上的模型同时停服。名单长到要分类：语音快照、Qwen 主线、Qwen3 主线、部分三方模型、其他老旧模型，加起来一百多个。里面既有 Qwen 自家系列，也有 DeepSeek v3/v3.1/v3.2、GLM-4.6/4.7、Kimi K2 Instruct、MiniMax-M2.1 这些托管的三方模型。

对调用方来说，这个区别不重要。它们在同一张表上，同一个日期。

真正值得留意的是两件事。

**这批模型不老。** Kimi K2.7 Code 是 7 月才进 Copilot 的，Gemini 3.6 Flash 是 8 月才上线的。9 月 1 日那批更讽刺：Claude Opus 4.7 当时还在官方给的替代选项里，有人 9 月 1 日刚从 4.6 迁过去，一个月后 4.7 自己上了 10 月 2 日的名单。

**百炼那批是延期来的。** 原本计划 7 月、9 月下线的模型，被统一挪到了 10 月 10 日。官方给的说明是"协调模型下线与用户迁移节奏"（[延期公告](https://www.aliyun.com/notice/detail?notice-id=118420)）。

两个平台把大动作堆在同一个月，是巧合。但巧合背后是同一件事：下线日期由供应商的资源规划决定，不由你的项目排期决定。百炼能把日期往后挪，恰恰说明这个日期是供应商可以单方面调整的——今天能延，明天也能提前。

![模型退役日历：9月1日6款 → 9月10日1款 → 10月2日4款 → 10月10日100+款，同一个月塞了四批](/imgs/202609/2026-09-12-model-retirement-migration-infographic-1.jpg)

## 二、通知里藏着的三个机制

退役公告读起来像例行公事。真正会让你出事的东西，藏在三处。

### 替代模型不会自己出现

GitHub 的公告里有句话：Copilot Enterprise 和 Business 的管理员，"可能需要通过 Copilot 设置里的模型策略来启用替代模型"。

翻译成人话：10 月 2 日，你组织里固定用 Opus 4.7 的人会失去它。而 Opus 5 不会自动顶上——除非管理员提前在策略里开了它。

Kimi K3 更典型。它已经 GA，但在企业策略里默认禁用。想用，得管理员手动开。

百炼那边换了个形态，本质一样。公告给了推荐替换，指向 qwen3.6 / qwen3.7 系列。但同一份公告里还有一句：考虑到平台会持续发布新模型，推荐替换指引"将不再随新模型上线而频繁更新"。

官方给的替换清单，本身也会过期。

### 最坏的结果是静默失败

如果你的代码里硬编码了模型 ID——Copilot Extension、GitHub Action、内部工具里写了 `model: claude-opus-4-7`——cutover 之后有两种结局。

一种是报错，你当天就知道。

另一种是不报错。workflow 照常跑，日志干净，只是 AI 那一步没了。它比报错难查得多，因为你得先意识到"这里本来应该有 AI"。

反过来说，没在代码里写死具体模型 ID 的人相对安全——就算默认模型换了，配置层迁移的成本比硬编码小得多。

### 迁移的账不只是改个字符串

把价格摆出来看。

Kimi K2.7 Code 的定价是每百万 token 输入 0.95 美元、输出 4 美元。接替它的 K3 是输入 3 美元、输出 15 美元——按输入输出比例不同，涨三到四倍。

Gemini 3.8 Flash 在 2026 年 12 月 31 日前走促销价，每百万 token 输入 0.75、输出 3.75 美元；2027 年 1 月 1 日恢复原价，翻一倍。

迁移本身就把价格往上推一层。顺带说一下同一个 10 月的另外两个变化：Copilot Business 的座位额度从每月 3000 降到 1900，Enterprise 从 7000 降到 3900，座位价格不变；9 月 28 日，代码审查的默认档位从 Lite 改成 Balanced，私有仓库还要多烧 Actions 分钟数——这些不是模型迁移引起的，但撞在同一个月，账单里会一起出现。

这些是公告里的数字，实际账单取决于你的用量结构。方向是明确的：迁移之后，单位成本普遍往上走。

![退役通知三个坑：替代不会自动出现 / 最坏是静默失败 / 迁移的账不只是改字符串](/imgs/202609/2026-09-12-model-retirement-migration-infographic-2.jpg)

## 三、真正缺的是一张表

技术上的事到这里其实都说完了：查模型 ID、开策略、改配置、跑回归。都不难。

难的是没有人负责。

一家做企业 AI 落地的团队[复盘过这类事故](https://www.ud.com.hk/en/blogs/insight/article/model-deprecation-enterprise-risk-2026-07-31)，总结了五种反复出现的翻车模式，值得逐条对号：

- **未固定的默认。** 团队从来没指定过模型版本，供应商静默升级改了行为，几周之内没人把线上异常和模型变更联系起来。
- **孤儿试点。** 一个 POC 跑得很成功，交接给运维时没留下"它用了哪个模型"的记录。退役邮件到了，没人说得清影响范围。
- **合规冻结撞车。** 退役日期正好落在年结变更冻结期里，要么走紧急例外，要么直接断服。
- **基线蒸发。** 准确率只在一次评审会上演示过，从没编码成测试集。于是没法向风险委员会证明迁移是安全的。
- **单一供应商悬崖。** 所有 AI 工作流都用同一家，一次退役周期同时命中全部。

这五条的共同根因只有一句：模型被当成了一个永久的技术事实，而不是一份有日期、有负责人、有复核节点的供应商承诺。

## 四、一页纸，四周

把这五条反着做，就是解法。核心产出不是平台，是一页纸。

**第 1 周：清点。** 找出所有生产环境的 AI 调用点，记录每个点位的精确模型版本串。不是"我们用了 Claude"，是 `claude-opus-4-7` 这一级的字符串。

**第 2 周：对表。** 拿这些版本串去对官方退役页，标出 180 天内到期的。

**第 3 周：认人。** 每个调用点指定一个有名字的负责人，并确认它有没有打分评测集。找不到负责人的，直接标记为"待退役审查"。

**第 4 周：加条款。** 把提前通知期、替代模型可用性、价格变更上限这类条款写进下一次供应商续约。

产出就一页：**调用点、负责人、到期日、评测状态**。

![一页纸四周：第1周清点 → 第2周对表 → 第3周认人 → 第4周加条款；底部一页纸标着调用点/负责人/到期日/评测状态](/imgs/202609/2026-09-12-model-retirement-migration-infographic-3.jpg)

在 Java 项目里，这张表可以落成两个东西。一是配置——模型名不写死在业务代码：

```java
@ConfigurationProperties(prefix = "ai.model")
public record ModelConfig(String chat, String coder, LocalDate retireDate) {}
```

二是启动检查——让"快到期了"这件事在系统启动时就喊出来，而不是等调用超时：

```java
if (modelConfig.retireDate().isBefore(LocalDate.now().plusDays(30))) {
    log.warn("模型 {} 将于 {} 退役，请安排迁移", modelConfig.chat(), modelConfig.retireDate());
}
```

每接一个模型，顺手把它的下线日期填进配置。这个启动检查就成了一份活的清单。非 Java 栈思路一样：把模型名与下线日期从业务代码里抽出来，走配置中心，启动时校验。

## 五、总结

模型退役这件事，正在从技术事件变成日历事件。

供应商那边，日期是固定的，公告发出来就是通知而不是商量；它唯一会变的方向是往后挪一点，给你留出迁移窗口——百炼那批就是这么来的。你这边能控制的只有一个变量：准备程度。而这个准备程度，是在退役通知到达之前建好的。

回到开头那条短信。它写得没错——你确实该在 10 月 10 日前完成迁移。

它不会告诉你的是：那张一页纸，本该在通知到达之前就存在。

## 参考资料

1. [Upcoming deprecation of selected GitHub Copilot models](https://github.blog/changelog/2026-09-03-upcoming-deprecation-of-selected-github-copilot-models/) — GitHub Changelog，2026-09-03
2. [Upcoming August 2026 model deprecations in GitHub Copilot](https://github.blog/changelog/2026-07-31-upcoming-august-2026-model-deprecations-in-github-copilot) — GitHub Changelog，2026-07-31
3. [【大模型服务平台百炼】部分老旧模型延期下线通知](https://www.aliyun.com/notice/detail?notice-id=118420) — 阿里云公告
4. [【大模型服务平台百炼】部分历史主线模型下线通知](https://www.aliyun.com/notice/118177) — 阿里云公告，2026-04-13
5. [模型下线机制说明](https://help.aliyun.com/document_detail/2841465.html) — 阿里云帮助中心
6. [What Is Model Deprecation? The AI Vendor Risk Enterprise Leaders Underestimate](https://www.ud.com.hk/en/blogs/insight/article/model-deprecation-enterprise-risk-2026-07-31) — UD，2026-07-31
7. [AI models maintenance policy](https://docs.databricks.com/en/machine-learning/retired-models-policy.html) — Databricks 官方文档

