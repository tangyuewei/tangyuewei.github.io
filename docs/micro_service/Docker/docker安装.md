---
sidebarDepth: 2
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: Docker,Docker安装,配置Docker加速器,APT安装 Docker
---

#  使用 APT 安装 Docker

## Docker安装
```
# 更新软件源
sudo apt-get update
# 安装所需依赖
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
# 安装 GPG 证书
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
# 新增软件源信息
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
# 再次更新软件源
sudo apt-get -y update
# 安装 Docker CE 版
sudo apt-get -y install docker-ce
```
## 配置用户组
```
# 建立 docker 用户组
sudo groupadd docker
# 将当前用户加入 docker 组：
sudo usermod -aG docker $USER
```

## 配置Docker 加速器

在 /etc/docker/daemon.json 中写入如下内容（如果文件不存在请新建该文件）

```yaml
#中国
{
  "registry-mirrors": [
    "https://registry.docker-cn.com"
  ]
}
#阿里云加速
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://20v9zh9c.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

```
验证加速器是否配置成功：
```
sudo systemctl restart docker
docker info
...
# 出现如下语句即表示配置成功
Registry Mirrors:
 https://registry.docker-cn.com/
...
```
DaoCloud 加速器

> 简介：DaoCloud 加速器 是广受欢迎的 Docker 工具，解决了国内用户访问 Docker Hub 缓慢的问题。DaoCloud 加速器结合国内的 CDN 服务与协议层优化，成倍的提升了下载速度。

(DaoCloud 官网)[https://www.daocloud.io/mirror#accelerator-doc]

```
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://95822026.m.daocloud.io
```
