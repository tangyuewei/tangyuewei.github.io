---
title: Docker Compose安装与使用
author: tangyuewei
date: 2020-04-14 10:39:06 +0800
categories: [分布式系统,docker]
tags: [分布式系统,docker,docker compose]
pin: false
comments: true
keyword: Docker Compose,Docker Compose 安装,Docker Compose 实例
---
## Docker Compose 安装
在 Ubuntu 系统中安装 Docker Compose 的说明：

```
curl -L https://github.com/docker/compose/releases/download/1.17.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
```
或者
```
apt-get install docker-compose
```

给 `docker-compose` 添加执行的权限：

```
sudo chmod +x /usr/local/bin/docker-compose
```
查看 `docker-compose` 的版本
```
docker-compose version
```

## Docker Compose 使用

---

创建一个 `docker-compose.yml` 配置文件：

```
version: '3'
services:
  webapp:
    restart: always
    image: training/webapp
    container_name: webapp
    ports:
      - 5000:5000
```

参数说明：

* version：指定脚本语法解释器版本
* services：要启动的服务列表
  * webapp：服务名称，可以随便起名，不重复即可
    * restart：启动方式，这里的 `always` 表示总是启动，即使服务器重启了也会立即启动服务
    * image：镜像的名称，默认从 Docker Hub 下载
    * container\_name：容器名称，可以随便起名，不重复即可
    * ports：端口映射列列表，左边为宿主机端口，右边为容器端口

前台运行：

```
webster@UbuntuBase:/usr/local/docker/python$ docker-compose up
Creating network "python_default" with the default driver
Creating webapp ...
Creating webapp ... done
Attaching to webapp
webapp    |  * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
```

后台运行：

```
webster@UbuntuBase:/usr/local/docker/python$ docker-compose up -d

```

## Docker Compose常用命令

### 前台运行
```
docker-compose up
```
### 后台运行
```
docker-compose up -d
```
### 启动
```
docker-compose start
```
### 重新启动
```
docker-compose restart
```
### 停止
```
docker-compose stop
```
### 停止并移除容器
```
docker-compose down
```

## Docker Compose实例
Docker Compose 运行 MySQL

`docker-compose.yml` 配置文件：

```
version: '3.1'
services:
  mysql:
    restart: always
    image: mysql:5.7.22
    container_name: mysql
    ports:
      - 3306:3306
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
      --max_allowed_packet=128M
      --sql-mode="STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```
Docker Compose 运行 Tomcat

`docker-compose.yml` 配置文件：

```
version: '3.1'
services:
  tomcat:
    restart: always
    image: tomcat
    container_name: tomcat
    ports:
      - 8080:8080
    volumes:
      - /usr/local/docker/tomcat/webapps/test:/usr/local/tomcat/webapps/test
    environment:
      TZ: Asia/Shanghai
```
