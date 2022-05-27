module.exports = {
  title: '唐悦玮',
  head: [
    ['script', {
      async: true ,
      crossOrigin: 'anonymous',
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8206366799920052'
    }]
  ],
  description: '努力只是一种生活方式，先敬业，再乐业',
  keywords: '唐悦玮,唐悦玮简介,唐悦玮的博客,唐悦玮博客,全景网唐悦玮',
  base: '/',
  host: '0.0.0.0',
  //mac下port未生效
  //port: 8081,
  locales: {
    '/': {
      lang: 'zh-CN',//多语言设置，可以修正显示时间
    }
  },
  themeConfig: {
    //gitc 仓库地址https://github.com/tangyuewei
    //repo: 'http://www.tangyuewei.com:8080',
    //导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '技术博客', link: '/technical/' },
      { text: '管理思维', link: '/article/' },
      { text: '微服务架构', link: '/micro_service/' },
      { text: '博客系统', link: 'http://blog.tangyuewei.com/' },
    ],
    sidebar:  [
      {
        title: '计算机基础', // 侧边栏名称
        //collapsable: false, // 是否折叠起来，默认折叠true
        children: [
          '/computer_foundation/计算机基础.md',
          '/computer_foundation/操作系统.md',
          '/computer_foundation/计算机网络.md',
          '/computer_foundation/互联网协议.md',
        ]
      },
      {
        title: 'Java编程',
        //collapsable: false,
        children: [
          '/java/Java.md',
          '/java/开发工具.md',
          '/java/版本控制.md',
          '/java/markdown语法.md',
          '/java/开发常用工具类.md',
          '/java/后台框架.md',
          '/java/服务器.md',
          '/java/项目构建.md',
          '/java/数据安全.md',
          '/java/单元测试.md',
        ]
      },
      {
        title: 'JVM',
        //collapsable: false,
        children: [
          '/jvm/初识虚拟机.md',
          '/jvm/类的加载机制.md',
          '/jvm/内存模型.md',
          '/jvm/GC.md',
          '/jvm/线程查看辅助工具.md',
        ]
      },
      {
        title: 'Spring Boot',
        //collapsable: false,
        children: [
          '/micro_service/Spring Boot/Spring Boot简介.md',
          '/micro_service/Spring Boot/第一个Spring Boot应用程序.md',
          '/micro_service/Spring Boot/Spring Boot单元测试.md',
          '/micro_service/Spring Boot/Spring Boot常用配置.md',
          '/micro_service/Spring Boot/Thymeleaf简介.md',
          '/micro_service/Spring Boot/第一个Thymeleaf页面.md',
          '/micro_service/Spring Boot/Spring Boot整合HikariCP.md',
          '/micro_service/Spring Boot/Spring Boot整合TkMyBatis.md',
        ]
      },
      {
        title: '软件工程',
        //collapsable: false,
        children: [
          '/software_engineering/持续集成.md',
          '/software_engineering/七大原则.md',
        ]
      },
      {
        title: '设计模式',
        //collapsable: false,
        children: [
          '/design_pattern/单例模式.md',
          '/design_pattern/工厂模式.md',
          '/design_pattern/代理模式.md',
          '/design_pattern/观察者模式.md',
          '/design_pattern/责任链模式.md',
          '/design_pattern/适配器模式.md',
        ]
      },
      {
        title: 'Linux',
        //collapsable: false,
        children: [
          '/linux/常用命令.md',
        ]
      },
      {
        title: '数据',
        //collapsable: false,
        children: [
          '/data/MySql.md',
          '/data/MongoDB.md',
          '/data/Redis.md',
          '/data/MemCached.md',
        ]
      },
      {
        title: '算法与数据结构',
        //collapsable: false,
        children: [
          '/algorithms/算法与数据结构.md',
          '/algorithms/字符串查找与匹配.md',
          '/algorithms/数组.md',
          '/algorithms/树.md',
          '/algorithms/队列.md',
          '/algorithms/排序.md',
          '/algorithms/栈.md',
          '/algorithms/链表.md',
          '/algorithms/哈希.md',
        ]
      },
      {
        title: '分布式系统',
        //collapsable: false,
        children: [
          '/distributed/分布式系统.md',
          '/distributed/分布式session.md',
          '/distributed/分布式缓存.md',
          '/distributed/分布式数据库.md',
          '/distributed/负载均衡.md',
          '/distributed/消息队列.md',
          '/distributed/服务注册与发现.md',
          '/distributed/虚拟化容器.md',
          '/distributed/服务熔断.md',
          '/distributed/服务路由.md',
        ]
      },
    ],
    sidebarDepth: 1, //侧边栏会自动地显示由当前页面的标题。默认值：1
    displayAllHeaders: true,// 侧边栏显示所有页面的标题链接。默认值：false
    activeHeaderLinks: false, // 嵌套的标题链接默认值：true
    //搜索
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: '上次更新', // string | boolean
  },
}
