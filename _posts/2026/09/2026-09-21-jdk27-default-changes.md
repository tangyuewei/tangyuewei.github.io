---
title: "Java 27 不用改代码，但你得改启动参数"
author: 唐悦玮
date: 2026-09-21 08:38:00 +0800
categories: [技术实战, Java]
tags: [JDK27, G1, 紧凑对象头, JFR, Java升级]
pin: false
comments: true
keyword: JDK 27,Java 27 新特性,G1 默认垃圾回收器,紧凑对象头,JFR 数据脱敏,JVM 启动参数,Java 升级
---

> **摘要**：JDK 27 的九个 JEP 里，四个转正的都是默认值变更。升级后你可能一行代码不用改，但堆占用、GC 行为、JFR 录制内容都会变。这篇把三处默认值改动、一批被移除的启动参数和升级前的验证方法一次说清楚。

## 一版不给你新语法的版本

升级 JDK 这件事，多年来的肌肉记忆是：换个 JVM，编译通过，跑起来，收工。

JDK 27 打破了这个记忆。它在 9 月 15 日 GA，九个 JEP 里四个转正的，没有一个引入新语法——它们改的都是默认值。

G1 成为所有环境的默认垃圾回收器、紧凑对象头默认开启、JFR 默认对敏感数据脱敏、TLS 1.3 默认启用后量子混合密钥交换。你的代码可以一个字不动，但 JVM 在你没指定的那些参数上，已经替你做了不同的选择。

这是最容易被漏掉的一类改动。新语法不写就碰不到，默认值却是你以为自己没配、实际别人替你配好的东西。

![JDK 27 九个 JEP 全景](/imgs/202609/2026-09-21-jdk27-default-changes-infographic-1.jpg)

九个 JEP 分四类：HotSpot 三项（G1 默认、紧凑对象头、JFR 脱敏）、安全库两项（后量子 TLS、PEM 编码）、核心库三项（惰性常量、结构化并发、Vector API）、语言一项（原始类型模式匹配）。

除了 HotSpot 与安全库那四个转正的，其余五个仍在预览或孵化阶段，需要显式加 `--enable-preview` 才能用。

默认值这种东西有个特点：它不在你的配置文件里，不在 code review 里，也不在部署清单里。所以它变了，你不会收到通知。

## G1 全域默认：那个没人配过的参数

先讲一个事实：过去这些年，大量容器里的 Java 应用跑的是 Serial GC，而团队并不知道。

原因在 JDK 9。那一年 G1 成为默认 GC（JEP 248），但只对"服务器级"机器生效——大致是至少两个硬件线程、2GB 内存。在那条线以下，HotSpot 会静默切换到 Serial。

那条线的准确位置是：单 CPU，或者物理内存不到 1792MB。

所以一个 1 核 1.5G 的容器，`java -jar app.jar` 跑起来，实际用的是 Serial。没人显式指定过，监控面板上也看不出来——GC 名字不写在业务日志里，除非你专门去读。

