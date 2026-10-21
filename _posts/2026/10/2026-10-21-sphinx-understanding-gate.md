---
title: AI 写的代码，push 前先对它进行考试
author: 唐悦玮
date: 2026-10-21 08:50:00 +0800
categories: [AI编程, 工程实践]
tags: [Sphinx, AI编程, Code Review, 理解门禁, Git Hook, Agent工程, 工程实践]
pin: false
comments: true
image:
  src: /imgs/202610/2026-10-21-sphinx-understanding-gate.png
keyword: Sphinx, 理解门禁, AI代码审查, git hook, Claude Code, Agent工程, 代码理解
---

> **摘要**：开源工具 Sphinx 在保护分支的 push 前设了道考试：由没见过你对话的审查模型读 diff 出题，答对才放行，绕过会留日志。本文拆它的机制、三个设计细节、HN 两派争论，和你该不该装。

你让 Claude Code 给 webhook 处理器补了个幂等逻辑，测试全绿，push。终端突然停住，弹出个问题：「你的代码先存事件 ID 再调 charge()。Stripe 超时后重发同一事件，重试时会发生什么？」

答「会扣两次款」。它回「不对——重试找到已存的 ID，直接返回 200。但 ID 是在扣款成功前存的。如果 charge() 失败，下一次重试呢？」

这就是 Sphinx，10 月 18 日上 Show HN 的开源 git hook。npm 装好、挂在保护分支上，以后每次 push——不管是你敲的还是 Agent 敲的——它都先拦下来考你一道，答对才放行。

## 它考什么，怎么考

先说出题人。Sphinx 的审查模型**没见过你和 Agent 的对话**，只通过只读 git 工具看提交的 diff 和相关代码。这个隔离很关键：你没法拿聊天记录里的解释背题，它考的是代码本身。

再说什么叫答对。题目不考函数名、文件名这种名词题，专挑三类：这段代码的行为、出错时的失败模式、该保持的不变量——比如「一次成功的支付最终恰好产生一笔扣款，不会是零笔或两笔」。开卷，你可以翻代码、追调用、问你的 Agent。答错不拦到底，它给你讲错在哪，再换一个场景考同一个概念，直到你答到位，push 才继续。小改动一道题，大改动默认最多三道。那考过一次是不是就一劳永逸？不是。通过记录 24 小时有效，代码或目标分支一变就重考。

![push 前的考试：审查模型读 diff 出题，答对放行](/imgs/202610/2026-10-21-sphinx-understanding-gate-infographic-1.jpg)

## 三个设计细节，比工具本身有意思

最关键的隔离在答案的去向：你的答案永远不回传给编码 Agent。Agent 只知道检查状态和用量，不知道你答了什么。这一刀切断了「代理替人答题」的污染回路——至少切断了最直接的那条。

另一个把工具抬了半级的设计，是绕过留痕。`sphinx yolo` 能跳过考试直接推，但**每一次跳过都落日志**。留了记录的绕过，不再是隐形的漂移，而是一条能审计的决策痕迹。着急的时候你仍然可以走捷径，但捷径会留名。

还有一处容易被忽略：策略跟着仓库走。`sphinx init` 生成三个文件——`.sphinxconfig` 管哪些分支要考、`.sphinxignore` 管审查模型永远不许读的路径、`.sphinxcontext.md` 给模型一段项目说明。三个文件提交进仓库，团队所有人共用同一套规则，不会各配各的。一个坑要记住：`.env` 和密钥文件默认不读，但粘贴进普通源文件的密钥照样会被读走，敏感路径要在第一次检查前手动补进 ignore 清单。

![三个值得抄的设计：答案隔离、绕过留痕、策略随仓库走](/imgs/202610/2026-10-21-sphinx-understanding-gate-infographic-2.jpg)

## HN 把正反方吵完了

发布当天，讨论区两边都到齐了。赞的一方说它「让节奏慢下来，实现又快」；有做过类似工具的开发者对题目质量表示惊喜；最有分量的一句是行业老本能的回归——**永远不要复制你没看懂的 Stack Overflow 代码**，Sphinx 只是把这条老规矩装进了 git hook。

