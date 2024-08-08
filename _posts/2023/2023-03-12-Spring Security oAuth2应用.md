---
title: Spring Security oAuth2应用
author: tangyuewei
date: 2023-03-12 16:15:00 +0800
categories: [常用框架]
tags: [oAuth2, Spring Security]
pin: false
comments: true
keyword: 总结
---

## 数据表

```
CREATE TABLE `clientdetails` (
  `appId` varchar(128) NOT NULL,
  `resourceIds` varchar(256) DEFAULT NULL,
  `appSecret` varchar(256) DEFAULT NULL,
  `scope` varchar(256) DEFAULT NULL,
  `grantTypes` varchar(256) DEFAULT NULL,
  `redirectUrl` varchar(256) DEFAULT NULL,
  `authorities` varchar(256) DEFAULT NULL,
  `access_token_validity` int(11) DEFAULT NULL,
  `refresh_token_validity` int(11) DEFAULT NULL,
  `additionalInformation` varchar(4096) DEFAULT NULL,
  `autoApproveScopes` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`appId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_access_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication_id` varchar(128) NOT NULL,
  `user_name` varchar(256) DEFAULT NULL,
  `client_id` varchar(256) DEFAULT NULL,
  `authentication` blob,
  `refresh_token` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`authentication_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_approvals` (
  `userId` varchar(256) DEFAULT NULL,
  `clientId` varchar(256) DEFAULT NULL,
  `scope` varchar(256) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `expiresAt` timestamp NULL DEFAULT NULL,
  `lastModifiedAt` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_client_details` (
  `client_id` varchar(128) NOT NULL,
  `resource_ids` varchar(256) DEFAULT NULL,
  `client_secret` varchar(256) DEFAULT NULL,
  `scope` varchar(256) DEFAULT NULL,
  `authorized_grant_types` varchar(256) DEFAULT NULL,
  `web_server_redirect_uri` varchar(256) DEFAULT NULL,
  `authorities` varchar(256) DEFAULT NULL,
  `access_token_validity` int(11) DEFAULT NULL,
  `refresh_token_validity` int(11) DEFAULT NULL,
  `additional_information` varchar(4096) DEFAULT NULL,
  `autoapprove` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_client_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication_id` varchar(128) NOT NULL,
  `user_name` varchar(256) DEFAULT NULL,
  `client_id` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`authentication_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_code` (
  `code` varchar(256) DEFAULT NULL,
  `authentication` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `oauth_refresh_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## 引入依赖

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.qjdmy</groupId>
        <artifactId>qjdmy-parent</artifactId>
        <version>1.0.0.RELEASE</version>
    </parent>

    <artifactId>qjdmy-oauth</artifactId>
    <version>1.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>
    <url>http://www.qjdmy.com</url>
    <inceptionYear>2020-Now</inceptionYear>
    <description>认证与授权</description>

    <scm>
        <connection>scm:git:http://gitlab.tangyuewei.com/qjdmy/qjdmy-oauth.git</connection>
        <developerConnection>scm:git:http://gitlab.tangyuewei.com/qjdmy/qjdmy-oauth.git</developerConnection>
        <url>http://gitlab.tangyuewei.com/qjdmy/qjdmy-oauth</url>
        <tag>HEAD</tag>
    </scm>

    <developers>
        <developer>
            <id>tangyuewei</id>
            <name>Webster Tang</name>
            <email>472680811@qq.com</email>
        </developer>
    </developers>

    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>


        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-oauth2</artifactId>
        </dependency>


        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <scope>provided</scope>
        </dependency>


        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>


        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>qfdmy-repository-core</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>qfdmy-commons</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>

    <profiles>
        <profile>
            <id>microservice</id>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                        <configuration>
                            <mainClass>com.qjdmy.oauth.AuthApplication</mainClass>
                        </configuration>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
</project>
```

### application.yml

```yaml
server:
  port: 9090

spring:
  application:
    name: qjdmy-oauth
  main:
    allow-bean-definition-overriding: true
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    jdbc-url: jdbc:mysql://mysql.tangyuewei.com:3306/qfdmy?serverTimezone=Asia/Shanghai&useLegacyDatetimeCode=false&nullNamePatternMatchesAll=true&zeroDateTimeBehavior=CONVERT_TO_NULL&tinyInt1isBit=false&autoReconnect=true&useSSL=false&pinGlobalTxToPhysicalConnection=true
    username: root
    password: 123456
    hikari:
      minimum-idle: 5
      idle-timeout: 600000
      maximum-pool-size: 10
      auto-commit: true
      pool-name: MyHikariCP
      max-lifetime: 1800000
      connection-timeout: 30000
      connection-test-query: SELECT 1

security:
  oauth2:
    client:
      client-id: dashboard
      client-secret: dashboard
      access-token-uri: http://localhost:${server.port}/oauth/token
      user-authorization-uri: http://localhost:${server.port}/oauth/authorize
    resource:
      token-info-uri: http://localhost:${server.port}/oauth/check_token
    authorization:
      check-token-access: http://localhost:${server.port}/oauth/check_token
```

### Application

```java
package com.qjdmy.oauth;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 认证与授权
 *
 * @author Webster
 * @since v1.0.0
 */
@SpringBootApplication(scanBasePackages = "com.qjdmy")
@MapperScan(basePackages = "com.qjdmy.repository.core.mapper")
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

}
```

## 自定义认证授权实现

```java
package com.qjdmy.oauth.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.qjdmy.repository.core.domain.CoreAdmin;
import com.qjdmy.repository.core.domain.CoreUser;
import com.qjdmy.repository.core.mapper.CoreAdminMapper;
import com.qjdmy.repository.core.mapper.CoreUserMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * 自定义认证与授权
 * @author Webster
 * @since v1.0.0
 */
