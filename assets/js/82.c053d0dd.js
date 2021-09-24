(window.webpackJsonp=window.webpackJsonp||[]).push([[82],{247:function(t,e,n){"use strict";n.r(e);var s=n(0),i=Object(s.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"content"},[t._m(0),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),t._m(4),t._v(" "),n("ol",[n("li",[n("p",[n("a",{attrs:{href:"https://jenkins.io/download/",target:"_blank",rel:"noopener noreferrer"}},[t._v("下载Jenkins"),n("OutboundLink")],1),t._v("。")])]),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),t._m(8)]),t._v(" "),t._m(9),t._v(" "),t._m(10),t._v(" "),t._m(11),t._v(" "),n("p",[t._v("部署java应用，还需安装：")]),t._v(" "),t._m(12),t._v(" "),t._m(13),t._v(" "),t._m(14),t._m(15),t._m(16),t._v(" "),t._m(17),t._v(" "),n("p",[t._v("pipeline {\nagent any 1\nstages {\nstage('Build') { 2\nsteps {\n// 3\n}\n}\nstage('Test') { 4\nsteps {\n// 5\n}\n}\nstage('Deploy') { 6\nsteps {\n// 7\n}\n}\n}\n}")]),t._v(" "),t._m(18)])}),[function(){var t=this.$createElement,e=this._self._c||t;return e("h1",{attrs:{id:"持续集成"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#持续集成"}},[this._v("#")]),this._v(" 持续集成")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h2",{attrs:{id:"jenkins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#jenkins"}},[this._v("#")]),this._v(" Jenkins")])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"jenkins概述"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#jenkins概述"}},[this._v("#")]),this._v(" Jenkins概述")])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v("Jenkins是一个独立的开源自动化服务器，可用于自动执行与构建，测试，交付或部署软件相关的各种任务。\nJenkins可以通过本机系统软件包，Docker安装，甚至可以由安装了Java Runtime Environment（JRE）的任何机器独立运行。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"下载并运行jenkins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#下载并运行jenkins"}},[this._v("#")]),this._v(" 下载并运行Jenkins")])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("在下载目录中打开终端。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("运行java -jar jenkins.war --httpPort=8080。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("浏览到http://localhost:8080。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("li",[e("p",[this._v("按照说明完成安装。")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v("修改Jenkins启动的默认端口号方式：")]),this._v(" "),e("ol",[e("li",[this._v("在Jenkins安装目录下打开jenkins.xml")]),this._v(" "),e("li",[this._v("修改属性httpPort=8088")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h4",{attrs:{id:"运行环境"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#运行环境"}},[this._v("#")]),this._v(" 运行环境")])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v("macOS，Linux或Windows机器：256 MB的RAM，推荐超过512 MB。Jenkins和Docker镜像和容器的10 GB空间")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("ul",[e("li",[this._v("docker")]),this._v(" "),e("li",[this._v("git")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h3",{attrs:{id:"使用pipeline"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#使用pipeline"}},[this._v("#")]),this._v(" 使用Pipeline")])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-for java extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("pipeline {\n    agent { docker { image 'maven:3.3.3' } }\n    stages {\n        stage('build') {\n            steps {\n                sh 'mvn --version'\n            }\n        }\n    }\n}\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"language-node.js extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[this._v("pipeline {\n    agent { docker { image 'node:6.3' } }\n    stages {\n        stage('build') {\n            steps {\n                sh 'npm --version'\n            }\n        }\n    }\n}\n")])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("h4",{attrs:{id:"stage"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#stage"}},[this._v("#")]),this._v(" stage")])},function(){var t=this.$createElement,e=this._self._c||t;return e("blockquote",[e("p",[this._v('包含3个阶段，"Build", "Test" and "Deploy"。')])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ol",[n("li",[t._v("在任何可用的代理上执行此管道或其任何阶段。")]),t._v(" "),n("li",[t._v("定义“Build”阶段。stage块在Scripted Pipeline语法中是可选的。但是，stage在脚本管道中实现块可以更清晰地显示Jenkins UI中每个阶段的任务/步骤子集。")]),t._v(" "),n("li",[t._v("执行与“Build”阶段相关的一些步骤。")]),t._v(" "),n("li",[t._v("定义“Test”阶段。")]),t._v(" "),n("li",[t._v("执行与“Test”阶段相关的一些步骤。")]),t._v(" "),n("li",[t._v("定义“Deploy”阶段。")]),t._v(" "),n("li",[t._v("执行与“Deploy”阶段相关的一些步骤。")])])}],!1,null,null,null);e.default=i.exports}}]);