批的一方也不客气：考试可以被绕过——把题目粘回给 Agent 就行；它抓不住 diff 层面的缺陷，一个遗留的调试打印、一个被削弱的断言，都能通过任何理解力测验；还有人预言「确认疲劳」——考久了，人就开始无脑过关。

两边都对，而且不冲突。Sphinx 的官方文档自己就承认：这是练习，不是安全门。有本地权限的人本来就能绕过任何 hook，考官是个语言模型，也会看错代码。它的真实作用是拖住那八成偷懒但并无恶意的人，让「我没细看就推了」从无感操作变成一次有摩擦的显性决定。

## 官方自己划的边界

代价都写在 README 里，不用你自己踩。版本 0.1 只管本地 commit 和 push，不管网页合并、CI 门禁和部署；push 等待上限 25 分钟，编码 Agent 的 shell 可能比 git 先超时。成本要花多少？一次典型检查约 5 到 8 次模型请求，答题过程还会追加，默认没有调用上限——接付费模型的话，记得自己配消费限额，Sphinx 支持按检查设置最大调用数。

还有一个隐性成本别忽略：考试是开卷的，认真作答就要真读代码。如果你团队现在的现状是「review 时没人真读」，那这道闸每 push 一次就把欠的账收一次——疼，但收的本来就是该还的。此前写过让代码库自己「长成 Agent 能读的样子」，Sphinx 补的是另一头：代码写得再可读，也得有人读得进去。

## 该不该装

那什么样的仓库值得装？判断标准就三条，占两条就值得试：你们的工作流里 Agent 写码占比高；有需要保护的主干分支；你担心过「合并进主干的代码没人说得清为什么这么写」。反过来说，纯个人玩具项目、push 频率极低的仓库，装它纯属自找麻烦——摩擦是要付时间的。

装的时候两步不能省：先把敏感路径补进 `.sphinxignore` 再跑第一次检查；给付费模型配调用上限。至于「Agent 替我答题」这种钻空子，工具防不住全部——但日志会记住 yolo 的每一次跳过，团队里谁在裸奔，一目了然。

## 结论和代价

这件事的结论是：Sphinx 把「理解」从一句口号变成了 push 前的一道显性闸门，设计上最值得抄的三处是审查隔离、留痕绕过、策略随仓库走。代价是每次 push 多几分钟、每检查约 5 到 8 次请求的模型开销，以及它自己承认的定位——练习，不是安全门。真门禁还得靠测试、静态扫描和你自己的判断力，这道考试只是别让判断力睡着。

## 参考资料

- [Sphinx — a hook that quizzes you on your AI's code before shipping（Show HN）](https://zerohour.day/item/d3c35db34ec3acb331d474191fe72e5ca99effdf)：官方交互示例（Stripe 幂等考题）、安装流程、yolo 留痕设计。
- [Sphinx Adds a Comprehension Check to AI Coding（HitReader）](https://hitreader.com/post/sphinx-adds-a-comprehension-check-before-ai-assisted-code-ships)：审查模型只读 diff、不变量题型、`.sphinxconfig/.sphinxignore/.sphinxcontext.md` 三文件、25 分钟等待上限、5–8 次请求成本、README 自认「练习非安全门」。
- [Show HN: Sphinx — Web Pulse](https://wpnews.pro/news/show-hn-sphinx-a-hook-that-quizzes-you-on-your-ai-s-code-before-shipping)：npm `sphinx-understand` 安装、支持 Codex/Claude Code/Cursor/OpenCode/Pi、答案不回传。
- [一个 Git 钩子拦住你的推送](https://www.163.com/dy/article/L9IKVKTM05561FZK_pdya11y.html)：HN 正反方观点全谱、「Level 1 控制」分析框架、绕过留痕的意义。
- [Sphinx: A Git Hook That Quizzes You on Agent-Written Code（AI/TLDR）](https://ai-tldr.dev/tools/sphinx)：题目数量随改动规模伸缩、通过 24 小时有效、MCP 接入 Claude Code、sphinx doctor 校验。