public class UserDetailsServiceImpl implements UserDetailsService {

    @Resource
    private CoreAdminMapper coreAdminMapper;

    @Resource
    private CoreUserMapper coreUserMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 管理后台
        LambdaQueryWrapper<CoreAdmin> adminWrapper = new LambdaQueryWrapper<>();
        adminWrapper.eq(CoreAdmin::getUsername, username);
        CoreAdmin coreAdmin = coreAdminMapper.selectOne(adminWrapper);
        if (null != coreAdmin) {
            // 授权，管理员权限为 ADMIN
            List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
            grantedAuthorities.add(new SimpleGrantedAuthority("ADMIN"));

            // 由框架完成认证工作
            return new User(coreAdmin.getUsername(), coreAdmin.getPassword(), grantedAuthorities);
        }

        // 门户网站
        LambdaQueryWrapper<CoreUser> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(CoreUser::getUsername, username);
        CoreUser coreUser = coreUserMapper.selectOne(userWrapper);
        if (null != coreUser) {
            List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
            grantedAuthorities.add(new SimpleGrantedAuthority("USERS"));
            return new User(coreUser.getUsername(), coreUser.getPassword(), grantedAuthorities);
        }

        return null;
    }
}
```

## 认证服务器配置

- WebSecurityConfiguration.java

```java
package com.qjdmy.oauth.configuration;

import com.qjdmy.oauth.service.impl.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * 认证服务器配置
 *
 * @author Webster
 * @since v1.0.0
 */
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

	@Bean
	@Override
	public UserDetailsService userDetailsServiceBean() {
		return new UserDetailsServiceImpl();
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsServiceBean());
	}

	@Override
	public void configure(WebSecurity web) {
		// 忽略的访问路径
		web.ignoring()
				.antMatchers("/login/**")
				.antMatchers("/registry/user")
				.antMatchers("/logout/**");
	}

}
```

- AuthorizationServerConfiguration.java

```java
package com.qjdmy.oauth.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;

import javax.annotation.Resource;
import javax.sql.DataSource;

/**
 * 认证服务器配置
 *
 * @author Webster
 * @since v1.0.0
 */
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfiguration extends AuthorizationServerConfigurerAdapter {

	/**
	 * 注入用于支持 password 模式
	 */
	@Resource
	private AuthenticationManager authenticationManager;

	/**
	 * 默认的加密方式
	 * @return {@link BCryptPasswordEncoder}
	 */
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Refresh Token 时需要自定义实现，否则抛异常 <br>
	 * Lazy 注解是为了防止循环注入（is there an unresolvable circular reference?）
	 */
	@Lazy
	@Resource(name = "userDetailsServiceBean")
	private UserDetailsService userDetailsService;

	@Bean
	@Primary
	@ConfigurationProperties(prefix = "spring.datasource")
	public DataSource dataSource() {
		// 配置数据源（注意，我使用的是 HikariCP 连接池），以上注解是指定数据源，否则会有冲突
		return DataSourceBuilder.create().build();
	}

	@Bean
	public TokenStore tokenStore() {
		// 基于 JDBC 实现，令牌保存到数据库
		return new JdbcTokenStore(dataSource());
	}

	@Bean
	public ClientDetailsService jdbcClientDetailsService() {
		// 基于 JDBC 实现，需要事先在数据库配置客户端信息
		return new JdbcClientDetailsService(dataSource());
	}

	@Override
	public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
		endpoints
				// 用于支持密码模式
				.authenticationManager(authenticationManager).tokenStore(tokenStore());

		// Refresh Token 时需要自定义实现，否则抛异常
		// Handling error: IllegalStateException, UserDetailsService is required.
		endpoints.userDetailsService(userDetailsService);
	}

	@Override
	public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
		security
				// 允许客户端访问 /oauth/check_token 检查 token
				.checkTokenAccess("isAuthenticated()").allowFormAuthenticationForClients();
	}

	/**
	 * 配置客户端
	 * @param clients {@link ClientDetailsServiceConfigurer}
	 * @throws Exception 全局异常
	 */
	@Override
	public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
		// 客户端配置
		clients.withClientDetails(jdbcClientDetailsService());
	}

}
```
## 实现登录功能

### 登录业务接口

```
package com.qjdmy.oauth.service;

