---
title: springboot升级2.7后，无法设置跨域的问题
author: tangyuewei
date: 2022-08-12 14:00:00 +0800
categories: [博客那些事]
tags: [总结]
pin: false
comments: true
keyword: spring
---

## 描述
跨域是后端接口必须处理的问题，新搭建的服务使用`SpringBoot`的版本为`2.7.0`。使用postman请求接口时不带`origin`，接口都是可以正常返回的，
当加上了`origin`后，就报错了，报错信息如下：
```
java.lang.IllegalArgumentException: When allowCredentials is true, allowedOrigins cannot contain the special value "*" since that cannot be set on the "Access-Control-Allow-Origin" response header. To allow credentials to a set of origins, list them explicitly or consider using "allowedOriginPatterns" instead.
	at org.springframework.web.cors.CorsConfiguration.validateAllowCredentials(CorsConfiguration.java:475)
	at org.springframework.web.cors.CorsConfiguration.checkOrigin(CorsConfiguration.java:579)
	at org.springframework.web.cors.DefaultCorsProcessor.checkOrigin(DefaultCorsProcessor.java:174)
	at org.springframework.web.cors.DefaultCorsProcessor.handleInternal(DefaultCorsProcessor.java:116)
	at org.springframework.web.cors.DefaultCorsProcessor.processRequest(DefaultCorsProcessor.java:95)
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:87)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
```
我们初始的跨域设置是这样的
```java
@Configuration
@EnableWebMvc
public class CORSConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .allowedHeaders("*")
                .maxAge(1800L);

    }
}
```
根据报错的信息提示，我们将`allowedOrigins`修改为`allowedOriginPatterns`
```java
@Configuration
@EnableWebMvc
public class CORSConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .allowedHeaders("*")
                .maxAge(1800L);

    }
}
```
启动应用访问，还是报相同的错误。我们联系了前端和运维，在`js`和`nginx`端都作了处理，依然无济于事。

还发现一个诡异的问题，无论我本地如何上述跨域设置，都报上面相同的错误。

于是我本地`debug`设置了断点在`CorsConfiguration.java:475`的`CorsConfiguration.validateAllowCredentials`方法。

发现一次请求进了两次断点。其中有一次`if (this.allowCredentials == Boolean.TRUE &&
this.allowedOrigins != null && this.allowedOrigins.contains(ALL))`判断是通过的，显示`this.allowedOrigins`的值为"*";
所以就抛了这异常`java.lang.IllegalArgumentException: When allowCredentials is true, allowedOrigins cannot contain the special value "*" since that cannot be set on the "Access-Control-Allow-Origin" response header. To allow credentials to a set of origins, list them explicitly or consider using "allowedOriginPatterns" instead`。
```
/**
 * Validate that when {@link #setAllowCredentials allowCredentials} is true,
 * {@link #setAllowedOrigins allowedOrigins} does not contain the special
 * value {@code "*"} since in that case the "Access-Control-Allow-Origin"
 * cannot be set to {@code "*"}.
 * @throws IllegalArgumentException if the validation fails
 * @since 5.3
 */
public void validateAllowCredentials() {
		if (this.allowCredentials == Boolean.TRUE &&
				this.allowedOrigins != null && this.allowedOrigins.contains(ALL)) {

			throw new IllegalArgumentException(
					"When allowCredentials is true, allowedOrigins cannot contain the special value \"*\" " +
							"since that cannot be set on the \"Access-Control-Allow-Origin\" response header. " +
							"To allow credentials to a set of origins, list them explicitly " +
							"or consider using \"allowedOriginPatterns\" instead.");
		}
	}
```


## 解决方案
1. 降级`springboot`的版本到`2.3.x`（推荐）
>之前我们使用`springboot`的`2.3.12.RELEASE`时，设置跨域是不能`allowedOriginPatterns`的，接口也是正常，可以使用`maven`管理`pom.xml`
>先降级到`2.3.x`的版本。
2. 将`CorsConfiguration.java`中`CorsConfiguration.validateAllowCredentials`方法的抛异常注释掉
因为我们目前用的是`2.7.0`版本，并且使用了多数据源特性，使用`maven`降级后启动会报错。修改多数据源的代价还是很大的，所以我选择重写
`validateAllowCredentials`方法。
 - 首先在项目中新建`org.springframework.web.cors`包
 - 在`org.springframework.web.cors`包中新建`CorsConfiguration.java`类
 - 将`CorsConfiguration.class`中的代码复制到本地中，修改`validateAllowCredentials`方法，注释`throw new
IllegalArgumentException(When allowCredentials is true, allowedOrigins cannot contain the special value ...)`
 - 启动项目访问解决了。
>`java`加载类采用就近原则，故可以进行覆盖。
