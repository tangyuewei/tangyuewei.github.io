---
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: 唐悦玮,mysql,mysql使用,mysql下载安装,mysql优化,mysql索引使用,mysql命令,学习mysql
---
# mysql

## 下载安装

下载地址: [https://www.mysql.com/downloads/](https://www.mysql.com/downloads/)

## 创建和使用数据库
- 显示数据库```show databases;```
- 创建数据库```create database test;```
- 访问数据库```mysql> use test;```
- 显示表 ```show tables;```
- 创建表 
    ```sql
     create table `user` (
          `id` int(11) not null auto_increment comment '主键',
          `username` varchar(48) default null comment '用户名',
          `password` varchar(48) default null comment '密码',
          `create_time` timestamp not null default current_timestamp comment '创建时间',
          `update_time` timestamp not null comment '修改时间',
          `state` int not null comment '状态',
          primary key (`id`)
        )engine=innodb default charset=utf8 comment='用户表';
    ```
- 查看表结构 ```describe user;```或者```desc user;```
- 插入数据
    - 将文本文件加载pet.txt到 pet表中，使用以下语句：
     ```load data local infile '/path/user.txt' into table user;```
    - 普通脚本插入：
      ```sql
      insert into user values (1,'tyw','123','','',0);
      ```
- 更新数据
   ```sql
         update user set username = 'tboss' where id = 1;
  ```
- 查询数据
   ```sql
           select * from user;
   ```

## 索引
- 查看表索引
```sql
show index from user;
    or
show keys from user;

```

- 创建索引
```sql
-- 普通索引
create index index_username on user (username)
-- 全文索引
create fulltext index index_username on user (username)
-- 主键索引
alter table user add primary key (id)
-- 外键索引
alter table user add unique (id)
```
- 删除索引
```sql
drop index index_username on user

alter table user drop index index_username
-- 删除主键索引
alter table user drop primary key
-- 删除外键索引
alter table user drop unique

```
索引查询注意
- like时“%aa%”不会使用索引，而like “aa%”会使用索引
- where子句中使用了索引的话，order by中的列不会使用索引

## 字段操作

- 添加表字段
    - 添加字段
    ```sql
          alter table user add extend varchar(10);
    ```
    - 修改字段
    ```sql
          alter table user change extend extend1 varchar(11) not null;
    ```
- 删除表字段
    ```sql
          alter table user drop extend1;
   ```

## 优化
- 表关联查询时务必遵循 小表驱动大表 原则；
- 使用查询语句 where 条件时，不允许出现 函数，否则索引会失效；
- 使用单表查询时，相同字段尽量不要用 OR，因为可能导致索引失效，比如：SELECT * FROM table WHERE name = 'zhangsan' OR name = 'lisi'，可以使用 UNION 替代；
- LIKE 语句不允许使用 % 开头，否则索引会失效；
- 组合索引一定要遵循 从左到右 原则，否则索引会失效；比如：SELECT * FROM table WHERE name = '张三' AND age = 18，那么该组合索引必须是 name,age 形式；
- 索引不宜过多，根据实际情况决定，尽量不要超过 10 个；
- 每张表都必须有 主键，达到加快查询效率的目的；
- 分表，可根据业务字段尾数中的个位或十位或百位（以此类推）做表名达到分表的目的；
- 分库，可根据业务字段尾数中的个位或十位或百位（以此类推）做库名达到分库的目的；
- 表分区，类似于硬盘分区，可以将某个时间段的数据放在分区里，加快查询速度，可以配合 分表 + 表分区 结合使用；

::: danger 警告
在使用 MySQL 或 MariaDB，不要用“utf8”编码，改用“utf8mb4”。这里（https://mathiasbynens.be/notes/mysql-utf8mb4#utf8-to-utf8mb4）提供了一个指南用于将现有数据库的字符编码从“utf8”转成“utf8mb4”。
MySQL 的“utf8mb4”是真正的“UTF-8”。
MySQL 的“utf8”是一种“专属的编码”，它能够编码的 Unicode 字符并不多。
:::

## 缓存清理

查看是否生效
```sql
select @@query_cache_type;
```
> 1.在 query_cache_type 打开的情况下，如果你不想使用缓存，需要指明
  select sql_no_cache id,name from tableName;
  2.当sql中用到mysql函数，也不会缓存

查看缓存的状态
```sql
show status like '%Qcache%';
```

名称|备注
---|---
Qcache_free_blocks|目前还处于空闲状态的 Query Cache 中内存 Block 数目
Qcache_free_memory|目前还处于空闲状态的 Query Cache 内存总量
Qcache_hits|Query Cache 命中次数
Qcache_inserts|向 Query Cache 中插入新的 Query Cache 的次数，也就是没有命中的次数
Qcache_lowmem_prunes|当 Query Cache 内存容量不够，需要从中删除老的 Query Cache 以给新的 Cache 对象使用的次数
Qcache_not_cached|没有被 Cache 的 SQL 数，包括无法被 Cache 的 SQL 以及由于 query_cache_type 设置的不会被 Cache 的 SQL
Qcache_queries_in_cache|目前在 Query Cache 中的 SQL 数量
Qcache_total_blocks|Query Cache 中总的 Block 数量  

禁用/开启查询缓存
```sql
set session query_cache_type=off;
set session query_cache_type=on;
```

缓存清理
```sql
FLUSH QUERY CACHE; -- 清理查询缓存内存碎片。
RESET QUERY CACHE; -- 从查询缓存中移出所有查询。
FLUSH TABLES; -- 关闭所有打开的表，同时该操作将会清空查询缓存中的内容。
```