import java.util.Map;

/**
 * 登录
 * @author Webster
 * @since v1.0.0
 */
public interface ILoginService {
    /**
     * 登录成功后仅返回 Token
     * @param username {@code String} 账号
     * @param password {@code String} 密码
     * @return {@code Map<String, String>} key: token
     */
    Map<String, String> getToken(String username, String password);

    /**
     * 刷新 Token
     * @param accessToken {@code String} 使用旧 Token 换新 Token
     * @return {@code Map<String, String>} 新 Token，key: token
     */
    Map<String, String> refresh(String accessToken);
}
```

### 登录业务实现

```java
package com.qjdmy.oauth.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.qjdmy.commons.exceptions.BusinessException;
import com.qjdmy.commons.response.ResponseCode;
import com.qjdmy.oauth.service.ILoginService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * 登录
 * @author Webster
 * @since v1.0.0
 */
@Service
public class LoginServiceImpl implements ILoginService {
    /**
     * TODO 用于临时存放所有 Refresh Token，实际情况应该放在 Redis 中
     */
    private static Map<String, String> refreshTokenMaps = new HashMap<>();

    @Value("${security.oauth2.client.access-token-uri}")
    private String accessTokenUri;

    @Value("${security.oauth2.client.client-id}")
    private String clientId;

    @Value("${security.oauth2.client.client-secret}")
    private String clientSecret;

    @Resource
    private BCryptPasswordEncoder passwordEncoder;

    @Resource(name = "userDetailsServiceBean")
    private UserDetailsService userDetailsService;

    @Override
    public Map<String, String> getToken(String username, String password) {
        Map<String, String> result = new HashMap<>();

        // 验证密码是否正确
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BusinessException(ResponseCode.USER_LOGIN_ERROR);
        }

        // 通过 HTTP 客户端请求登录接口
        Map<String, Object> authParam = getAuthParam();
        authParam.put("username", username);
        authParam.put("password", password);
        authParam.put("grant_type", "password");

        // 获取 access_token
        String strJson = HttpUtil.post(accessTokenUri, authParam);
        JSONObject jsonObject = JSONUtil.parseObj(strJson);
        String token = String.valueOf(jsonObject.get("access_token"));
        String refresh = String.valueOf(jsonObject.get("refresh_token"));
        if (StrUtil.isNotBlank(token) && StrUtil.isNotBlank(refresh)) {
            // 将 refresh_token 保存在服务端
            refreshTokenMaps.put(token, refresh);

            // 将 access_token 返回给客户端
            result.put("token", token);
            return result;
        }

        return null;
    }

    @Override
    public Map<String, String> refresh(String accessToken) {
        Map<String, String> result = new HashMap<>();

        // Access Token 不存在直接返回 null
        String refreshToken = refreshTokenMaps.get(accessToken);
        if (StrUtil.isBlank(refreshToken)) {
            throw new BusinessException(ResponseCode.USER_NOT_LOGGED_IN);
        }

        // 通过 HTTP 客户端请求登录接口
        Map<String, Object> authParam = getAuthParam();
        authParam.put("grant_type", "refresh_token");
        authParam.put("refresh_token", refreshToken);

        // 获取 access_token
        String strJson = HttpUtil.post(accessTokenUri, authParam);
        JSONObject jsonObject = JSONUtil.parseObj(strJson);
        String token = String.valueOf(jsonObject.get("access_token"));
        String refresh = String.valueOf(jsonObject.get("refresh_token"));
        if (StrUtil.isNotBlank(token) && StrUtil.isNotBlank(refresh)) {
            // 删除旧 Token
            refreshTokenMaps.remove(accessToken);

            // 将 refresh_token 保存在服务端
            refreshTokenMaps.put(token, refresh);

            // 将 access_token 返回给客户端
            result.put("token", token);
            return result;
        }

        return null;
    }

    // 私有方法 ------------------------------------------- Begin

    private Map<String, Object> getAuthParam() {
        Map<String, Object> param = new HashMap<>();
        param.put("client_id", clientId);
        param.put("client_secret", clientSecret);
        return param;
    }
}
```

### 封装工具类

```java
package com.qjdmy.commons.web;

import cn.hutool.core.util.StrUtil;
import com.qjdmy.commons.exceptions.BusinessException;
import com.qjdmy.commons.response.ResponseCode;

/**
 * 请求头处理
 * @author Webster
 * @since v1.0.0
 */
