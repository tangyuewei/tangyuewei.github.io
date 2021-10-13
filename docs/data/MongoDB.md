---
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: 唐悦玮,MongoDB,MongoDB学习,MongoDB官网,MongoDB使用指南,MongoDB索引使用
---
# MongoDB

## 概述

[官网手册](https://docs.mongodb.com/manual/)
> MongoDB 是一个基于分布式文件存储的数据库。是由字段和值对组成的数据结构。MongoDB文档类似于JSON对象。字段的值可以包括其他文档，数组和文档数组。

## 特点

### 高性能

MongoDB提供高性能数据持久性。
+ 对嵌入式数据模型的支持减少了数据库系统的I / O活动。
+ 索引支持更快的查询，并且可以包含来自嵌入式文档和数组的键。

### 高可用性

MongoDB的复制工具称为副本集，它提供：
+ 自动故障转移和
+ 数据冗余。

## MongoDB CRUD操作

+ 插入：
```
db.collection.insertOne() 版本3.2中的新功能
db.collection.insertMany() 版本3.2中的新功能
```
::: tip 提示
db.users.insertOne(
    {
        name: "tboss",
        age: 30
    }
)
:::
+ 查询：
```
db.collection.find()
```
::: tip 提示
db.users.find(
    {age: { $gt: 18 } },
    {name: "tboss" }
).limit(20)
:::
+ 更新
```
db.collection.updateOne() 版本3.2中的新功能
db.collection.updateMany() 版本3.2中的新功能
db.collection.replaceOne() 版本3.2中的新功能
```
::: tip 提示
db.users.updateMany(
    {age: { $gt: 18 } },
    {$set: { name: "tyw" } }
)
:::

+ 删除
```
db.collection.deleteOne() 版本3.2中的新功能
db.collection.deleteMany() 版本3.2中的新功能
```
::: tip 提示
db.users.deleteMany(
    {age: { $gt: 18 } }
)
:::

## 聚合
```
db.collection.aggregate([
    { $match: { status: 0 } },  //精确匹配
    { $group: { _id: "$cust_id",total: { $sum: "amount" } } }   //精确匹配
]);
```

## 索引

+ 单个索引
> 对于单字段索引和排序操作，索引键的排序顺序（即升序或降序）无关紧要，因为MongoDB可以在任一方向上遍历索引。
```
db.collection.createIndex( { name: 1 } )    //单个索引
```

+ 复合索引
> 对于复合索引和排序操作，索引键的排序顺序（即升序或降序）可以确定索引是否可以支持排序操作。
```
db.collection.createIndex({name: 1, age: -1}, {background: true})   //复合索引
```
+ 多键索引
> 如果索引包含数组值的字段，MongoDB会为数组的每个元素创建单独的索引条目。这些多键索引允许查询通过匹配数组的元素或元素来选择包含数组的文档。如果索引字段包含数组值，MongoDB会自动确定是否创建多键索引; 您不需要显式指定多键类型。
```
db.collection.createIndex({"stock.size": 1 })   //多键索引
```
```json5
{
  _id: 3,
  item: "ijk",
  stock: [
    { size: "M", color: "blue", quantity: 15 },
    { size: "L", color: "blue", quantity: 100 },
    { size: "L", color: "red", quantity: 25 }
  ]
}
```
+ 文字索引
> 支持在集合中搜索字符串内容。
```
db.collection.createIndex( { name: "text" } )  //文字索引
db.collection.createIndex( { name: "text", desc: "text" } )  //文字复合索引
db.collection.createIndex( { "$**": "text" } )  //通配符文字索引--为包含集合中每个文档的字符串数据的每个字段编制索引
```
+ 散列索引
> 索引在其范围内具有更随机的值分布，但仅支持相等匹配且不支持基于范围的查询。
```
db.collection.createIndex( { _id: "hashed" } )  //散列索引--不支持多键
```
+ 唯一索引
>索引的唯一属性会导致MongoDB拒绝索引字段的重复值。除了唯一约束之外，唯一索引在功能上可与其他MongoDB索引互换。

+ 部分索引(版本3.2中的新功能。)
> 部分索引仅索引符合指定过滤器表达式的集合中的文档。通过索引集合中的文档子集，部分索引具有较低的存储要求，并降低了索引创建和维护的性能成本。

```
db.collection.createIndex(
   { cuisine: 1, name: 1 },
   { partialFilterExpression: { rating: { $gt: 5 } } }
)
```
+ 稀疏索引
> 索引的稀疏属性可确保索引仅包含具有索引字段的文档的条目。索引会跳过没有索引字段的文档。您可以将稀疏索引选项与唯一索引选项组合，以拒绝具有字段重复值的文档，但忽略没有索引键的文档。
```
db.scores.createIndex( { score: 1 } , { sparse: true } )
```
> 如果某些文档中不包含score字段，则直接跳过

+ TTL索引

> TTL索引是MongoDB可用于在一定时间后自动从集合中删除文档的特殊索引。

::: tip 提示
语法中 name 值为你要创建的索引字段，1 为指定按升序创建索引，如果你想按降序来创建索引指定为 -1 即可。
:::

参数|类型|描述
---|:---:|---
background|Boolean|建索引过程会阻塞其它数据库操作，background可指定以后台方式创建索引，即增加 "background" 可选参数。 "background" 默认值为false。
unique|	Boolean	|建立的索引是否唯一。指定为true创建唯一索引。默认值为false.
name|string|索引的名称。如果未指定，MongoDB的通过连接索引的字段名和排序顺序生成一个索引名称。
dropDups|Boolean|3.0+版本已废弃。在建立唯一索引时是否删除重复记录,指定 true 创建唯一索引。默认值为 false.
sparse|Boolean|对文档中不存在的字段数据不启用索引；这个参数需要特别注意，如果设置为true的话，在索引字段中不会查询出不包含对应字段的文档.。默认值为 false.
expireAfterSeconds|integer|指定一个以秒为单位的数值，完成 TTL设定，设定集合的生存时间。
v|index version|索引的版本号。默认的索引版本取决于mongod创建索引时运行的版本。
weights|document|索引权重值，数值在 1 到 99,999 之间，表示该索引相对于其他索引字段的得分权重。
default_language|string|对于文本索引，该参数决定了停用词及词干和词器的规则的列表。 默认为英语
language_override|string|对于文本索引，该参数指定了包含在文档中的字段名，语言覆盖默认的language，默认值为 language.

### 索引管理

+ 列出索引
```
db.collection.getIndexes()
```
```
db.getCollectionNames().forEach(function(collection) {
   indexes = db[collection].getIndexes();
   print("Indexes for " + collection + ":");
   printjson(indexes);
});
//列出所有索引
```
+ 删除索引
```
db.collection.dropIndex( { "name": 1 } );   //删除指定索引
db.collection.dropIndexes();    //删除所有索引
```
+ 修改索引
> 要修改现有索引，需要删除并重新创建索引。例外是 TTL索引，可以通过[collMod](https://docs.mongodb.com/manual/reference/command/collMod/#dbcmd.collMod)命令与[index](https://docs.mongodb.com/manual/reference/command/collMod/#index)集合标志一起 修改。

