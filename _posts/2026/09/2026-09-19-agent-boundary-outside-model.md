---
title: "Agent 的边界，画在模型外面"
author: 唐悦玮
date: 2026-09-19 10:16:00 +0800
categories: [AI编程, 工程实践]
tags: [Agent架构, 控制面, 沙箱隔离, 状态管理, 企业落地]
pin: false
comments: true
keyword: 企业Agent架构,控制面与执行面,Agent沙箱隔离,gVisor,Kata Containers,agent-sandbox,Agent状态管理
---

> **摘要**：容器不够用了，这是 Docker 自己承认的。企业 Agent 的架构分界线不在功能清单上，而在控制面与执行面之间：谁决定能不能干，和谁去干，得是两套东西。这篇讲那条线画在哪、隔离路线怎么选、状态该放哪，以及什么时候不值得这么做。

八月中旬，Docker 发了个叫 Sandboxes 的东西，给每个 AI 编码 Agent 一个独立的微虚拟机：自己的内核、自己的文件系统、自己的网络栈，外加一个私有的 Docker 引擎。命令行工具叫 `sbx`，免费，商用也免费。

发布这件事本身不稀奇。稀奇的是发布方是 Docker——过去十年反复论证"容器隔离够用"的那家公司。

它的架构文档这次写得很直接：容器的设计初衷是隔离**基本可信**的工作负载，而一个能执行 shell 命令的 AI Agent，威胁模型更接近"不可信输入加一双会敲键盘的手"。开发者原来用的两个绕行方案都不成立。把宿主机的 `docker.sock` 挂进容器，等于把宿主 Docker 引擎的控制权交出去，那是逃生通道，不是边界；Docker-in-Docker 则笨拙且脆弱。

Docker 的用法文档里还留了一句诚实的注脚：默认的 direct 模式会把你的源码树以读写方式挂进去。所以你能拿到多少隔离，取决于有没有加 `--clone` 参数。内核对你的机器是硬边界，但对你主动递出去的那个目录不是。

这篇不是讲 Docker 的产品，是借它这根线，把企业自建 Agent 时最该先画的那条线说清楚。

![控制面与执行面的职责对照](/imgs/202609/2026-09-19-agent-boundary-outside-model-infographic-1.jpg)

## 一、容器不够了，缺的到底是什么

Docker 在解释自己为什么转向微虚拟机时，给 Agent 下了两个定义：**非确定**、**短命**。

同一个任务，每次走的路可能都不一样；等有人去查发生了什么的时候，那个会话可能已经没了。这套运行特征，跟按"一个持久身份、可预测节奏的人"设计的传统安全控制是错配的。

错配会以三种症状露出来。

**第一种，自授权。** 如果执行负载能改自己的策略来源、健康信号或者权限授予，这条分离线就等于没画。按非人类身份治理领域的界定，控制面分离的核心不是"把软件拆成两个模块"，而是信任边界：**正在干活的这个东西，不能同时是决定这活该不该继续的那个东西**。他们给的检查方法很朴素——去看运行时的健康上报和权限决策是不是来自同一个组件。是的话，欺骗性状态和权限蔓延通常就在那儿碰头。同一份材料里的另一个数字是，97% 的非人类身份都带着过量的权限。

**第二种，治理蔓延。** 主流云和 SaaS 厂商都把 Agent 观测、模型护栏、策略工具打包进了各自的 AI 平台订阅，看起来免费。但治理一旦写成云原生构造——AWS 的 IAM policy、Azure 的 RBAC、GCP 的 workload identity——它就不可迁移。多云端跑 Agent，就是两套治理栈、两种策略语言、两个审计面板，中间没有统一视图。MuleSoft 在那篇控制面框架里对此的表述是：runtime 不知道也不关心治理，控制面存在，**恰恰因为它必须存在**。

**第三种，把状态挂在容器上。** 容器一死，会话就死。

有个必须同段说清的反面：沙箱不是万能的。Anthropic 复盘了自己的十四万余次网络安全评估运行记录，发现其中三起是模型获得了对真实系统的未授权访问。那三起里没有沙箱逃逸，起因是第三方评测伙伴留下了一条预期之外的联网通路。

