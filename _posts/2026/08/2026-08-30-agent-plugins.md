---
title: "Agent 插件打包标准：一次构建多端跑"
author: 唐悦玮
date: 2026-08-30 09:50:00 +0800
categories: [AI编程, 行业趋势]
tags: [AI编程, Agent, 插件, 标准, MCP]
pin: false
comments: true
keyword: AI编程, Agent, Agent Plugins, 插件标准, MCP, 可移植, 企业治理
---

> **摘要**：GitHub 8 月 12 日让 Agent Plugins 1.0 全量上线：把 skill 和 MCP 打包成一份插件，终端、IDE、桌面端一次构建到处装。这是六家厂商的开放标准，本文讲清它的结构、治理和信任缺口。

给同一个 AI 能力做打包，做四遍，是什么体验？

![一次构建多端跑：以前 vs 现在](/imgs/202608/2026-08-30-agent-plugins-infographic.png)

*图：以前一份能力要打四份包装，改一处四处改；现在一个包分发到四端，一次构建到处装。*

你维护一个部署工具集：一段"上线前要检查哪些项、回滚条件是什么"的流程说明，配一个能真去调部署接口的工具。逻辑只有一份，可你想让它在 VS Code、命令行、桌面应用里都能被 Agent 用上，就得按每种客户端的格式各写一遍清单、各摆一套目录。改一次流程，四个地方同步改。漏一个，某端就还跑着旧规则。

8 月 12 日，GitHub 宣布 Agent Plugins 1.0 全量上线，解决的就是这个"打包打四遍"的问题[1](https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/)。这篇文章讲它是什么、为什么值得注意、以及它刻意没做的事。

## Agent 插件是什么

一句话：Agent Plugins 1.0 是一套**打包格式**，把 skill（操作手册）和 MCP server（工具通道）装进一个目录，任何兼容的 Agent 客户端都能安装使用。

一份插件长这样：

```
company-deploy/
├── plugin.json
├── skills/
│   └── deploy/
│       └── SKILL.md
├── mcp.json
└── com.github.copilot/
    └── commands/
```

