(window.webpackJsonp=window.webpackJsonp||[]).push([[60],{225:function(a,t,s){"use strict";s.r(t);var e=s(0),v=Object(e.a)({},(function(){var a=this.$createElement;this._self._c;return this._m(0)}),[function(){var a=this,t=a.$createElement,s=a._self._c||t;return s("div",{staticClass:"content"},[s("h1",{attrs:{id:"线程查看辅助工具"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#线程查看辅助工具"}},[a._v("#")]),a._v(" 线程查看辅助工具")]),a._v(" "),s("h2",{attrs:{id:"jstack"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#jstack"}},[a._v("#")]),a._v(" jstack")]),a._v(" "),s("blockquote",[s("p",[a._v('jstack是java虚拟机自带的一种堆栈跟踪工具。jstack用于打印出给定的java进程ID或core file或远程调试服务的Java堆栈信息，如果是在64位机器上，需要指定选项"-J-d64"，Windows的jstack使用方式只支持以下的这种方式：\n'),s("code",[a._v("jstack -l pid")])])]),a._v(" "),s("h3",{attrs:{id:"线程状态"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#线程状态"}},[a._v("#")]),a._v(" 线程状态")]),a._v(" "),s("ul",[s("li",[a._v("NEW\n"),s("blockquote",[s("p",[a._v("线程刚刚被创建,但是还没有调用start()方法，jstack命令不会列出处于此状态的线程信息")])])]),a._v(" "),s("li",[a._v("RUNNABLE\n"),s("blockquote",[s("p",[a._v("线程是可运行的")])])]),a._v(" "),s("li",[a._v("BLOCKED\n"),s("blockquote",[s("p",[a._v("线程处于阻塞状态")])])]),a._v(" "),s("li",[a._v("WAITING\n"),s("blockquote",[s("p",[a._v("线程处于等待状态")])])]),a._v(" "),s("li",[a._v("TIMED_WAITING\n"),s("blockquote",[s("p",[a._v("线程等待指定的时间")])])]),a._v(" "),s("li",[a._v("TERMINATED\n"),s("blockquote",[s("p",[a._v("线程终止")])])])]),a._v(" "),s("h2",{attrs:{id:"jmap"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#jmap"}},[a._v("#")]),a._v(" jmap")]),a._v(" "),s("p",[a._v("查看Java 堆（heap）使用情况")]),a._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("jmap -heap pid\n")])])]),s("p",[a._v("将内存使用的详细情况输出到文件")]),a._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v(" jmap - dump  pid\n")])])]),s("h2",{attrs:{id:"jconsole"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#jconsole"}},[a._v("#")]),a._v(" jconsole")]),a._v(" "),s("blockquote",[s("p",[a._v("Jconsole （Java Monitoring and Management Console），一种基于JMX的可视化监视、管理工具")])]),a._v(" "),s("ul",[s("li",[a._v("点击JDK/bin 目录下面的jconsole.exe 即可启动")]),a._v(" "),s("li",[a._v("然后会自动自动搜索本机运行的所有虚拟机进程。")]),a._v(" "),s("li",[a._v("选择其中一个进程可开始进行监控")])])])}],!1,null,null,null);t.default=v.exports}}]);