---
title: Spring Boot 单元测试
author: tangyuewei
date: 2019-10-09 10:39:06 +0800
categories: [Spring Boot]
tags: [Spring Boot,Spring Boot单元测试]
pin: false
comments: true
keyword: Spring Boot 单元测试,创建测试类,单元测试
---
# Spring Boot 单元测试
## 概述
> 主要是通过 `@RunWith` 和 `@SpringBootTest` 注解来开启单元测试功能

## 创建测试类

``` java
package com.tangyuewei.hello.spring.boot;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import java.net.URL;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
@RunWith(SpringRunner.class)
@SpringBootTest(classes = HelloSpringBootApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class HelloSpringBootApplicationTests {
    @LocalServerPort
    private int port;
    private URL base;
    @Autowired
    private TestRestTemplate template;
    @Before
    public void setUp() throws Exception {
        this.base = new URL("http://localhost:" + port + "/");
    }
    @Test
    public void contextLoads() {
        ResponseEntity<String> response = template.getForEntity(base.toString(), String.class);
        assertThat(response.getBody(), equalTo("Hello Spring Boot"));
    }
}
```
- 运行它会先启动 Spring Boot 工程，再启动单元测试