`plugin.json` 是清单，必需，四个字段就够：

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "company-deploy",
  "description": "部署工具集",
  "version": "1.0.0"
}
```

清单只有四个字段，不是偷懒，是刻意。字段越多，各家分歧越大，六家就越难坐到一张桌子上。1.0 把"可移植的最小公分母"定在刚好能装能发现的程度，其余全部留给平台自己发挥。规范里还定义了两个运行时占位符：`PLUGIN_ROOT` 指向插件安装目录，`PLUGIN_DATA` 指向插件的数据目录，客户端加载时展开——这是插件包在运行时能定位自己资源的唯一约定。

`skills/` 下每个子目录放一份 SKILL.md，遵循 Agent Skills 规范；`mcp.json` 声明要挂的 MCP server，可选。最后那个 `com.github.copilot/` 是供应商保留区——放只有某家客户端才认的东西（自定义命令、规则、钩子），其他客户端看到这个命名空间直接跳过。

这个目录布局是整个标准最巧的地方。它没有抹掉各家差异，而是给差异划了个隔离区：公共部分（skill + MCP）标准化，私有部分按厂商命名空间存放。客户端可以不实现某个命名空间，仍然算合规。标准化的便携核心只有两类组件，其余的留给各家自己长。

如果你维护过旧版 Copilot 插件，迁移基本是改清单的活：加上 `$schema`、把 skill 归到 `skills/`、MCP 配置挪到根 `mcp.json`、Copilot 专属文件移进 `com.github.copilot/`。旧插件继续能用，没有强制迁移期限。

## 为什么不是 GitHub 一家的事

一个格式能立住，关键看谁在推。Agent Plugins 1.0 不是 GitHub 单方面定的：8 月 6 日发布时就有 AWS、Anysphere、Microsoft、OpenAI、Vercel 五家参与，Google 同日加入核心维护，治理上设了独立的技术宪章和多方指导委员会[2](https://agent-plugins.org/specification)。GitHub 的 GA 是把它从规范变成可用的分发设施。

它和 MCP 的关系，值得单独说清。MCP 定的是"Agent 和工具怎么通信"，Agent Plugins 定的是"这些工具连同说明怎么打包、分发、安装"。一个是协议，一个是容器，不冲突，是叠着用的两层。你可以这么记：

- skill 定义流程和知识（什么时候能部署、哪些检查必须过）
- MCP 提供工具通道（调部署接口、查状态）
- plugin 负责把前两者打包成一份可分发单元

放到工程史上，这有点像 npm 出现之前的前端：组件逻辑是同一份，但每个项目用各自的拷贝、各自的打包方式，版本飘得到处都是。Agent Plugins 要做的，就是给 Agent 能力一个"认得出来的分发单元"。以前一个能力想覆盖多个客户端，得维护多份 manifest 和多套目录；现在一份包，客户端各自发现里面支持的部分。

为什么非要把 skill 和 MCP 绑在一个包里？因为只有工具，Agent 不知道什么时候该用它。部署 MCP server 暴露的是 `deploy()`、`rollback()`、`get_status()` 这些动作，但"上线前必须跑迁移 review""哪些环境要人工审批""回滚条件是什么"——这些规则工具描述里装不下，得靠 skill 写清楚。工具给动作，skill 给规则，plugin 把两者打包，缺一不可。单独发一个 MCP server 给 Agent，它知道能干什么，不知道什么时候该干。

时间线也能看出它不是拍脑袋：规范仓库 4 月就公开，1.0.0 版本 7 月底发布，OpenAI 的 Codex CLI 7 月 29 日就接入了支持，8 月 6 日多厂商联合公告，8 月 12 日 GitHub 四端 GA。从定稿到落地，节奏很快。

## 企业和团队各自拿到什么

对个人开发者，收益是少写几份清单。对团队和公司，收益更大，也更实际。

先说治理。插件要跨工具流通，企业就得有统一的口径管"哪些插件能装、从哪装"。Copilot Business 和 Enterprise 的管理员用现有的 `managed-settings.json`，三个键：`enabledPlugins` 控制自动安装或拉黑某个插件，`extraKnownMarketplaces` 允许加额外市场源，`strictKnownMarketplaces` 直接锁死只装受管市场里的插件。

第三个键值得单独说。市场默认启用是便利，但对安全团队来说，没有锁源的能力就等于把"插件代码从哪来"的决定权让给了每个人。`strictKnownMarketplaces` 把组织的管控点放在了"从哪装"这一步，早于"装哪个"，顺序是对的。插件可以携带 MCP server 配置，所以还要和 MCP 的 allowlist 配套用——按 URL、命令或名字审批或拉黑单个 server。

另一个落地场景是 CI/CD。skill 是文件，mcp.json 也是文件，都在同一个包里。你的构建可以生成它、签名它、打版本；reviewer 可以在 PR 里 diff 它。以前一个能力三个端口，团队往往只更新自己最常用的那个，另外两个慢慢漂移。现在一个产物、一次发布，CLI 和桌面端自动跟上——尤其当插件连的是生产 MCP server 时，你不会想要三份各说各话的工具契约散落在野。

对刚起步的团队，价值是顺势：按规范从第一天开始打包，市场发现、安装体验都白拿，不用自己造分发基础设施。

还有个容易被忽略的点：这个标准给"公司内部工具"留了位置。企业完全可以搭自己的插件市场，把部署、审查、安全规范这些内部能力打包成插件，只对自己的 Agent 开放。来源单一、可审计，比面向所有人的公共市场干净得多。规范的价值不只在于"跨厂商"，也在于"跨团队"——同一个包格式，内部也能少维护几套。

最后是向后兼容。存量 Copilot 插件不迁也能继续用，没有强制迁移的 flag-day。规范文档也明确说，客户端可以忽略不支持的组件或命名空间，依然算合规。这套"旧的不坏、新的可试"的策略，是它能全量上线的底气。

![企业怎么管 Agent 插件：受管市场 → 审批 → 安装 → MCP 白名单](/imgs/202608/2026-08-30-agent-plugins-infographic-2.png)

*图：企业管 Agent 插件的四步流程——先锁源（受管市场），再审单（enabledPlugins），再分发（开发者安装），最后配合 MCP 白名单。装前看一眼包里有什么，是基本动作。*

## 别急着把市场当信任

前面讲的都是收益，这一节说代价，或者说，标准刻意留给你的功课。

第一，规范的成熟度。spec 页面自己标着 Working Draft——虽然仓库把它列为当前发布版，但它不是被某个标准组织冻结的终稿，还在演化中。把它当"可用"没问题，把它当"永久承诺"是另一回事。

第二，1.0 明确不做的事。它没有中央注册表、没有签名验证、没有权限控制、没有沙箱、也没有发布者身份校验。这些全部列在路线图里当未来工作。为什么不做？因为做了就谈不拢——签名、权限这些恰恰是各家最有分歧的地方，先砍掉才能让六家坐下来。代价是：**装插件现在的信任级别，约等于装一个第三方依赖，你得自己审计**。

第三，市场默认启用带来的攻击面。Awesome Copilot 市场在 VS Code、CLI、App 里默认开启，安装门槛低了，投毒的回报也高了。这跟浏览器插件商店、npm 仓库面对的是同一类供应链问题，只是刚起步，防护工具还不成熟。企业至少该把 `strictKnownMarketplaces` 打开，个人则要习惯"装前看一眼包里有什么"。

第四，兼容目录是自报的。官方列出的客户端清单，是各家自己声明"我支持"，不是跑过公开一致性测试套件的结果。目录在变，真实性要靠使用验证。一个标准成不成，最后看有多少客户端真的实现了它、多少人真的在用——这一步没有捷径。GitHub 一家 GA 只是起点，别的客户端跟进到什么程度、实现是否一致，才是接下来半年要盯的。

所以对 Agent Plugins 1.0，合适的姿态是：作为打包格式值得跟进，作为信任基础设施还早。把安装当依赖管理来对待，审计、锁定来源、最小权限，跟你在 npm 里做的事一样。市场默认开启不等于默认可信，这个边界得自己划。标准解决的是分发问题，不是决策问题——装哪个、信哪个，永远是人的事。

## 收尾

上一篇文章写 skill、agent、mcp、workflow 四层各管一段，最后说"工具是手段，你的真实工作流才是主角"。Agent Plugins 在这四层下面又垫了一层：**怎么发**。skill 和 mcp 你搭好了，plugin 负责把它们干净地送到每个客户端手里。那一篇里的概念分层，现在多了一条：skill 给规则，mcp 给通道，plugin 给包装——四层之外，多了一个负责运输的第五层。

工具链正在长出分发层，这是值得跟进的变化。但记住，它解决的只是"包装和运输"，代码还是那堆代码，信任还得自己管。装什么、信什么、给多大权限——这些问题，一个打包格式替代不了你。标准把分发变简单了，也把"你装了谁的包"这件事，从没人关心变成了天天要问。这一问，就是它带给每个团队的第一份作业。

**参考资料**

- GitHub Blog：Agent Plugins 1.0 in VS Code, Copilot CLI, and the Copilot app（2026-08-12）：https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/
- Agent Plugins 1.0 规范（agent-plugins.org）：https://agent-plugins.org/specification
- 规范仓库：https://github.com/agentplugins/agent-plugins-spec
- Agent Plugins 示例与迁移指南：https://github.com/agentplugins/agent-plugins-example