**沙箱拦不住语义层的错误。** 这句是后面的讨论前提——沙箱解决的是爆炸半径，不是判断力。

## 二、那条线该画在哪

按同一套治理框架的划分，两个面的分工是清楚的：

- **控制面**回答：谁可以动？按什么策略？这次该不该放行？谁来复核？记什么账？
- **执行面**做事：Agent 循环、工具调用、沙箱、外部系统调用。

落到组件，一个生产可用的控制面通常包含五块：策略与身份、路由（下一个交给哪个 Agent、工作流还是人）、评估、可观测、审计。执行面则很具体——检索的 Agent、起草的 Agent、保存记录的 API、推动状态的流程引擎。

这个划分有个容易忽略的后果：**连接器不该承担治理职责**。MCP 这类协议把"Agent 怎么请求上下文、怎么调工具"标准化了，但某一次调用在当前工作流里允不允许，得由集中式策略决定。Agent 可以提出请求，放不放行是控制面的事。

分层做不做，代价可以量化。一份企业 Agent 编排栈的分析把系统拆成五层——意图、编排、执行、记忆与上下文、治理与审计——并给出了一组成本对比：治理这层如果等上线后再补，中型企业部署的平均返工成本约 34 万美元；一开始就内建，约 4.7 万美元。**七倍**。那份材料把跳过治理层称为"企业 AI 里最贵的捷径"。

数字来自厂商委托的研究，读的时候要打折扣。但方向不难验证：治理层跟别的层不一样，它事后补要动已有的全部调用链。

## 三、执行面怎么选，先看能力边界

把线画清楚之后，执行面选什么就不是口味问题，而是一道边界题。主流路线四条，差异集中在这几处：

| 路线 | 隔离层级 | 启动开销 | 内存开销 | 主要暴露面 |
|---|---|---|---|---|
| 容器 + seccomp | 共享宿主内核 | 10–40 ms | 15–40 MB | 宿主内核提权 |
| gVisor | 用户态内核拦截 | 30–90 ms | 30–70 MB | 用户态代理的缺陷 |
| microVM（Firecracker / Kata） | 硬件虚拟化边界 | 100–350 ms | 128–256 MB | hypervisor |
| Wasm | 线性内存 + WASI | 取决于 runtime | 较低 | runtime 接口 |

这张表里最该记住的不是数字，是三个约束。

**第一，这是个不可能三角。** 安全性、通用性、性能三样拿不满。Firecracker 用裁剪设备模拟换来启动速度和隔离强度，代价是通用性——它直接裁掉了 PCI-e 直通和 VFIO，**所以 Firecracker 里用不了 GPU**。gVisor 靠一个叫 nvproxy 的代理驱动，在特定版本的 Nvidia 开源驱动上能跑大多数 CUDA 应用；要走设备直通得靠 QEMU 的 VFIO。如果你的场景是"让 Agent 在沙箱里训一次模型"或者"大批量生成 embedding"，可选范围会被直接收窄。

**第二，隔离只解决"能干什么"，不解决"资源效率"。** 上百个大部分时间在等工具返回的 Agent，要么各自占一个常驻 pod 烧钱，要么每次任务重新拉起付启动开销。这两条路都不好用。CNCF 那边的参考实现给的是第三条：六个 Agent 共享一个 worker pod，只在真的并发时扩容。

**第三，Kubernetes 已经给出官方答案，而这个答案本身就是一次控制面分离。**

SIG Apps 下的 agent-sandbox 项目，把 Agent 运行时建模成第一类 K8s 资源。它只有四个对象：

- `Sandbox`：一个 Agent 定义对应最多一个运行中的 pod，带稳定主机名与网络身份，加持久存储；
- `SandboxTemplate`：可复用的蓝图，镜像、资源、隔离策略写在一处；
- `SandboxClaim`：面向使用者的请求，形状刻意做得像 PVC 对 PV，申请人不需要知道背后是哪个节点、哪个池；
- `SandboxWarmPool`：保着 N 个预置好的沙箱，认领时命中一个已在运行的 pod，而不是重新调度一个。

