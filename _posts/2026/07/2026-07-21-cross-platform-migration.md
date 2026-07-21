---
title: "一台中木马的服务器，逼我重写了文档转换模块"
author: 唐悦玮
date: 2026-07-21 09:00:00 +0800
categories: [Java, 工程实践]
tags: [Java, LibreOffice, 跨平台迁移, Jacob, 路径处理, soffice]
pin: false
comments: true
keyword: Java 跨平台迁移, LibreOffice, Jacob, 文档转换, 路径处理, soffice 并发
---

> **摘要**：一台中了木马的 Windows 服务器，逼着我们把一个老 Java 项目迁到 Linux。核心功能——用 Jacob 把 HTML 转 Word/PDF——在 Mac/Linux 上直接废掉，改 LibreOffice 后又一路踩坑：路径分隔符混用把数据跑乱、docx 转换报异常、批量任务 soffice 崩溃、历史数据要重处理。本文记录这 5 个坑的现象、根因和我们最终的解法，以及跨平台遗留系统迁移的 4 条铁律。

一台跑了好几年的老 Java 项目，原本安安静静地躺在公司的 Windows 服务器上。直到那台机器中了木马，开始频繁卡死，运维同学隔三差五就得上去重启。刚好最近又把开发机从 Windows 换成了 Mac——结果项目在 Mac 上根本跑不起来。两边一合计，干脆整体迁到 Linux 服务器。

迁移本身不算难，真正卡住我们的是核心功能里的一段代码：它用 Jacob 把 HTML 转成 Word 和 PDF。这段代码在 Windows 上跑了几年从没出过问题，到了 Mac 和 Linux 上，直接废了。

这篇文章记录的，就是这次迁移里一路踩过来的 5 个坑。每个坑都不是多高深的技术，但每一个都实打实耽误了我们时间。如果你手头也有这种"只在 Windows 跑、依赖本机 Office"的老系统，建议先码住，迟早用得上。

## 坑 1｜Jacob 是 Windows 死穴

第一脚就踢在 Jacob 上。

我们在 Mac 上启动项目，日志里直接炸出 `ClassNotFoundException`，报错指向 `com.jacob.com.ComThread`。查了才知道，Jacob 是个 Java-COM 桥，它本质是调用本机 MS Office 的 COM 接口来转格式——说白了，它得在 Windows 上、装了 MS Office、还得把 `jacob-1.20-x64.dll` 塞进 JRE 的 bin 目录才能跑。这套东西在 Mac 和 Linux 上连出生的机会都没有。

这不是我们代码写错了，是 Jacob 的底层假设就是"你在 Windows"。原来在 Windows 服务器上之所以稳，是因为 DLL 和 Office 都在那台机器上，迁移目标一旦换成 Linux，整个前提就不成立了。

方向反而清楚了：必须换一个不依赖本机 Office、全平台都能跑的方案。我们选了 LibreOffice 的 headless 模式——一条命令就能把文档转成 PDF，Windows / macOS / Linux 通用。Java 侧用 `ProcessBuilder` 起外部进程去调，转换全程在 LibreOffice 自己的进程里完成，不占 JVM 内存，比在 JVM 里加载整个文档稳得多。

## 坑 2｜路径分隔符地狱

引擎换好了，以为稳了，结果跑出来的数据乱了。

排查半天才发现，项目里大量路径是硬编码拼出来的：一会儿 `"data\\export\\report.doc"`，一会儿 `"data/export/report.doc"`，`\\` 和 `/` 混着用。在 Windows 上 Java 两种都认，到了 Linux 只认 `/`，那一堆 `\\` 直接被当成普通字符拼进了文件名，文件要么写错目录、要么读串了隔壁的文件，数据就这么悄悄乱了。

根因其实两个：一是硬编码分隔符，跨平台必踩；二是 Linux 的文件系统大小写敏感，Windows 不敏感，原来在 Windows 上 `Report.doc` 和 `report.doc` 是同一个文件，到了 Linux 变成两个，很多隐性 bug 就是这么来的。

我们最终把所有路径构造统一改成了 `Path` API，分隔符彻底交给 JVM 去操心：

```java
// ❌ 硬编码分隔符，跨平台必踩
String path = "data" + File.separator + "export" \\ "report.doc";

// ✅ 用 Path API，分隔符交给 JVM
Path out = Paths.get("data", "export", "report.doc").normalize();
Files.createDirectories(out.getParent());
```

`Paths.get` 按当前系统选分隔符，`normalize()` 再把 `.`、`..` 这些冗余段清掉。配置文件或用户输入里拿到的路径，先 `normalize()` 再校验存在性，别直接信字符串。

## 坑 3｜docx 比 html 难转