public class Header {

    private static final String AUTHORIZATION_BEARER_TOKEN = "Basic ";

    /**
     * 获取 Token
     * @param header {@code String} request.getHeader("Authorization")
     * @return {@code String} token
     */
    public static String getAuthorization(String header) {
        if (StrUtil.isBlank(header) || header.startsWith(AUTHORIZATION_BEARER_TOKEN)) {
            throw new BusinessException(ResponseCode.USER_NOT_LOGGED_IN);
        }
        return header.substring(AUTHORIZATION_BEARER_TOKEN.length() + 1);
    }
}
```

### 封装请求参数

```java
package com.qjdmy.oauth.controller.param;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 登录参数
 * @author Webster
 * @since v1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class LoginParam implements Serializable {

    private static final long serialVersionUID = 6227804428105653962L;

    /**
     * 账号
     */
    private String username;

    /**
     * 密码
     */
    private String password;

}
```

### 请求处理代码

```java
package com.qjdmy.oauth.controller;

import com.qfdmy.commons.response.ResponseResult;
import com.qfdmy.commons.web.Header;
import com.qfdmy.oauth.controller.param.LoginParam;
import com.qfdmy.oauth.service.ILoginService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 登录
 * @author Webster
 * @since v1.0.0
 */
@RestController
@RequestMapping(value = "login")
public class LoginController {

    @Resource
    private HttpServletRequest request;

    @Resource
    private ILoginService loginService;

    /**
     * 管理员登录
     * @param loginParam {@code JSON} {@link LoginParam}
     * @return {@link ResponseResult}
     */
    @PostMapping("admin")
    public ResponseResult admin(@RequestBody LoginParam loginParam) {
        return ResponseResult.success(loginService.getToken(loginParam.getUsername(), loginParam.getPassword()));
    }

    /**
     * 用户登录，登录只是拿 Token
     * @param loginParam {@code JSON} {@link LoginParam}
     * @return {@link ResponseResult}
     */
    @PostMapping("user")
    public ResponseResult users(@RequestBody LoginParam loginParam) {
        return ResponseResult.success(loginService.getToken(loginParam.getUsername(), loginParam.getPassword()));
    }

    /**
     * 刷新令牌
     * @return {@link ResponseResult}
     */
    @PostMapping("refresh")
    public ResponseResult refresh() {
        String token = Header.getAuthorization(request.getHeader("Authorization"));
        return ResponseResult.success(loginService.refresh(token));
    }
}
```

## 实现注销功能

```java
package com.qjdmy.oauth.controller;

import com.qjdmy.commons.response.ResponseCode;
import com.qjdmy.commons.response.ResponseResult;
import com.qjdmy.commons.web.Header;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 注销
 *
 * @author Webster
 * @since v1.0.0
 */
@RestController
@RequestMapping(value = "logout")
public class LogoutController {
    @Resource
    public TokenStore tokenStore;

    @Resource
    public HttpServletRequest request;

    /**
     * 注销管理员
     *
     * @return {@link ResponseResult}
     */
    @PostMapping("admin")
    public ResponseResult admin() {
        return logout();
    }

    /**
     * 注销用户
     *
     * @return {@link ResponseResult}
     */
    @PostMapping("user")
    public ResponseResult users() {
        return logout();
    }

    // 私有方法 ------------------------------------------- Begin

    private ResponseResult logout() {
        String token = Header.getAuthorization(request.getHeader("Authorization"));

        // 删除 token 以注销
        OAuth2AccessToken oAuth2AccessToken = tokenStore.readAccessToken(token);
        if (null != oAuth2AccessToken) {
            tokenStore.removeAccessToken(oAuth2AccessToken);
            return ResponseResult.success();
        }

        return ResponseResult.failure(ResponseCode.INTERFACE_ADDRESS_INVALID);
    }
}
```

## 资源服务器配置

```java
package com.qjdmy.all.configuration;

import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;

/**
 * 资源服务器配置
 *
 * @author Webster
 * @since v1.0.0
 */
@EnableResourceServer
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

    /**
     * 管理员角色
     */
    private static final String ADMIN = "ADMIN";

    /**
     * 用户角色
     */
    private static final String USERS = "USERS";

    @Override
    public void configure(HttpSecurity http) throws Exception {
        // 允许访问全部资源
//		http.exceptionHandling().and().sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//				.and().authorizeRequests().antMatchers("/**").permitAll();

        // 管理员授权请求路径
        String[] adminPaths = new String[]{
                "/core/**", "/qiniu/**"
        };

        ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry
                expressionInterceptUrlRegistry = http.exceptionHandling()
                .and().sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and().authorizeRequests();
        for (String adminPath : adminPaths) {
            expressionInterceptUrlRegistry.antMatchers(adminPath).hasAnyAuthority(ADMIN);
        }
    }

}
```