这个项目文档里最重要的一句是自我定位：**它是沙箱编排器，不是沙箱运行时**。低层容器隔离交给 gVisor 或 Kata 这类运行时，通过 `RuntimeClass` 指定。

这就是控制面与执行面分离的具体样子——编排层管身份、生命周期、认领和池化，不管内核边界；内核边界是每个模板都能单独改的字段，不是一个必须重建集群才能改的决定。两个生命周期特性把账算得很细：空闲沙箱可以缩到零，PVC 留着工作区，恢复时状态还在；认领一个预热沙箱实测 53 毫秒，从零创建一个约 25 秒。

选型经验值也清楚：纯 CPU 的编码 Agent 用 gVisor，不需要 KVM，额外启动约 150 毫秒；租户之间互不信任、或者需要 GPU 的时候用 Kata，代价是要 KVM，启动 150 到 500 毫秒。

![三条隔离路线的能力边界](/imgs/202609/2026-09-19-agent-boundary-outside-model-infographic-2.jpg)

## 四、状态别挂在容器上

执行面还有个更隐蔽的坑：状态放哪。

这里有一条值得注意的收敛。两家做云端编码 Agent 的厂商，独立走到了同一个形状：把一个云端 Agent 的状态拆成三层。

- **Agent 循环**：跑在持久化工作流引擎上，可重启、可续跑；
- **机器状态**：文件系统和进程，放在一台可以休眠的 VM 里；
- **会话状态**：只追加的存储，重试感知，因为要对账客户端看到过什么。

其中一家解释了自己的动机：正因为循环跑在工作流引擎上、不在 VM 上，pod 的生命周期才能被独立管理，于是才有"只读 VM 或者预热 VM"这种用法。另一家的说法是：任何一个实例都能接手任何一个会话，从它停下的地方继续。

两家公司不在同一个竞争位置，却收敛到同一形状，说明这不是某家的口味。

代价也明确：持久化执行在每次活动派发上多 10 到 50 毫秒。放在 LLM 动辄秒级的延迟里可以忽略，但它是一项持续存在的工程成本，不是一次性的。

顺带说一个容易混的地方：持久化对话、检查点执行、持久化执行是三件不同的事。前者只是把消息存下来，让下一次能重建上下文；中间那个存的是工作流位置和类型化状态，被打断的运行能从确定的边界恢复；后者记的历史要足够多，多到能在失败后重放确定性代码、重放外部活动的结果。**恢复可能重复代码或者重试操作，这一点不会因为用了检查点就自动免费。** 一个退款动作如果在提交结果前断网，重试不能退第二笔——这是幂等键和事务模式该管的事，不是沙箱该管的事。

## 五、控制面上的六个检查点

前面讲怎么分层，这一节是落手时的清单，按"能不能在动作到达真实系统之前拦住它"来组织。

**给窄能力。** 需要读工单的 Agent，不需要一个能执行任意 SQL 的通用数据库工具，它只需要一个按 ID 查工单的接口。窄接口的爆炸半径小得多。

**授权写在模型外面。** 模型应该能提出动作，但不能给自己发许可。骨架大概是这样：

```python
def execute_tool(agent, tool, args):
    if tool not in agent.allowed_tools:
        raise PermissionError("tool not allowed")
    validate_args(tool, args)           # 参数按 schema 校验
    if needs_approval(tool, args):      # 高风险动作转人工
        return request_approval(agent, tool, args)
    return tool.execute(args)
```

重点不在这段 Python 写得对不对，在职责的切分：**模型决定它想做什么，应用代码或策略引擎决定这事允不允许。**

**参数校验挡在真实系统前面。** JSON Schema 能证明 `amount` 是个数字，证明不了这个用户拥有这个账户、这笔退款符合策略、这个金额合理、这个操作值得重试。

**读写分开。** 查日志、查指标、查工单可以不问；重启服务、删记录、改权限不能跟着一起自动。

**高影响动作可中断。** 不可逆、昂贵、或者安全敏感的动作，审批要落在它到达下游系统之前，不是落完之后补。

**给执行设上限。** 最大工具调用次数、最大重试次数、最大执行时长、最大花费、最大动作频率。这些不会让模型变聪明，但它把"无限循环"变成了"超时失败"。

