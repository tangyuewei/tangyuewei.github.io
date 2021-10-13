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
右键Git Bash Here
```$bash
bash deploy.sh
```



