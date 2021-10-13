# 安装git

#  配置ssh

``` ssh-keygen -t rsa -C "472680811@qq.com" ```

``` cd ~/.ssh/ ```

``` cat id_rsa.pub ```

# 安装nodejs

# 安装yarn

```$xslt
# 将 VuePress 作为一个本地依赖安装
yarn add -D vuepress # 或者：npm install -D vuepress
# 或者将 VuePress 作为一个全局依赖安装
# yarn global add vuepress # 或者：npm install -g vuepress

# 新建一个 docs 文件夹
mkdir docs

# 新建一个 markdown 文件
echo '# Hello VuePress!' > docs/README.md

# 开始写作
npx vuepress dev docs
```
# 配置启动
```
npm run docs:dev or vuepress run docs
```

## 新建deploy.sh,与docs同级
```
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
 echo 'www.tangyuewei.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:tangyuewei/tangyuewei.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```
## 新建package.json
```$javascript
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}

```
# 打包部署
- 右键`Git Bash Here`
```$bash
bash deploy.sh
```
- 使用`action`自动部署，在你项目仓库`.github/workflows`目录下创建一个`.yml文件`，举例：`vuepress-deploy.yml`。

内容：
```
name: Build and Deploy
on: [push]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@master

      - name: vuepress-deploy
        uses: jenkey2011/vuepress-deploy@master
        env:
          ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TARGET_REPO: tangyuewei/tangyuewei.github.io
          TARGET_BRANCH: master
          BUILD_SCRIPT: npm install && npm run docs:build
          BUILD_DIR: docs/.vuepress/dist/

```
**[创建token]**
>点击你的头像 > Settings > Developer settings > Personal access tokens > Generate new token. 权限至少要勾选repo，不清楚的，直接无脑全选就行~ 问题不大，不要慌。

**[创建secrets]**
> 你的vuepress项目源码仓库下 > Settings > Secrets， 创建ACCESS_TOKEN， 值就填写你刚才创建的token，确定。

## 参考资料
* [vuepress-deploy](https://github.com/jenkey2011/vuepress-deploy/blob/v1.8.1/README.zh-CN.md)
