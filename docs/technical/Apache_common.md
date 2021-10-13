---
sidebar: auto
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: 唐悦玮,唐悦玮的博客,唐悦玮博客,全景网唐悦玮,悦玮
---
# apache common Lang使用

lang3是Apache Commons 团队发布的工具包，要求jdk版本在1.5以上，相对于lang来说完全支持java5的特性，废除了一些旧的API。该版本无法兼容旧有版本，于是为了避免冲突改名为lang3

## maven引入
```
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.8.1</version>
</dependency>

```

## 日期
### org.apache.commons.lang3.time

- DateFormatUtils 日期和时间格式化实用程序和常量
- DateUtils 包含许多考虑对日期或日历进行操作的常用方法
- DurationFormatUtils 将时间间隔格式化为字符串
- FastDateFormat 快速且线程安全的版本
- StopWatch 计时API

- ...等等

## StringUtils

字符串判断处理等。

## RegExUtils

正则表达式处理字符串

## RandomUtils

补充标准的实用程序库，随机数

## ArrayUtils

用于对数组的操作，如添加、查找、删除、子数组、倒序、元素类型转换等

## ClassUtils

用于对Java类的操作

## SerializationUtils

对象的序列化工具

## ClassPathUtils

处理类路径的一些工具类

## CharUtils

用于操作char值和Character对象

## BeanUtils

主要是封装了java反射(reflection)和自省（introspection）API，来对javabean进行操作。

