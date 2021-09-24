(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{181:function(t,s,a){"use strict";a.r(s);var _=a(0),v=Object(_.a)({},(function(){var t=this.$createElement;this._self._c;return this._m(0)}),[function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"互联网协议"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#互联网协议"}},[t._v("#")]),t._v(" 互联网协议")]),t._v(" "),a("h2",{attrs:{id:"tcp-ip"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tcp-ip"}},[t._v("#")]),t._v(" TCP/IP")]),t._v(" "),a("h3",{attrs:{id:"模型"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#模型"}},[t._v("#")]),t._v(" 模型")]),t._v(" "),a("p",[a("img",{attrs:{src:"/tcp20190507152344.png",alt:"tcp模型",title:"tcp模型"}})]),t._v(" "),a("h3",{attrs:{id:"建立连接"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#建立连接"}},[t._v("#")]),t._v(" 建立连接")]),t._v(" "),a("p",[t._v("客户端与服务器建立一个 TCP 连接时需要总共发送三个包以确认连接的建立。\n"),a("img",{attrs:{src:"/tcplj20190507154041.png",alt:"建立连接",title:"三次握手建立连接"}})]),t._v(" "),a("ol",[a("li",[t._v("客户端将标志位SYN置为1，随机产生一个值seq=J，并将该数据包发送给服务器端，客户端进入SYN_SENT状态，等待服务器端确认。")]),t._v(" "),a("li",[t._v("服务器端收到数据包后由标志位SYN=1知道客户端请求建立连接，服务器端将标志位SYN和ACK都置为1，ack=J+1，随机产生一个值seq=K，并将该数据包发送给客户端以确认连接请求，服务器端进入SYN_RCVD状态。")]),t._v(" "),a("li",[t._v("客户端收到确认后，检查ack是否为J+1，ACK是否为1，如果正确则将标志位ACK置为1，ack=K+1，并将该数据包发送给服务器端，服务器端检查ack是否为K+1，ACK是否为1，如果正确则连接建立成功，客户端和服务器端进入ESTABLISHED状态，然后客户端与服务器端之间就可以开始传输数据了。")])]),t._v(" "),a("h3",{attrs:{id:"断开连接"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#断开连接"}},[t._v("#")]),t._v(" 断开连接")]),t._v(" "),a("p",[t._v("客户端与服务器断开连接时需要总共发送四个包以确认连接的断开。\n"),a("img",{attrs:{src:"/tcpdk20190507154540.png",alt:"断开连接",title:"四次握手断开连接"}})]),t._v(" "),a("ol",[a("li",[t._v("客户端发送一个FIN=M，用来关闭客户端到服务器端的数据传送，客户端进入FIN_WAIT_1状态。此时可以继续发送数据。")]),t._v(" "),a("li",[t._v("服务器端收到FIN后，向客户端发送ack=M+1。客户端进入FIN_WAIT_2 状态，继续等待服务器端的FIN报文。")]),t._v(" "),a("li",[t._v("服务器端确定数据已发送完成，则向客户端发送FIN=N报文。服务器准备关闭连接了，服务器端进入LAST_ACK状态。")]),t._v(" "),a("li",[t._v("客户端收到FIN=N报文后，发送ack=N+1后进入TIME_WAIT状态，如果Server端没有收到ACK则可以重传。服务器端收到ACK后，就知道可以断开连接了。（客户端等待了2MSL后依然没有收到回复，说明服务器端已关闭，客户端也可以关闭连接了）")])]),t._v(" "),a("h2",{attrs:{id:"http2-0"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#http2-0"}},[t._v("#")]),t._v(" HTTP2.0")]),t._v(" "),a("h3",{attrs:{id:"http概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#http概述"}},[t._v("#")]),t._v(" HTTP概述")]),t._v(" "),a("ul",[a("li",[t._v("HTTP历史：HTTP 建立之初，主要是为了将超文本标记语言(HTML)文档从Web服务器传送到客户端的浏览器。")]),t._v(" "),a("li",[t._v("HTTP的优化：带宽和延迟。\n"),a("ul",[a("li",[t._v("带宽：拨号上网的阶段，带宽可能会成为一个比较严重影响请求的问题，现在网络基础建设已经使得带宽得到极大的提升，不用再担心带宽影响网速了。")]),t._v(" "),a("li",[t._v("延迟：\n"),a("ul",[a("li",[t._v("浏览器阻塞（HOL blocking）：浏览器会因为某些原因阻塞请求。浏览器对于同一个域名，同时只能有 4 个连接（根据浏览器内核不同可能会有所差异），超过浏览器最大连接数限制，后续请求就会被阻塞。")]),t._v(" "),a("li",[t._v("DNS 查询（DNS Lookup）：浏览器需要知道目标服务器的 IP 才能建立连接。将域名解析为 IP 的这个系统就是 DNS。通常可以利用DNS缓存结果来减少这个时间。")]),t._v(" "),a("li",[t._v("建立连接（Initial connection）：HTTP 是基于 TCP 协议的，浏览器最快也要在第三次握手时才能建立连接，连接无法复用会导致每次请求都经历三次握手和慢启动。三次握手在高延迟的场景下影响较明显，慢启动则对文件类的大请求影响较大。")])])])])])]),t._v(" "),a("blockquote",[a("p",[t._v("互联网专家们将新一代加密协议称为“HTTP 2.0”。")])]),t._v(" "),a("h3",{attrs:{id:"http2-0特点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#http2-0特点"}},[t._v("#")]),t._v(" HTTP2.0特点")]),t._v(" "),a("ol",[a("li",[t._v("二进制传输\nhttp2.0采用二进制传输，相较于文本传输的http1.0来说更加安全可靠。")]),t._v(" "),a("li",[t._v("多路复用\nhttp1.0一个连接只能提交一个请求，而http2.0可以同时处理多个请求，可以降低连接的占用数量，提升网络的速度。")]),t._v(" "),a("li",[t._v("头部压缩\nhttp2.0使用HPACK算法对头部进行压缩，既避免了重复header的传输，又减小了需要传输数据的大小。")]),t._v(" "),a("li",[t._v("服务端推送\n服务端可以主动推送资源给客户端，避免客户端花过多的时间逐个请求资源，降低整个请求的响应时间。")])]),t._v(" "),a("h2",{attrs:{id:"https"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https"}},[t._v("#")]),t._v(" HTTPS")]),t._v(" "),a("h3",{attrs:{id:"https概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#https概述"}},[t._v("#")]),t._v(" HTTPS概述")]),t._v(" "),a("p",[t._v("HTTPS是HTTP的安全版，HTTPS的安全基础是SSL，HTTPS是让HTTP先和SSL（Secure Sockets Layer）通信，再由SSL和TCP通信。即HTTPS使用了隧道进行通信。\nHTTPS = HTTP+SSL/TLS。")]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("通过使用 SSL，HTTPs 具有了加密（防窃听）、认证（防伪装）和完整性保护（防篡改）")])]),t._v(" "),a("blockquote",[a("p",[t._v("由于HTTP报文的不安全性，网景在1994年就创建了HTTPS，并用在浏览器中。最初HTTPS是和SSL一起使用，然后演化为TLS。SSL／TLS在OSI模型中都是表示层的协议。SSL使 用40 位关键字作为RC4流加密算法，这对于商业信息的加密是合适的。")])]),t._v(" "),a("h3",{attrs:{id:"http升级https"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#http升级https"}},[t._v("#")]),t._v(" HTTP升级HTTPS")]),t._v(" "),a("ol",[a("li",[t._v("CA证书，大部分证书都是需要收费的，当然，自己在服务器上用openssl也可以，不过浏览器会提示当前私密连接不安全这个警告，普通人看到这种信息是不会继续浏览的，所以，想使用HTTPS，可以使用Let's Encrypt，由谷歌等公司推行。")]),t._v(" "),a("li",[t._v("HTTPS性能优化，SSL握手，HTTPS 对速度会有一定程度的降低，但是只要经过合理优化和部署，HTTPS 对速度的影响完全可以接受。")]),t._v(" "),a("li",[t._v("CPU计算压力，HTTPS中大量的秘钥算法计算，对CPU会有一定的压力。")]),t._v(" "),a("li",[t._v("http和https使用的是完全不同的连接方式，http端口是80，https端口是443。")])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("HTTPS下的网站，所有子链都要使用HTTPS。")])]),t._v(" "),a("h2",{attrs:{id:"oauth-2-0"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#oauth-2-0"}},[t._v("#")]),t._v(" OAuth 2.0")]),t._v(" "),a("h3",{attrs:{id:"概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#概述"}},[t._v("#")]),t._v(" 概述")]),t._v(" "),a("blockquote",[a("p",[t._v("OAuth 2.0是行业标准的授权协议。OAuth 2.0取代了2006年创建的原始OAuth协议所做的工作.OAuth 2.0专注于客户端开发人员的简单性，同时为Web应用程序，桌面应用程序，移动电话和客厅设备提供特定的授权流程。该规范及其扩展正在IETF OAuth工作组内开发。")])]),t._v(" "),a("p",[t._v("OAuth 就是一种授权机制。数据的所有者告诉系统，同意授权第三方应用进入系统，获取这些数据。系统从而产生一个短期的进入令牌（token），用来代替密码，供第三方应用使用。")]),t._v(" "),a("h3",{attrs:{id:"授权方式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#授权方式"}},[t._v("#")]),t._v(" 授权方式")]),t._v(" "),a("ul",[a("li",[t._v("授权码（authorization-code）\n"),a("ul",[a("li",[t._v("申请一个授权码")]),t._v(" "),a("li",[t._v("用授权码获取令牌")])])])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("安全性高")])]),t._v(" "),a("ul",[a("li",[t._v("隐藏式（implicit）\n"),a("ul",[a("li",[t._v("直接向前端颁发令牌")])])])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("安全性低（只能用于安全要求不高的场景，并且令牌的有效期必须非常短，通常就是会话期间（session）有效，浏览器关掉，令牌就失效了。）")])]),t._v(" "),a("ul",[a("li",[t._v("密码式（password）\n"),a("ul",[a("li",[t._v("用户名和密码，直接告诉该应用")])])])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("用户高度信任的应用（暴露了用户名和密码）")])]),t._v(" "),a("ul",[a("li",[t._v("客户端凭证（client credentials）\n"),a("ul",[a("li",[t._v("在命令行下请求令牌")])])])]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("一般针对第三方应用，而不是针对用户的，即有可能多个用户共享同一个令牌。")])]),t._v(" "),a("h3",{attrs:{id:"更新令牌"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#更新令牌"}},[t._v("#")]),t._v(" 更新令牌")]),t._v(" "),a("p",[t._v("令牌到期前，用户使用 refresh token 发一个请求，去更新令牌。")]),t._v(" "),a("h2",{attrs:{id:"rest"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#rest"}},[t._v("#")]),t._v(" REST")]),t._v(" "),a("h3",{attrs:{id:"概述-2"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#概述-2"}},[t._v("#")]),t._v(" 概述")]),t._v(" "),a("p",[t._v("一种软件架构风格，REST的架构风格是针对Web应用设计和开发的，它使得HTTP协议的原本面貌得以被了解。使用REST可以降低开发的复杂性，提高系统的可伸缩性。如今，REST架构已经成为主流技术。")]),t._v(" "),a("h3",{attrs:{id:"rest的设计标准"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#rest的设计标准"}},[t._v("#")]),t._v(" REST的设计标准")]),t._v(" "),a("ol",[a("li",[t._v("网络上的所有事物都被抽象为资源（resource）。")]),t._v(" "),a("li",[t._v("每个资源对应一个唯一的资源标识符（resource identifier）。")]),t._v(" "),a("li",[t._v("通过通用的连接器接口（generic connector interface）对资源进行操作。")]),t._v(" "),a("li",[t._v("对资源的各种操作不会改变资源标识符。")]),t._v(" "),a("li",[t._v("所有的操作都是无状态的（stateless）。")])])])}],!1,null,null,null);s.default=v.exports}}]);