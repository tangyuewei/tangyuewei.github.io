---
title: ElasticSearch基本应用
author: tangyuewei
date: 2022-04-11 18:11:00 +0800
categories: [常用框架]
tags: [ElasticSearch,搜索引擎,ES]
pin: false
comments: true
keyword: 搜索引擎,ElasticSearch,ES
---
## 概述
>开发中，我们经常会要操作ES，一般需要下载工具才能管理ES。如：，本文介绍使用`postman`操作，
### 创建索引
```
PUT http://127.0.0.1:9200/shopping

```
### 索引查询
```
查询单个索引
GET http://127.0.0.1:9200/shopping

查询所有
GET http://127.0.0.1:9200/_cat/indices?v
```
### 索引删除
```
DELETE http://127.0.0.1:9200/shopping
```

### 文档创建
```
POST http://127.0.0.1:9200/shopping/_doc

or   创建指定id

http://127.0.0.1:9200/shopping/_doc/10086

http://127.0.0.1:9200/shopping/_create/1000

body raw
{
 "title":"小米手机",
 "category":"小米",
 "images":"http://www.gulixueyuan.com/xm.jpg",
 "price":4999.00
}


```
### 文档查询
```
主键查询
GET http://127.0.0.1:9200/shopping/_doc/10086
查询所有
GET http://127.0.0.1:9200/shopping/_search    headers    Content-Type  -> application/json

```

### 文档修改
```
全量修改
PUT http://127.0.0.1:9200/shopping/_doc/10086
body raw
{
 "title":"华为手机",
 "category":"华为",
 "images":"http://www.gulixueyuan.com/hw.jpg",
 "price":4999.00
}

局部修改
POST http://127.0.0.1:9200/shopping/_update/10086
body raw
{
    "doc": {
        "title": "国产手机"
    }
}
```

### 删除文档
```
DELETE http://127.0.0.1:9200/shopping/_doc/10086
```

### 组合查询
```
单个条件查询带参数

GET http://127.0.0.1:9200/shopping/_search
body raw
{
    //请求参数拼在地址栏可能会乱码,所以推荐放在请求体中
    "query": {
        "match": {
            "category": "小米"
        }
    }
}

条件查询分页

GET http://127.0.0.1:9200/shopping/_search
body raw
{
    "query": {
        "match_all": {}
    },
    "from": 0, //偏移量,0表示第一页,即页码-1
    "size": 2, //每页的个数
    "_source": [
        "title" //查询结果仅显示title字段
    ],
    "sort": {
        "price": {
            "order": "asc" //asc升序，desc降序
        }
    }
}


多条件查询

GET http://127.0.0.1:9200/shopping/_search

{
    //bool表示条件的意思
    "query": {
        "bool": {
            //must表示多个条件必须同时成立,[]表示数组
            "must": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "price": 3999.00
                    }
                }
            ]
        }
    }
}

or

{
    //bool表示条件的意思
    "query": {
        "bool": {
            //should表示或者,华为或者小米满足一个就能查出来
            //效果不明显的话自行创建/修改数据
            "should": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "category": "华为"
                    }
                }
            ]
        }
    }
}



```

### 范围查询
```
GET http://127.0.0.1:9200/shopping/_search
body raw
{
    //bool表示条件的意思
    "query": {
        "bool": {
            //should表示或者,华为或者小米满足一个就能查出来
            "should": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "category": "华为"
                    }
                }
            ],
            "filter": {
                "range": {
                    "price": {
                        "gt": 2000
                    }
                }
            }
        }
    }
}

```

### 全文检索
```
GET http://127.0.0.1:9200/shopping/_search
body raw
{
    //es会将数据文字进行分词拆解操作，并将拆解后的数据保存到倒排索引中。这样即使只使用文字的一部分也能查到数据。
    "query": {
        "match": {
            "category": "米" //可以查看小米
            //"category": "小华" //小华可以同时查到小米和华为
        }
    }
}
```
### 完全匹配
```
GET http://127.0.0.1:9200/shopping/_search
body raw
{
    "query": {
        "match_phrase": {
            "category": "小华" //匹配不到小米和华为,但是米还是可以匹配到小米
            //"category": "米"
        }
    }
}
```
### 高亮查询
```
GET http://127.0.0.1:9200/shopping/_search
body raw
{
    "query": {
        "match_phrase": {
            "category": "小米"
        }
    },
    "highlight": {
        "fields": {
            "category": {}
        }
    }
}

```

### 聚合查询
```
GET http://127.0.0.1:9200/shopping/_search
body raw
{
    //想要对查询结果进行分组或者统计分析，要修改请求体body
    "aggs": { //聚合操作
        "price_group": { //名称，随意取名
            "terms": { //可选项:分组terms/平均值avg/最大值max/最小值min
                "field": "price" //(分组)字段
            }
        }
    },
    "size": 0 //不显示原始数据，只看分组数据
}

stats 聚合查询
{
    //想要对查询结果进行分组或者统计分析，要修改请求体body
    "aggs": { //聚合操作
        "stats_age": { //名称，随意取名
            "stats": { //可选项:分组terms/平均值avg/最大值max/最小值min
                "field": "price" //(分组)字段
            }
        }
    },
    "size": 0 //不显示原始数据，只看分组数据
}
```

## `is not null`或字段是否存在
GET http://127.0.0.1:9200/shopping/_search
body raw
```
{
    "query": {
        "bool": {
            "must": [
                {
                    "bool": {
                        "must": [
                            {
                                "exists": {
                                    "field": "field1"
                                }
                            }
                        ]
                    }
                },
                {
                    "bool": {
                        "must": [
                            {
                                "exists": {
                                    "field": "field2"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    "from": 0,
    "size": 10
}

or

{
    "query": {
        "bool": {
            "must": [
                {
                    "bool": {
                        "must": [
                            {
                                "exists": {
                                    "field": "field1"
                                }
                            },
                            {
                                "exists": {
                                    "field": "field2"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    "from": 0,
    "size": 1
}
```

## MySQL查询转ES
>[在线转换网址](https://printlove.cn/tools/sql2es/)

## kibana查询


### 查询所有索引
```
GET _mapping
GET /_cat/indices?v
```

### 条件查询
```
GET 索引/_search
{
  "query":{
    "bool": {
       "must": [
            {
          "match": {
            "字段": 字段值

          }
        },
        {
          "match": {
            "字段": 字段值
          }
        }
      ]
    }
  }
}
```
### 字段存在但不等于值
```
GET 索引/_search
{
 "query": {
   "bool": {
     "must_not": [
       {
         "term": {"字段": "字段值"}
       }
     ]
   }
 }
}
```

## 参考资料
- [postman帮助文档](https://www.postman.com/ycxinterface/workspace/demo/collection/707362-46d95fa4-5a5b-48d2-a1f6-067d882ba27e?ctx=documentation)
