---
sidebarDepth: 2
meta:
  - name: description
    content: 努力只是一种生活方式，先敬业，再乐业
  - name: keywords
    content: Git安装配置,Git与SVN区别,git创建克隆仓库,git分支管理,git生成ssh密钥
---

# GitFlow

## Git

Git 是一个开源的分布式版本控制系统，用于敏捷高效地处理任何或小或大的项目。

### Git 与 SVN 区别

1. Git 是分布式的，SVN 不是：这是 Git 和其它非分布式的版本控制系统，例如 SVN，CVS 等，最核心的区别。

2. Git 把内容按元数据方式存储，而 SVN 是按文件：所有的资源控制系统都是把文件的元信息隐藏在一个类似 .svn、.cvs 等的文件夹里。

3. Git 分支和 SVN 的分支不同：分支在 SVN 中一点都不特别，其实它就是版本库中的另外一个目录。

4. Git 没有一个全局的版本号，而 SVN 有：目前为止这是跟 SVN 相比 Git 缺少的最大的一个特征。

5. Git 的内容完整性要优于 SVN：Git 的内容存储使用的是 SHA-1 哈希算法。这能确保代码内容的完整性，确保在遇到磁盘故障和网络问题时降低对版本库的破坏。

### Git 安装配置

#### 安装

Git 目前支持 Linux/Unix、Solaris、Mac和 Windows 平台上运行。
> Git 各平台安装包下载地址为：http://git-scm.com/downloads

#### 配置

+ 用户配置
    + 配置个人的用户名称和电子邮件地址：
    ```git
    $ git config --global user.name "runoob"
    $ git config --global user.email test@runoob.com
    ```
   
+ 查看配置信息
    ```git
    $ git config --list
    ```
    
### git创建克隆仓库

+ 创建仓库
    - 使用当前目录作为Git仓库 
    ```git
    $ git init
    ```
    - 指定目录作为Git仓库
    ```git
    $ git init newrepo
    ```
    - 将文件纳入版本控制，先用 git add对这些文件进行跟踪，然后提交
    ```git
    $ git add *.java
    $ git add README.md
    $ git commit -m 'commit'
    ```
    
ps:以上命令将目录下以 .java 结尾及 README.md 文件提交到仓库中。

+ 克隆仓库
    克隆仓库的命令格式为：
    ```git
    $ git clone <repo> <directory>
    ```
> 参数说明：repo:Git 仓库,directory:本地目录。
git clone 时，协议包括 ssh, git, https 等，其中最常用的是 ssh，因为速度较快，还可以配置公钥免输入密码
```git
$ git clone git@github.com:18xm/test.git         --SSH协议
$ git clone git://github.com/18xm/test.git          --GIT协议
$ git clone https://github.com/18xm/test.git      --HTTPS协议
```
### git分支管理

- 列出分支
    ```git
    $ git branch
    ```
- 切换分支
    ```git
    $ git checkout (branchname)
    ```
- 创建分支
    ```git
    $ git branch (branchname)
    ```
- 合并分支
    ```git
    git merge (branchname)
    ```
- 删除分支
    ```git
    $ git branch -d (branchname)
    ```
### git标签

>你的项目达到一个重要的阶段，并希望永远记住那个特别的提交快照，你可以使用 git tag 给它打上标签。
1. 查看标签
    ```git
    $ git tag
    ```
2. 添加标签
    ```git
    $ git tag -a v1.0 
    ```
### git生成ssh密钥
1. 生成ssh key。
    ```git
    $ ssh-keygen -t rsa -C "youremail@example.com"
    ```
> 后面的邮箱改成自己的，之后会要求确认路径和输入密码，使用默认的一路回车就行。成功的话会在 ~/ 下生成 .ssh 文件夹，进去，打开 id_rsa.pub，复制里面的 key。
回到 git服务器上，进入账户配置添加ssh key。

2. 验证ssh key
    ```git
    $ ssh -T git@github.com
    ```
