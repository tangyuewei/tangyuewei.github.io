---
title: MemCached笔记
author: tangyuewei
date: 2018-10-13 10:39:06 +0800
categories: [数据库]
tags: [数据库,MemCached]
pin: false
comments: true
keyword: MemCached概述,Memcached使用,Memcached统计命令,Memcached官网,Memcached学习
---
# MemCached概述

> MemCache是一个自由、源码开放、高性能、分布式的分布式内存对象缓存系统，用于动态Web应用以减轻数据库的负载。它通过在内存中缓存数据和对象来减少读取数据库的次数，从而提高了网站访问的速度。MemCaChe是一个存储键值对的HashMap，在内存中对任意的数据（比如字符串、对象等）所使用的key-value存储，数据可以来自数据库调用、API调用，或者页面渲染的结果。MemCache设计理念就是小而强大，它简单的设计促进了快速部署、易于开发并解决面对大规模的数据缓存的许多难题，而所开放的API使得MemCache能用于Java、C/C++/C#、Perl、Python、PHP、Ruby等大部分流行的程序语言。

[MemCache的官方网站](http://memcached.org/)

## 特点

+ 协议简单
+ 基于libevent的事件处理
+ 内置内存存储方式
+ memcached不互相通信的分布式

## Memcached 存储命令

+ set 命令:将 value 存储在指定的 key 中。

`set key flags exptime bytes [noreply]
value `

如果set的key已经存在，该命令可以更新该key所对应的原来的数据，也就是实现更新的作用。

- key：键值 key-value 结构中的 key，用于查找缓存值。
- flags：可以包括键值对的整型参数，客户机使用它存储关于键值对的额外信息 。
- exptime：在缓存中保存键值对的时间长度（以秒为单位，0 表示永远）
- bytes：在缓存中存储的字节数
- noreply（可选）： 该参数告知服务器不需要返回数据
- value：存储的值（始终位于第二行）（可直接理解为key-value结构中的value）
```sql
set hello 0 900 9
memcached
STORED

get hello
VALUE hello 0 9
memcached

END
```
+ add 命令:将 value 存储在指定的 key 中。

`add key flags exptime bytes [noreply]
value`

如果 add 的 key 已经存在，则不会更新数据(过期的 key 会更新)，之前的值将仍然保持相同，并且您将获得响应 NOT_STORED。

+ replace 命令:替换已存在的 key 的 value。

`replace key flags exptime bytes [noreply]
value`

如果 key 不存在，则替换失败，并且您将获得响应 NOT_STORED。

+ append 命令:已存在 key 的 value 后面追加数据 。

`append key flags exptime bytes [noreply]
value`

+ prepend 命令:向已存在 key 的 value 前面追加数据。

`prepend key flags exptime bytes [noreply]
value`

+ CAS 命令:用于执行一个"检查并设置"的操作它仅在当前客户端最后一次取值后，该key 对应的值没有被其他客户端修改的情况下， 才能够将值写入。检查是通过cas_token参数进行的， 这个参数是Memcach指定给已经存在的元素的一个唯一的64位值。

`cas key flags exptime bytes unique_cas_token [noreply]
value`


输出信息说明：
- STORED：保存成功。
- ERROR：保存失败。
- NOT_STORED：该键在 Memcached 上不存在。
- CLIENT_ERROR：执行错误。
- EXISTS：在最后一次取值后另外一个用户也在更新该数据。
- NOT_FOUND：Memcached 服务上不存在该键值。

## Memcached 查找命令

+ get 命令:获取存储在 key 中的 value ，如果 key 不存在，则返回空。

`get key` 或者 `get key1 key2 key3`

+ gets 命令:获取带有 CAS 令牌存 的 value ，如果 key 不存在，则返回空。

```sql
set runoob 0 900 9
memcached
STORED
gets runoob
VALUE runoob 0 9 1
memcached
END
```
gets 命令的输出结果中，在最后一列的数字 1 代表了 key 为 runoob 的 CAS 令牌。

+ delete 命令:删除已存在的 key。

`delete key [noreply]`

+ incr 与 decr 命令:已存在的 key 的数字值进行自增或自减操作。

`incr key incr_value`

## Memcached 统计命令

+ stats 命令:返回统计信息例如 PID(进程号)、版本号、连接数等。

`stats`

+ stats items 命令:显示各个 slab 中 item 的数目和存储时长(最后一次访问距离现在的秒数)。

`stats items`

+ stats slabs 命令:显示各个slab的信息，包括chunk的大小、数目、使用情况等。

`stats slabs`

+ stats sizes 命令:显示所有item的大小和个数。

`stats sizes`

+ flush_all 命令:清理缓存中的所有 key=>value对。

`flush_all [time] [noreply]`

可选参数time，用于在指定的时间后执行清理缓存操作。


