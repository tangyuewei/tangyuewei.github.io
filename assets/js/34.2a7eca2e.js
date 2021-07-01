(window.webpackJsonp=window.webpackJsonp||[]).push([[34],{212:function(t,a,s){"use strict";s.r(a);var e=s(0),r=Object(e.a)({},function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"content"},[t._m(0),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),t._m(4),t._v(" "),s("p",[s("a",{attrs:{href:"https://shardingsphere.apache.org",target:"_blank",rel:"noopener noreferrer"}},[t._v("官网"),s("OutboundLink")],1)]),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),t._m(8),t._v(" "),t._m(9),t._v(" "),t._m(10),t._v(" "),t._m(11),t._v(" "),t._m(12),t._v(" "),t._m(13),t._v(" "),t._m(14),t._m(15),t._v(" "),t._m(16)])},[function(){var t=this.$createElement,a=this._self._c||t;return a("h1",{attrs:{id:"分布式数据库"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#分布式数据库","aria-hidden":"true"}},[this._v("#")]),this._v(" 分布式数据库")])},function(){var t=this.$createElement,a=this._self._c||t;return a("h2",{attrs:{id:"shardingsphere"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#shardingsphere","aria-hidden":"true"}},[this._v("#")]),this._v(" ShardingSphere")])},function(){var t=this.$createElement,a=this._self._c||t;return a("h3",{attrs:{id:"概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#概述","aria-hidden":"true"}},[this._v("#")]),this._v(" 概述")])},function(){var t=this.$createElement,a=this._self._c||t;return a("blockquote",[a("p",[this._v("定位为轻量级Java框架，在Java的JDBC层提供的额外服务。 它使用客户端直连数据库，以jar包形式提供服务，无需额外部署和依赖，可理解为增强版的JDBC驱动，完全兼容JDBC和各种ORM框架。")])])},function(){var t=this.$createElement,a=this._self._c||t;return a("ul",[a("li",[this._v("适用于任何基于Java的ORM框架，如：JPA, Hibernate, Mybatis, Spring JDBC Template或直接使用JDBC。")]),this._v(" "),a("li",[this._v("基于任何第三方的数据库连接池，如：DBCP, C3P0, BoneCP, Druid, HikariCP等。")]),this._v(" "),a("li",[this._v("支持任意实现JDBC规范的数据库。目前支持MySQL，Oracle，SQLServer和PostgreSQL。")])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h3",{attrs:{id:"功能列表"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#功能列表","aria-hidden":"true"}},[this._v("#")]),this._v(" 功能列表")])},function(){var t=this.$createElement,a=this._self._c||t;return a("h4",{attrs:{id:"数据分片"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数据分片","aria-hidden":"true"}},[this._v("#")]),this._v(" 数据分片")])},function(){var t=this.$createElement,a=this._self._c||t;return a("ul",[a("li",[this._v("分库 & 分表")]),this._v(" "),a("li",[this._v("读写分离")]),this._v(" "),a("li",[this._v("分片策略定制化")]),this._v(" "),a("li",[this._v("无中心化分布式主键")])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h4",{attrs:{id:"分布式事务"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#分布式事务","aria-hidden":"true"}},[this._v("#")]),this._v(" 分布式事务")])},function(){var t=this.$createElement,a=this._self._c||t;return a("ul",[a("li",[this._v("标准化事务接口")]),this._v(" "),a("li",[this._v("XA强一致事务")]),this._v(" "),a("li",[this._v("柔性事务")])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h4",{attrs:{id:"数据库治理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数据库治理","aria-hidden":"true"}},[this._v("#")]),this._v(" 数据库治理")])},function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ul",[s("li",[t._v("配置动态化")]),t._v(" "),s("li",[t._v("编排 & 治理")]),t._v(" "),s("li",[t._v("数据脱敏")]),t._v(" "),s("li",[t._v("可视化链路追踪")]),t._v(" "),s("li",[t._v("弹性伸缩(规划中)")])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h3",{attrs:{id:"读写分离"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#读写分离","aria-hidden":"true"}},[this._v("#")]),this._v(" 读写分离")])},function(){var t=this.$createElement,a=this._self._c||t;return a("ul",[a("li",[this._v("引入pom依赖")])])},function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"language-xml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("dependency")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("groupId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("org.apache.shardingsphere"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("groupId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("artifactId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("sharding-jdbc-spring-boot-starter"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("artifactId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("version")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("4.0.0-RC1"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("version")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("dependency")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])])},function(){var t=this.$createElement,a=this._self._c||t;return a("ul",[a("li",[this._v("配置properties")])])},function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"language-properties extra-class"},[s("pre",{pre:!0,attrs:{class:"language-properties"}},[s("code",[s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.names")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("master,slave0,slave1")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.master.type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.zaxxer.hikari.HikariDataSource")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.master.driver-class-name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.mysql.cj.jdbc.Driver")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.master.url")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("jdbc:mysql://localhost:3306/master")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.master.username")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("root")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.master.password")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave0.type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.zaxxer.hikari.HikariDataSource")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave0.driver-class-name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.mysql.cj.jdbc.Driver")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave0.url")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("jdbc:mysql://localhost:3306/slave0")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave0.username")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("root")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave0.password")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave1.type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.zaxxer.hikari.HikariDataSource")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave1.driver-class-name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("com.mysql.cj.jdbc.Driver")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave1.url")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("jdbc:mysql://localhost:3306/slave1")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave1.username")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("root")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.datasource.slave1.password")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.masterslave.load-balance-algorithm-type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("round_robin")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.masterslave.name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("ms")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.masterslave.master-data-source-name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("master")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.masterslave.slave-data-source-names")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("slave0,slave1")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("spring.shardingsphere.props.sql.show")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[t._v("true")]),t._v("\n")])])])}],!1,null,null,null);a.default=r.exports}}]);