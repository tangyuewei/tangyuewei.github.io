(window.webpackJsonp=window.webpackJsonp||[]).push([[59],{224:function(t,a,s){"use strict";s.r(a);var e=s(0),r=Object(e.a)({},(function(){var t=this.$createElement;this._self._c;return this._m(0)}),[function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"content"},[s("h1",{attrs:{id:"类的加载机制"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#类的加载机制"}},[t._v("#")]),t._v(" 类的加载机制")]),t._v(" "),s("blockquote",[s("p",[t._v("加载->验证->准备->解析->初始化->使用->卸载，7个阶段。其中验证、准备、解析3个部分统称为连接。")])]),t._v(" "),s("h2",{attrs:{id:"加载"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#加载"}},[t._v("#")]),t._v(" 加载")]),t._v(" "),s("ol",[s("li",[t._v("通过一个类的全限定名来获取类的二进制字节流。")]),t._v(" "),s("li",[t._v("将这个字节流所代表的静态储存结构转化为方法区的运行时数据结构。")]),t._v(" "),s("li",[t._v("内存中生成java.lang.Class对象（HotSpot中存于方法区），作为方法区这个类的各种数据的访问入口。")])]),t._v(" "),s("h2",{attrs:{id:"验证"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#验证"}},[t._v("#")]),t._v(" 验证")]),t._v(" "),s("blockquote",[s("p",[t._v("这一阶段的目的是为了确保Class文件的字节流中包含的信息符合当前虚拟机的要求，并且不会危害虚拟机自身的安全")])]),t._v(" "),s("h2",{attrs:{id:"准备"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#准备"}},[t._v("#")]),t._v(" 准备")]),t._v(" "),s("blockquote",[s("p",[t._v("为类的静态变量分配内存，并将其初始化为默认值。基本数据类型初始值为0,引用数据类型初始值为null")])]),t._v(" "),s("h2",{attrs:{id:"解析"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#解析"}},[t._v("#")]),t._v(" 解析")]),t._v(" "),s("blockquote",[s("p",[t._v("将类的二进制数据中的符号引用全部替换为直接引用。")])]),t._v(" "),s("h2",{attrs:{id:"初始化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#初始化"}},[t._v("#")]),t._v(" 初始化")]),t._v(" "),s("blockquote",[s("p",[t._v("为类的静态变量赋予正确的初始值，JVM负责对类进行初始化，主要对类变量进行初始化")])]),t._v(" "),s("ul",[s("li",[t._v("声明类变量是指定初始值")]),t._v(" "),s("li",[t._v("使用静态代码块为类变量指定初始值")])])])}],!1,null,null,null);a.default=r.exports}}]);