---
title: Spring Boot 常用配置
author: tangyuewei
date: 2019-10-08 10:39:06 +0800
categories: [Spring Boot]
tags: [Spring Boot,Spring Boot配置]
pin: false
comments: true
keyword: Spring Boot 常用配置,自定义 Banner,配置文件,日志配置
---
# Spring Boot 简介

## 概述

Spring Boot 可以称之为**新一代 JavaEE**开发标准；随着动态语言的流行 (Ruby、Groovy、Scala、Node.js)，Java 的开发显得格外的笨重：繁多的配置、低下的开发效率、复杂的部署流程以及第三方技术集成难度大。

在上述环境下，Spring Boot 应运而生。它使用**“习惯优于配置”**（项目中存在大量的配置，此外还内置了一个习惯性的配置，让你无需手动进行配置）的理念让你的项目快速的运行起来。使用 Spring Boot 很容易创建一个独立运行（运行 Jar，内嵌 Servlet 容器）准生产级别的基于 Spring 框架的项目，使用 Spring Boot 你可以不用或者只需很少的 Spring 配置。

## Spring 简史

### Spring 1.x 时代

在 Spring1.x 时代，都是通过 xml 文件配置 bean，随着项目的不断扩大，需要将 xml 配置分放到不同的配置文件中，需要频繁的在 java 类和 xml 配置文件中切换。

### Spring 2.x 时代

随着 JDK 1.5 带来的注解支持，Spring2.x 可以使用注解对 Bean 进行申明和注入，大大的减少了 xml 配置文件，同时也大大简化了项目的开发。

那么，问题来了，究竟是应该使用 xml 还是注解呢？

最佳实践：

- 应用的基本配置用 xml，比如：数据源、资源文件等
- 业务开发用注解，比如：Service 中注入 bean 等

### Spring 3.x 时代

从 Spring3.x 开始提供了 Java 配置方式，使用 Java 配置方式可以更好的理解你配置的 Bean，现在我们就处于这个时代，并且 Spring4.x 和 Spring boot 都推荐使用 java 配置的方式。

### Spring 5.x 时代

Spring5.x 是 Java 界首个支持响应式的 Web 框架，是 Spring 的一个重要版本，距离 Spring4.x 差不多四年。在此期间，大多数增强都是在 Spring Boot 项目中完成的，其最大的亮点就是提供了完整的端到端响应式编程的支持（新增 Spring WebFlux 模块）。

Spring WebFlux 同时支持使用旧的 Spring MVC 注解声明`Reactive Controller`。和传统的`MVC Controller`不同，`Reactive Controller` 操作的是**非阻塞**的`ServerHttpRequest`和`ServerHttpResponse`，而不再是`Spring MVC`里的`HttpServletRequest`和`HttpServletResponse`。

至此也代表着 Java 正式迎来了响应式异步编程的时代。

### Spring Boot 优缺点

### 优点

- 快速构建项目
- 对主流开发框架的无配置集成
- 项目可独立运行，无需外部依赖 Servlet 容器
- 提供运行时的应用监控
- 极大地提高了开发、部署效率
- 与云计算的天然集成

### 缺点

- 版本迭代速度很快，一些模块改动很大
- 由于不用自己做配置，报错时很难定位

# Spring Boot 常用配置
## 概述
> 本章节主要介绍一下 Spring Boot 中的一些常用配置，比如：自定义 Banner、配置日志、关闭特定的自动配置等。

## 自定义 Banner

在 Spring Boot 启动的时候会有一个默认的启动图案
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.1.6.RELEASE)
```
我们在 `src/main/resources` 目录下新建一个 banner.txt

通过 [http://patorjk.com/software/taag](http://patorjk.com/software/taag) 网站生成字符串，将网站生成的字符复制到 banner.txt 中

再次运行这个程序

常用属性设置：

- ${AnsiColor.BRIGHT_RED}：设置控制台中输出内容的颜色
- ${application.version}：用来获取 MANIFEST.MF 文件中的版本号
- ${application.formatted-version}：格式化后的 ${application.version} 版本信息
- ${spring-boot.version}：Spring Boot 的版本号
- ${spring-boot.formatted-version}：格式化后的 ${spring-boot.version} 版本信息

## 配置文件

`Spring Boot` 项目使用一个全局的配置文件 `application.properties` 或者是 `application.yml`，在 `resources` 目录下或者类路径下的 `/config` 下，一般我们放到 `resources` 下。

修改 `Tomcat` 的端口为 9090，并将默认的访问路径 "/" 修改为 "boot"，可以在 `application.properties` 中添加：

``` properties
server.port=9090
server.context-path=/boot
```
或在 `application.yml` 中添加：
``` yaml
server:
  port: 9090
  context-path: /boot
```
[更多配置](https://docs.spring.io/spring-boot/docs/2.0.2.RELEASE/reference/html/common-application-properties.html)

## Starter POM

>Spring Boot 为我们提供了简化企业级开发绝大多数场景的 starter pom ，只要使用了应用场景所需要的 starter pom ，相关的技术配置将会消除，就可以得到 Spring Boot 为我们提供的自动配置的 Bean。

[更多 Starter POM](https://docs.spring.io/spring-boot/docs/2.0.2.RELEASE/reference/html/using-boot-build-systems.html#using-boot-starter)

## 日志配置

Spring Boot 对各种日志框架都做了支持，我们可以通过配置来修改默认的日志的配置

默认情况下，Spring Boot 使用 Logback 作为日志框架

```
logging:
  file: ../logs/spring-boot-hello.log
  level.org.springframework.web: DEBUG
```
## 关闭特定的自动配置

关闭特定的自动配置使用 `@SpringBootApplication` 注解的 `exclude` 参数即可，这里以关闭数据源的自动配置为例
``` java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
```