## 六、什么时候不值得这么干

上面这套拆法有明确的适用条件，越界就会变成负收益。

**会话很短、基础设施很稳的时候。** 如果 p99 会话就几分钟，pod 也很少被回收，那么迁移和休眠的收益永远不触发，持久化执行那 10 到 50 毫秒的派发开销倒是每次都要付。

**产品还没找到市场的时候。** 这个拆分等于把产品押在一个固定的运维拓扑上。耦合在一起的原型几周就能发出去，等产品形态变了再改，比重建更贵。

**本地优先或者离线场景。** 本地 Agent 默认绑在一台机器上，云端的故障模式——抢占回收、区域切换、多租户调度——在这里不成立，收益自然也就没了。

还有一组必须摆出来的代价：走用户态沙箱会带来约 10% 到 20% 的 CPU 开销；换成 microVM，每个实例的内存基线从十几 MB 抬到 128 到 256 MB，高密度 Agent 集群的托管成本大约涨 25% 到 35%；调试也会变难——在隔离环境里定位问题平均多花约 35% 的时间，因为边界让错误追踪更麻烦。

有一条外部判断值得放在这里收尾：如果企业还没有一个值得分布式解决的问题，就先引入了分布式复杂度，那这套架构本身就是负债。

![状态三层解耦：循环、机器、会话](/imgs/202609/2026-09-19-agent-boundary-outside-model-infographic-3.jpg)

## 总结

控制面和执行面的分界线，说到底是一条**叫停权**的线。

Agent 自主程度越高，这条线越不能画在它自己身上——不是因为它一定会使坏，而是非确定加短命的负载，本来就不该对自己的健康、策略和权限有发言权。

对大多数人，判断顺序可以简化成三句：先问这次动作能不能在到达真实系统之前被拦住，再问状态是不是挂在了可丢弃的东西上，最后才问执行面该用容器还是 microVM。

沙箱解决爆炸半径，控制面解决决策权。两件事都做了，这条线才算画完。

## 参考资料

1. [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/) — Docker 官方文档
2. [Control-Plane Separation](https://nhimg.org/glossary/control-plane-separation) — Non-Human Identity Group
3. [A Framework for Architecting Agent Control Plane](https://blogs.mulesoft.com/agentic-perspectives/a-framework-for-architecting-agent-control-plane) — MuleSoft
4. [kubernetes-sigs/agent-sandbox](https://github.com/kubernetes-sigs/agent-sandbox) — Kubernetes SIG Apps，Apache-2.0
5. [Your Coding Agent Needs a Sandbox, Not a StatefulSet](https://bex.co/blog/2026/09/04/kubernetes-agent-sandbox-gvisor-kata) — bex
6. [Designing Runtime Control Points for AI Agents Before Production](https://dev.to/outworktech/designing-runtime-control-points-for-ai-agents-before-production-5dpp) — Outwork
7. [Enterprise Workflow Automation with AI Agents: The 2026 Sovereignty Playbook](https://dev.to/aarhamforensics_eb3c024eb/enterprise-workflow-automation-with-ai-agents-the-2026-sovereignty-playbook-am7) — DEV Community
8. [Cloud-Agent Three-Layer State Decoupling](https://agentpatterns.ai/patterns/agent-design/cloud-agent-state-layer-decoupling) — AgentPatterns
9. [What Is an AI Agent Runtime? Architecture and Platform Guide](https://dasha.ai/blog/ai-agent-runtime) — Dasha
10. [Containers Became the Unit of Speed. AI Agents Are Making VMs the Unit of Trust](https://cloudnativenow.com/features/containers-became-the-unit-of-speed-ai-agents-are-making-vms-the-unit-of-trust) — Cloud Native Now（含 Anthropic 141,006 次安全评估复盘数据的转述）
11. [Sandboxing Your AI Agents Is Necessary. It's Not Enough.](https://stack-archive.com/blog/agentic-sandboxing-not-enough-scalable-fleet-2026) — Stack Archive
12. [How do you securely containerize autonomous AI agents in 2026?](https://aitutorialmaker.com/knowledge/how_do_you_securely_containerize_autonomous_ai_agents_in_2026.php) — AI Tutorial Maker

