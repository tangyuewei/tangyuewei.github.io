---
sidebar: auto
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: 唐悦玮,唐悦玮的博客,唐悦玮博客,全景网唐悦玮,悦玮
---
# Guava guava使用

## maven引入
```
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>23.0</version>
</dependency>

```

## 基本工具[Basic utilities]


##  集合[Collections]

### MultiMap

### MultiSet
统计一个词在文档中出现了多少次，传统的做法是这样的：
```
Map<String, Integer> counts = new HashMap<String, Integer>();
for (String word : words) {
    Integer count = counts.get(word);
    if (count == null) {
        counts.put(word, 1);
    } else {
        counts.put(word, count + 1);
    }
}

```
Multiset.addAll(Collection)可以添加Collection中的所有元素并进行计数


### Table

当你想使用多个键做索引的时候，你可能会用类似Map<FirstName, Map<LastName, Person>>的实现，这种方式很丑陋，使用上也不友好。Guava为此提供了新集合类型Table，它有两个支持所有类型的键：”行”和”列”。

Table提供多种视图，以便你从各种角度使用它：
+ rowMap()：用Map<R, Map<C, V>>表现Table<R, C, V>。同样的， rowKeySet()返回”行”的集合Set<R>。
+ row(r) ：用Map<C, V>返回给定”行”的所有列，对这个map进行的写操作也将写入Table中。
+ 类似的列访问方法：columnMap()、columnKeySet()、column(c)。（基于列的访问会比基于的行访问稍微低效点）
+ cellSet()：用元素类型为Table.Cell<R, C, V>的Set表现Table<R, C, V>。Cell类似于Map.Entry，但它是用行和列两个键区分的。

Table有如下几种实现：
- HashBasedTable：本质上用HashMap<R, HashMap<C, V>>实现；
- TreeBasedTable：本质上用TreeMap<R, TreeMap<C,V>>实现；
- ImmutableTable：本质上用ImmutableMap<R, ImmutableMap<C, V>>实现；注：ImmutableTable对稀疏或密集的数据集都有优化。
- ArrayTable：要求在构造时就指定行和列的大小，本质上由一个二维数组实现，以提升访问速度和密集Table的内存利用率。ArrayTable与其他Table的工作原理有点不同，请参见Javadoc了解详情。

### BiMap
>要实现键值对的双向映射需要维护两个单独的map，并保持它们间的同步。

例如：
```
Map<String, Integer> nameAndId = Maps.newHashMap();
Map<Integer, String> idAndName = Maps.newHashMap();
nameAndId.put("Bob", 42);
idAndName.put(42, "Bob");

```
这种方式容易出错，而且对于值已经在map中的情况，会变得非常混乱。在BiMap中可以这样：
```
BiMap<String, Integer> userId = HashBiMap.create();
...
String userForId = userId.inverse().get(id);

```


### ClassToInstanceMap

ClassToInstanceMap是一种特殊的Map：它的键是类型，而值是符合键所指类型的对象。

为了扩展Map接口，ClassToInstanceMap额外声明了两个方法：T getInstance(Class<T>) 和T putInstance(Class<T>, T)，从而避免强制类型转换，同时保证了类型安全。

ClassToInstanceMap有唯一的泛型参数，通常称为B，代表Map支持的所有类型的上界。例如：

```
ClassToInstanceMap<Number> numberDefaults=MutableClassToInstanceMap.create();
numberDefaults.putInstance(Integer.class, Integer.valueOf(0));

```

从技术上讲，ClassToInstanceMap<B>实现了Map<Class<? extends B>, B>——或者说，是一个映射B的子类型到对应实例的Map。这让ClassToInstanceMap包含的泛型声明有点令人困惑，
但B始终是Map所支持类型的上界——通常B就是Object。

对于ClassToInstanceMap，Guava提供了两种有用的实现：MutableClassToInstanceMap和 ImmutableClassToInstanceMap。