路径收拾完，开始批量验证转换质量。奇怪的事来了：同样用 LibreOffice，HTML 转 PDF 一切正常，docx 转 PDF 却频繁抛异常，要么直接乱码。

原因在格式本身。HTML 是纯文本流式结构，LibreOffice 解析起来轻松；docx 是 OOXML，本质是个 zip 包，里面可能嵌了旧模板的 OLE 对象、缺失的字体、宏、相对路径的图片，任何一项都能让转换卡住。

而 Linux 服务器上**缺中文字体是头号原因**。Windows 转 docx 时靠的是系统里的微软雅黑、宋体，换到干净的 Linux 服务器，这些字体一个都没有，LibreOffice 找不到就用方框替代，出来的 PDF 满屏"口口口"。

我们做的几件事：先 `fc-list :lang=zh` 确认服务器上没有中文字体，装了 `fonts-noto-cjk` 和 `wqy-zenhei`；再在 `fonts.conf` 里把文档指定的宋体、雅黑回退到已安装的字体；最后转换时显式嵌入字体并指定解析器：

```bash
# 装好中文字体后，显式嵌入 + 指定 Writer 的 PDF 导出过滤器
soffice --headless \
  --convert-to pdf:writer_pdf_Export \
  --outdir /opt/app/output \
  --embed-fonts \
  input.docx
```

还有个排查技巧：别一上来就批量跑，先拿几个真实的 docx 模板单个转，定位到底是字体缺失还是模板结构问题，对症下药比盲目升级版本管用。

## 坑 4｜批量任务 soffice 报错

单文件都通了，上批量任务，LibreOffice 又开始抽风：要么直接报错，要么生成了空文件，而且不是每次都复现，时好时坏。

这个坑最阴。根因是 soffice 默认会在 `~/.config/libreoffice` 建一个共享的 user profile，里面有个锁。多个 soffice 进程同时跑，就会去抢这把锁，后起来的那个初始化失败，输出就空了或者干脆崩。本地开发机并发低，根本测不出来；一上生产、并发一高，立马露馅。有位后端工程师在博客里记录过几乎一模一样的并发 bug，也是批量任务偶发空文件，最后定位到就是 profile 锁。

我们最终给每个转换进程分配独立的 profile 目录，进程之间不再互相踩：

```bash
# 每个进程独立 profile，避免锁冲突
soffice --headless \
  -env:UserInstallation=file:///tmp/lo-$$ \
  --convert-to pdf --outdir /out input.docx
```

如果走 Java 侧集成，更省心的是用 jodconverter，它自带连接池，多端口 + 单进程最大任务数 + 超时熔断都配好了：

```yaml
jodconverter:
  local:
    port-numbers: 2002,2003,2004
    max-tasks-per-process: 100
    task-execution-timeout: 120000
```

并发高的场景，再外面套一层队列做串行化，别让 soffice 自己互相打架。

## 坑 5｜历史数据

功能都跑通了，还有一笔旧账：老方案在 Windows 上生成的历史文档，格式和新方案不一定对齐，直接切过去，老文件可能打不开或者样式错位。

我们没有一次性全切，而是写了个迁移脚本，把历史文件批量用新引擎重转一遍，再校验输出（比对页数、或者算个哈希看是否为空文件），有问题的挑出来单独看。灰度切，先切新生成的，老数据后台慢慢补，不赌"一次迁移全对齐"。

## 复盘：跨平台遗留系统迁移的 4 条铁律

五个坑踩完，回头看，其实都是同一类问题——**老系统把太多假设焊死在了 Windows 上**。留给后来人的 4 条：

1. **路径用 `Path` API，别碰分隔符。** `Paths.get` + `normalize`，从根上消灭 `\\` 和 `/` 混用带来的数据错乱。
2. **转换引擎抽象一层。** Jacob、LibreOffice 都是具体的实现，业务代码里只依赖一个"转 PDF"的接口，换引擎只是换实现，别把 Office 的 DLL 写死进业务逻辑。
3. **批量走队列 + 独立 profile + 超时熔断。** 外部进程不是线程安全的玩具，并发、锁、超时这些约束必须显式管起来。
4. **先在 Linux 验证再上线。** 本地 Mac 低并发骗得了人，生产并发一高，所有隐藏的竞态都会冒头。

这思路和之前写的 Harness Engineering 其实是同一件事：不管是给 AI Agent 套缰绳，还是给一套老掉牙的文档转换依赖套约束，本质都是——**把不可控的东西关进可控的笼子里**，它才能在不属于它的环境里稳定运行。

**作者：唐悦玮 ｜ 公众号同名**
> 从后端出发，用 AI 拓展到全栈的工程师。
