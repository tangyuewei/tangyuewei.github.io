---
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: 唐悦玮,第一个Spring Boot应用程序,构建第一个Spring Boot应用,Spring Boot案例
---
# 第一个Spring Boot应用程序
## 概述
> Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。通过这种方式，Spring Boot致力于在蓬勃发展的快速应用开发领域(rapid application development)成为领导者。
- 创建独立的Spring应用程序

- 直接嵌入Tomcat，Jetty或Undertow（无需部署WAR文件）

- 提供自以为是的“入门”依赖项以简化构建配置

- 尽可能自动配置Spring和第三方库

- 提供生产就绪功能，例如指标，运行状况检查和外部化配置

- 绝对没有代码生成，也不需要XML配置
## 构建第一个Spring Boot应用
- 新建一个文件夹```spring-boot-sample````
- 创建目录结构
```
└── src
    └── main
        └── java
            └── hello
````
- 新建``` pom.xml ```文件
>
```$xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.springframework</groupId>
    <artifactId>gs-rest-service</artifactId>
    <version>0.1.0</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.5.RELEASE</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.jayway.jsonpath</groupId>
            <artifactId>json-path</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <properties>
        <java.version>1.8</java.version>
    </properties>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```
- 在```src/main/java/hello/```新建```HelloController.java```
```java
package hello;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @RequestMapping("/hello")
    public String hello(@RequestParam(value="name", defaultValue="World") String name) {
        return "Hello " + name;
    }
}
```
- 在```src/main/java/hello/```新建```Application.java```
```java
package hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
- 访问```http://localhost:8080/hello```返回```Hello World```
