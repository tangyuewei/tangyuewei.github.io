(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{226:function(e,t,s){"use strict";s.r(t);var r=s(0),a=Object(r.a)({},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"content"},[e._m(0),e._v(" "),e._m(1),e._v(" "),e._m(2),e._v(" "),s("p",[s("a",{attrs:{href:"http://memcached.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("MemCache的官方网站"),s("OutboundLink")],1)]),e._v(" "),e._m(3),e._v(" "),e._m(4),e._v(" "),e._m(5),e._v(" "),e._m(6),e._v(" "),e._m(7),e._v(" "),s("p",[e._v("如果set的key已经存在，该命令可以更新该key所对应的原来的数据，也就是实现更新的作用。")]),e._v(" "),e._m(8),e._v(" "),e._m(9),e._m(10),e._v(" "),e._m(11),e._v(" "),s("p",[e._v("如果 add 的 key 已经存在，则不会更新数据(过期的 key 会更新)，之前的值将仍然保持相同，并且您将获得响应 NOT_STORED。")]),e._v(" "),e._m(12),e._v(" "),e._m(13),e._v(" "),s("p",[e._v("如果 key 不存在，则替换失败，并且您将获得响应 NOT_STORED。")]),e._v(" "),e._m(14),e._v(" "),e._m(15),e._v(" "),e._m(16),e._v(" "),e._m(17),e._v(" "),e._m(18),e._v(" "),e._m(19),e._v(" "),s("p",[e._v("输出信息说明：")]),e._v(" "),e._m(20),e._v(" "),e._m(21),e._v(" "),e._m(22),e._v(" "),e._m(23),e._v(" "),e._m(24),e._v(" "),e._m(25),s("p",[e._v("gets 命令的输出结果中，在最后一列的数字 1 代表了 key 为 runoob 的 CAS 令牌。")]),e._v(" "),e._m(26),e._v(" "),e._m(27),e._v(" "),e._m(28),e._v(" "),e._m(29),e._v(" "),e._m(30),e._v(" "),e._m(31),e._v(" "),e._m(32),e._v(" "),e._m(33),e._v(" "),e._m(34),e._v(" "),e._m(35),e._v(" "),e._m(36),e._v(" "),e._m(37),e._v(" "),e._m(38),e._v(" "),e._m(39),e._v(" "),e._m(40),e._v(" "),s("p",[e._v("可选参数time，用于在指定的时间后执行清理缓存操作。")])])},[function(){var e=this.$createElement,t=this._self._c||e;return t("h1",{attrs:{id:"memcached"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#memcached","aria-hidden":"true"}},[this._v("#")]),this._v(" MemCached")])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"概述"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#概述","aria-hidden":"true"}},[this._v("#")]),this._v(" 概述")])},function(){var e=this.$createElement,t=this._self._c||e;return t("blockquote",[t("p",[this._v("MemCache是一个自由、源码开放、高性能、分布式的分布式内存对象缓存系统，用于动态Web应用以减轻数据库的负载。它通过在内存中缓存数据和对象来减少读取数据库的次数，从而提高了网站访问的速度。MemCaChe是一个存储键值对的HashMap，在内存中对任意的数据（比如字符串、对象等）所使用的key-value存储，数据可以来自数据库调用、API调用，或者页面渲染的结果。MemCache设计理念就是小而强大，它简单的设计促进了快速部署、易于开发并解决面对大规模的数据缓存的许多难题，而所开放的API使得MemCache能用于Java、C/C++/C#、Perl、Python、PHP、Ruby等大部分流行的程序语言。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"特点"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#特点","aria-hidden":"true"}},[this._v("#")]),this._v(" 特点")])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("协议简单")]),this._v(" "),t("li",[this._v("基于libevent的事件处理")]),this._v(" "),t("li",[this._v("内置内存存储方式")]),this._v(" "),t("li",[this._v("memcached不互相通信的分布式")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"memcached-存储命令"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#memcached-存储命令","aria-hidden":"true"}},[this._v("#")]),this._v(" Memcached 存储命令")])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("set 命令:将 value 存储在指定的 key 中。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("set key flags exptime bytes [noreply] value")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ul",[s("li",[e._v("key：键值 key-value 结构中的 key，用于查找缓存值。")]),e._v(" "),s("li",[e._v("flags：可以包括键值对的整型参数，客户机使用它存储关于键值对的额外信息 。")]),e._v(" "),s("li",[e._v("exptime：在缓存中保存键值对的时间长度（以秒为单位，0 表示永远）")]),e._v(" "),s("li",[e._v("bytes：在缓存中存储的字节数")]),e._v(" "),s("li",[e._v("noreply（可选）： 该参数告知服务器不需要返回数据")]),e._v(" "),s("li",[e._v("value：存储的值（始终位于第二行）（可直接理解为key-value结构中的value）")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"language-sql extra-class"},[s("pre",{pre:!0,attrs:{class:"language-sql"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("set")]),e._v(" hello "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("900")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("9")]),e._v("\nmemcached\nSTORED\n\nget hello\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("VALUE")]),e._v(" hello "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("9")]),e._v("\nmemcached\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("END")]),e._v("\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("add 命令:将 value 存储在指定的 key 中。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("add key flags exptime bytes [noreply] value")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("replace 命令:替换已存在的 key 的 value。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("replace key flags exptime bytes [noreply] value")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("append 命令:已存在 key 的 value 后面追加数据 。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("append key flags exptime bytes [noreply] value")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("prepend 命令:向已存在 key 的 value 前面追加数据。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("prepend key flags exptime bytes [noreply] value")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v('CAS 命令:用于执行一个"检查并设置"的操作它仅在当前客户端最后一次取值后，该key 对应的值没有被其他客户端修改的情况下， 才能够将值写入。检查是通过cas_token参数进行的， 这个参数是Memcach指定给已经存在的元素的一个唯一的64位值。')])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("cas key flags exptime bytes unique_cas_token [noreply] value")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ul",[s("li",[e._v("STORED：保存成功。")]),e._v(" "),s("li",[e._v("ERROR：保存失败。")]),e._v(" "),s("li",[e._v("NOT_STORED：该键在 Memcached 上不存在。")]),e._v(" "),s("li",[e._v("CLIENT_ERROR：执行错误。")]),e._v(" "),s("li",[e._v("EXISTS：在最后一次取值后另外一个用户也在更新该数据。")]),e._v(" "),s("li",[e._v("NOT_FOUND：Memcached 服务上不存在该键值。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"memcached-查找命令"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#memcached-查找命令","aria-hidden":"true"}},[this._v("#")]),this._v(" Memcached 查找命令")])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("get 命令:获取存储在 key 中的 value ，如果 key 不存在，则返回空。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("get key")]),this._v(" 或者 "),t("code",[this._v("get key1 key2 key3")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("gets 命令:获取带有 CAS 令牌存 的 value ，如果 key 不存在，则返回空。")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"language-sql extra-class"},[s("pre",{pre:!0,attrs:{class:"language-sql"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("set")]),e._v(" runoob "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("900")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("9")]),e._v("\nmemcached\nSTORED\ngets runoob\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("VALUE")]),e._v(" runoob "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("0")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("9")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("1")]),e._v("\nmemcached\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("END")]),e._v("\n")])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("delete 命令:删除已存在的 key。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("delete key [noreply]")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("incr 与 decr 命令:已存在的 key 的数字值进行自增或自减操作。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("incr key incr_value")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("h2",{attrs:{id:"memcached-统计命令"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#memcached-统计命令","aria-hidden":"true"}},[this._v("#")]),this._v(" Memcached 统计命令")])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("stats 命令:返回统计信息例如 PID(进程号)、版本号、连接数等。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("stats")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("stats items 命令:显示各个 slab 中 item 的数目和存储时长(最后一次访问距离现在的秒数)。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("stats items")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("stats slabs 命令:显示各个slab的信息，包括chunk的大小、数目、使用情况等。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("stats slabs")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("stats sizes 命令:显示所有item的大小和个数。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("stats sizes")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("ul",[t("li",[this._v("flush_all 命令:清理缓存中的所有 key=>value对。")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("code",[this._v("flush_all [time] [noreply]")])])}],!1,null,null,null);t.default=a.exports}}]);