JDK 27 把这条启发式规则删了，改由 [JEP 523](https://openjdk.org/jeps/523) 定下新规则：只要命令行没指定收集器，任何硬件、任何容器规格，默认都是 G1。

敢删是因为 G1 这些年确实被磨快了。JDK 26 的 JEP 522 减少同步开销之后，G1 的最大吞吐量已经接近 Serial；原生内存占用也降到了同一量级；最大延迟则一直是 G1 更好，因为它靠增量回收而非 Full GC 来回收老年代。

还有一个连带改动容易漏掉：G1 的 `-XX:MinHeapFreeRatio` 默认值从 40 变成 0，`-XX:MaxHeapFreeRatio` 从 70 变成 100。

这两个值组合起来，等于默认关掉了基于比例的堆伸缩——以前 Full GC 之后 JVM 可能做一次伸缩动作，对频繁调用 `System.gc()` 的应用来说这是纯粹的反效果。

于是真正的问题来了：你的服务会不会被换人？

Homann Software 在 9 月 16 日做了一组对照实测，用的是 Temurin 21 与 OpenJDK 27 两个发行版，同一台 Windows 机器，参数都是 `-XX:ActiveProcessorCount=1 -Xmx128m`：

| 配置 | Java 21 结果 | Java 27 结果 |
|---|---|---|
| 默认 | Serial / 123 MiB | **G1 / 128 MiB** |
| 显式 `-XX:+UseG1GC` | G1 / 128 MiB | G1 / 128 MiB |
| 显式 `-XX:+UseSerialGC` | Serial / 123 MiB | Serial / 127 MiB |

跨发行版、跨大版本，这是一份可复现的配置对照，不是隔离的性能实验。

![G1 换人的那条分界线](/imgs/202609/2026-09-21-jdk27-default-changes-infographic-2.jpg)

第三行是关键：**显式指定过的，JDK 27 一个都不动**。变的只是那些依赖默认值的部署。

也就是说，这条改动专挑"从来没写过 GC 参数"的服务下手。而这批服务的共同特征是——小规格容器，没人专门调过 JVM。

要不要改回去？先测。JEP 523 的非目标里明确写了不废弃也不移除任何收集器，`-XX:+UseSerialGC` 照样能用。批量任务、吞吐敏感的离线作业，Serial 单线程简单直接可能仍然划算；在线服务通常更在意延迟，G1 本来就更稳。

先用小规格机器跑一轮，对比吞吐量、尾延迟、启动时间和 RSS 再决定。

## 紧凑对象头：白捡的内存，顺带的风险

第二个默认值是紧凑对象头（[JEP 534](https://openjdk.org/jeps/534)）。

64 位 HotSpot 的对象头本来是两个字：一个 mark word，一个类指针，加起来 96 位、12 字节。紧凑对象头把 mark word、压缩类指针和几个元数据位塞进一个 64 位值里，也就是 8 字节。

单个对象省 4 字节，听起来不值一提。但对象头是典型的小对象占比很高的"公摊"。举个最有利的例子：一个只有两个 int 字段的对象，老布局是 12 字节头加 8 字节字段，按 8 字节对齐后占 24 字节；紧凑布局是 8 加 8，占 16 字节。

官方公布的一组基准数据是：SPECjbb2015 在某个配置下堆用量减少 **22%**、CPU 时间减少 **8%**；另一个配置下 GC 次数减少 **15%**（G1 和 Parallel 都是）；一个高并行 JSON 解析器则跑快 **10%**。三组数字来自不同基准与不同配置，不是一个场景里的三个收益。

不过不是所有应用都能拿到这个数。大数组和长字符串几乎不受益——它们的体积主要在大块数据上，不在对象头。对象实例多、个体小的服务受益最明显：缓存项、DTO、消息信封、树节点。

代价在哪？

紧凑对象头改的是对象在堆里的内存布局。任何直接读对象头偏移的东西都得跟着适配：一部分 JNI 代码、JVM 监控 Agent、做对象布局分析的框架。

这也不是纯理论风险——JVM Weekly 的发布记录里提到，这一轮有一个 P1 级 bug，只在开启紧凑对象头的情况下才复现。

好在关闭开关还在：`-XX:-UseCompactObjectHeaders`。但官方 release notes 里写了，旧的对象头布局"计划在未来的版本中废弃并移除"。所以这是个过渡选项，不是长期方案。

## 默认值也管安全：JFR 脱敏与后量子 TLS

第三处转正的是 JFR 进程内数据脱敏（JEP 536）。

以前的场景不少团队碰过——线上出问题，导一份 JFR 录制丢进工单系统。而录制文件里的环境变量、系统属性、启动参数，经常带着连接串、access token 和服务密码，原样躺在那里。

JDK 27 起，这些数据在离开进程之前就被替换成 `[REDACTED]`。

默认命中的是一组 glob 模式，覆盖 `*password*`、`*token*`、`*secret*`、`*api*key*`、`*credential*`、`*passwd*`、`*pwd*`、`*private*key*`、`*passphrase*`、`*auth*`、`*client*secret*` 这类命名。

自定义和关闭都有明确入口：

```bash
# 在默认规则之上追加自己的关键字（前缀 + 表示追加）
java -XX:FlightRecorderOptions:'redact-key=+dburl' -jar app.jar

# 关闭默认过滤（不建议在生产用）
java -XX:FlightRecorderOptions:'redact-key=none' -jar app.jar
```

注意 `redact-key` 针对环境变量和系统属性，`redact-arguments` 针对 JVM 参数，两者分开配；规则多了可以写进文件用 `@args.txt` 引。

代价是：如果排障流程依赖从 JFR 里读某个被命中关键字的环境变量，现在读不到了。要么改命名避开默认模式，要么在 `redact-key` 里显式加回来——加之前先想清楚它为什么会命中。

第四处转正是 TLS 1.3 的后量子混合密钥交换（JEP 527）。它防的是"先囤后解"：攻击者今天抓走加密流量，等量子计算机成熟后再解密。

做法是把经典算法和抗量子算法组合起来，JDK 27 默认启用的命名组里多了 `X25519MLKEM768`，也就是 X25519 加 ML-KEM。

对使用 `javax.net.ssl` 的应用，代码不用改，两端都支持就自动协商，对方不支持就回退到经典算法。

需要验证的是另一头：年代久远的 TLS 客户端、自己定制过 SSLContext 的系统、以及某些嵌入式或老版本 OpenSSL 的接入方。握手流程变了，兼容性回归要覆盖到这部分。

## 真正要改的是启动脚本

上面几处是"行为变了"，另外有一批是"参数直接不能用了"。升级后如果启动脚本里还带着这些，JVM 会报错退出或者打警告。

| 旧写法 | JDK 27 状态 | 处理 |
|---|---|---|
| `-noclassgc` | 已移除 | 换成 `-Xnoclassgc` |
| `-verifyremote` | 已移除 | 换成 `-Xverify:remote` |
| `-noverify` | 已移除 | 无替代，删掉 |
| `-Xverify:none` | 已移除 | 无替代，删掉 |
| `-XX:InitiatingHeapOccupancyPercent=N` | 已弃用 | 换成 `-XX:G1IHOP=N` |
| `-XX:+UseCompressedClassPointers` | 已 obsolete | 删掉（现在恒开） |
| `-XX:+AlwaysActAsServerClassMachine` | 已 obsolete | 删掉，会打印 support was removed in 27.0 |
| JVMCI 相关（含 `-XX:+UseGraalJIT`） | 整个移除 | 依赖 Graal JIT 的项目需另作打算 |

`-Xverify:none` 和 `-noverify` 值得单独说一句。这两个在很长一段时间里被当作"启动加速技巧"写进各种容器镜像的 Dockerfile，实际上是关掉字节码校验。JDK 27 把它们移除了，且没有替代品。

JVMCI 的移除影响面更大一点。它连同 `jdk.internal.vm.ci`、`jdk.graal.compiler`、`jdk.graal.compiler.management` 三个模块，以及名字里带 JVMCI 的开关，一起被删了。

官方给的理由是 GraalVM 已经和 OpenJDK 分离，维护和测试成本不划算。如果你在用旧版 Graal JIT，或者某些 TornadoVM 的用法，要么在自己的代码树里维护，要么停在更早的 JDK。

还有一处不报错、但会静默影响工具链：JSON 格式的线程转储里，线程 id、线程数、进程 id 这几个字段从字符串改成了数字，并新增了 `formatVersion: 2`。

自己写脚本解析 `jcmd Thread.dump_to_file` 输出的团队，升级后会拿到解析失败的 JSON。

[JDK 27 运行时更新说明](https://inside.java/2026/09/12/jdk-27-runtime-updates)里还有几条零碎的：`jcmd` 新增了 `VM.security_properties` 命令和 Bash 补全脚本，`VM.info` 与 `hs_err_pid` 日志开始报告当前打开的文件描述符数量。

分代 ZGC 下，`jdk.OldObjectSample` 事件则因为性能开销过大被默认关闭。

## 升级前跑完这四步

![升级前的四个动作](/imgs/202609/2026-09-21-jdk27-default-changes-infographic-3.jpg)

第一步，把当前进程的实际情况打出来。十行代码，只用标准管理 API：

```java
public class RuntimeBaseline {
    public static void main(String[] args) {
        System.out.println("Java: " + Runtime.version());
        System.out.println("Heap (MiB): " + Runtime.getRuntime().maxMemory() / (1024 * 1024));
        ManagementFactory.getGarbageCollectorMXBeans()
            .forEach(gc -> System.out.println("GC: " + gc.getName()));
    }
}
```

第二步，用同样的资源限制，在两个 JDK 上分别跑默认、显式 G1、显式 Serial 三种组合：

```bash
java -XX:ActiveProcessorCount=1 -Xmx128m RuntimeBaseline
java -XX:ActiveProcessorCount=1 -Xmx128m -XX:+UseG1GC RuntimeBaseline
java -XX:ActiveProcessorCount=1 -Xmx128m -XX:+UseSerialGC RuntimeBaseline
```

`-XX:ActiveProcessorCount=1` 是复现受限环境的关键：容器里可能看到 8 核，但你 Pod 的 limit 只有 1 核，JVM 看的是后者。

第三步，把输出存档。这一步的意义不在这次升级，而在于下次升级时你有一份能直接对比的基线。GC 名字这类信息，不主动打出来就无从得知。

第四步，压测四项：响应时间的分位数、持续负载下的 CPU 与吞吐、堆与进程总内存、流量尖峰时的表现。

## 它的代价，和下一步

JDK 27 是非 LTS 版本。Azul 一类的发行版把它支持到 2027 年 3 月，之后 JDK 28 接上。刚升到 21 或 25 的团队，没有必要为了这几个默认值再动一次生产。

另一个变化在节奏上：从 2026 年 8 月起，季度的安全更新改成了月度（CSPU）。对维护发布流水线的人来说，这意味着补丁验证的频次变了。

还有五个特性仍在预览或孵化：惰性常量（第三次预览）、原始类型模式匹配（第五次预览）、结构化并发（第七次预览）、Vector API（第十二次孵化）、PEM 编码（第三次预览）。

结构化并发预览到第七次，说明这个 API 的设计还在调整——预览特性不受兼容性承诺保护，下个版本语法可能变，别放到生产。

值得提一句的是 JDK 28 的方向。按目前公开的信息，Project Valhalla 会在那里落下第一次预览：值对象加严格字段初始化，涉及约 18 万行代码、1800 个文件，还有一个新的 `value` 关键字。

跟它比，紧凑对象头只是把对象头从 12 字节压到 8 字节，而值对象要动的是"对象有没有身份"这件事。

## 总结

JDK 27 值得记住的不是某个新特性，而是它暴露的一类问题：**默认值是最少被审查的配置**。

没有显式指定的东西，看起来就像不存在。而恰恰是这些没写进配置的地方，一次升级就可能被换掉——换成吞吐略低但延迟更稳的 G1，换成省 22% 堆的紧凑对象头，换成不再明文的 JFR 录制。

想清楚这一步，升级清单上就会多两条：先问一遍"我没配的东西，这版默认成了什么"，再跑一遍基线存档。

## 参考资料

1. [Java 27 / JDK 27: General Availability](https://mail.openjdk.org/archives/list/announce@openjdk.org/thread/ORGGLMN75HFEWP7YL3ZLGHLYHVIBJDYT/) — Mark Reinhold，OpenJDK announce 邮件列表，2026-09-15
2. [Oracle Releases Java 27 and Strengthens Post-Quantum Cryptography Support](https://www.oracle.com/news/announcement/oracle-releases-java-27-and-strengthens-post-quantum-cryptography-support-2026-09-15/) — Oracle 新闻稿，2026-09-15
3. [JEP 523: Make G1 the Default Garbage Collector in All Environments](https://openjdk.org/jeps/523) — OpenJDK，2026
4. [JEP 534: Compact Object Headers by Default](https://openjdk.org/jeps/534) — OpenJDK，2026
5. [JEP 536: JFR In-Process Data Redaction](https://openjdk.org/jeps/536) — OpenJDK，2026
6. [JEP 527: Post-Quantum Hybrid Key Exchange for TLS 1.3](https://openjdk.org/jeps/527) — OpenJDK，2026
7. [JDK 27 Runtime Updates Release Notes](https://inside.java/2026/09/12/jdk-27-runtime-updates) — Inside Java（Oracle），2026-09-12
8. [Java 27: What Production Teams Should Evaluate Now](https://www.homannsoftware.com/2026/09/15/java-27-production-upgrade-guide) — Homann Software，2026-09-15（9-16 更新实测对照）
9. [JDK 27 is here — JVM Weekly vol. 192](https://www.jvm-weekly.com/p/jdk-27-is-here-jvm-weekly-vol-192) — JVM Weekly（紧凑对象头测算样例与 P1 bug 记录）
10. [Java 27 is only boring on the surface](https://mostlynerdless.de/blog/2026/09/15/java-27-is-only-boring-on-the-surface) — Mostly Nerdless，2026-09-15（G1 堆比例默认值调整，JDK-8238686）
11. [Foojay Podcast #101: Java 27 in Practice](https://foojay.io/today/foojay-podcast-101) — Foojay，嘉宾 Simon Ritter（Azul），2026-09（SPECjbb2015 基准与 JDK 28 预览信息）
12. [Azul Zulu 27 General Availability Release Notes](https://docs.azul.com/core/release-notes/cck/icedteaweb/cck/cck/icedteaweb/uninstall/install/tpl) — Azul（支持周期至 2027-03、JEP 转正与预览清单）
13. [Oracle ships JDK 27 with post-quantum TLS and compact headers](https://www.worldprogramming.org/posts/oracle-ships-jdk-27-with-post-quantum-tls-and-compact-headers-yvctve) — World Programming（外部贡献者占比与新 jcmd 能力）

> 作者：[唐悦玮](https://tangyuewei.com)  |  从后端出发，用 AI 拓展到全栈的工程师。
