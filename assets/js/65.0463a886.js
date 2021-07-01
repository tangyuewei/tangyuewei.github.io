(window.webpackJsonp=window.webpackJsonp||[]).push([[65],{181:function(v,_,a){"use strict";a.r(_);var t=a(0),i=Object(t.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var v=this,_=v.$createElement,a=v._self._c||_;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"微服务架构"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#微服务架构","aria-hidden":"true"}},[v._v("#")]),v._v(" 微服务架构")]),v._v(" "),a("h2",{attrs:{id:"什么是微服务（what）"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么是微服务（what）","aria-hidden":"true"}},[v._v("#")]),v._v(" 什么是微服务（what）")]),v._v(" "),a("h3",{attrs:{id:"概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#概述","aria-hidden":"true"}},[v._v("#")]),v._v(" 概述")]),v._v(" "),a("blockquote",[a("p",[v._v("微服务 - 也称为微服务架构 - 是一种架构风格，它将应用程序构建为一组服务")])]),v._v(" "),a("ul",[a("li",[v._v("根据业务模块划分服务类别")]),v._v(" "),a("li",[v._v("可以独立部署且互相隔离")]),v._v(" "),a("li",[v._v("可以通过轻量级API调用")]),v._v(" "),a("li",[v._v("高度可维护和可测试")])]),v._v(" "),a("h2",{attrs:{id:"微服务需要解决的问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#微服务需要解决的问题","aria-hidden":"true"}},[v._v("#")]),v._v(" 微服务需要解决的问题")]),v._v(" "),a("ul",[a("li",[v._v("多个服务如何访问")]),v._v(" "),a("li",[v._v("多个服务如何治理")]),v._v(" "),a("li",[v._v("服务挂了问题")]),v._v(" "),a("li",[v._v("多个服务间通信")])]),v._v(" "),a("h2",{attrs:{id:"什么情况下应该使用微服务（why）"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#什么情况下应该使用微服务（why）","aria-hidden":"true"}},[v._v("#")]),v._v(" 什么情况下应该使用微服务（why）")]),v._v(" "),a("h3",{attrs:{id:"优点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#优点","aria-hidden":"true"}},[v._v("#")]),v._v(" 优点")]),v._v(" "),a("ul",[a("li",[v._v("支持大型复杂应用程序的持续交付和部署。\n"),a("ul",[a("li",[v._v("改进的可维护性 - 每项服务都相对较小，因此更易于理解和更改")]),v._v(" "),a("li",[v._v("更好的可测试性 - 测试服务更小，速度更快")]),v._v(" "),a("li",[v._v("更好的可部署性 - 可以独立部署服务")]),v._v(" "),a("li",[v._v("它使您能够围绕多个自治团队组织开发工作。每个（所谓的两个披萨）团队拥有并负责一项或多项服务。每个团队都可以独立于所有其他团队开发，测试，部署和扩展他们的服务。")])])]),v._v(" "),a("li",[v._v("每个微服务都相对较小：\n"),a("ul",[a("li",[v._v("开发人员更容易理解")]),v._v(" "),a("li",[v._v("IDE可以更快地提高开发人员的工作效率")]),v._v(" "),a("li",[v._v("应用程序启动速度更快，这使开发人员的工作效率更高，并加快了部署速度")])])]),v._v(" "),a("li",[v._v("改善了故障隔离。例如，如果一个服务中存在内存泄漏，则只会影响该服务。其他服务将继续处理请求。相比之下，单片架构中的一个行为不当的组件可能会导致整个系统崩溃。")]),v._v(" "),a("li",[v._v("消除对技术堆栈的任何长期承诺。在开发新服务时，您可以选择新的技术堆栈。同样，在对现有服务进行重大更改时，您可以使用新技术堆栈重写它。")])]),v._v(" "),a("h3",{attrs:{id:"缺点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#缺点","aria-hidden":"true"}},[v._v("#")]),v._v(" 缺点")]),v._v(" "),a("ul",[a("li",[v._v("开发人员必须处理创建分布式系统的额外复杂性：\n"),a("ul",[a("li",[v._v("开发人员必须实现跨服务通信机制并处理部分失败")]),v._v(" "),a("li",[v._v("实现跨多个服务的请求更加困难")]),v._v(" "),a("li",[v._v("测试服务之间的交互更加困难")]),v._v(" "),a("li",[v._v("实现跨多个服务的请求需要团队之间的仔细协调")]),v._v(" "),a("li",[v._v("开发人员工具/ IDE面向构建单一应用程序，并不为开发分布式应用程序提供明确支持。")])])]),v._v(" "),a("li",[v._v("部署复杂性。在生产中，还存在部署和管理由许多不同服务组成的系统的操作复杂性。")]),v._v(" "),a("li",[v._v("增加内存消耗。微服务架构用NxM服务实例替换N个单片应用程序实例。如果每个服务都在自己的JVM（或等效服务器）中运行，这通常是隔离实例所必需的，那么就会产生M倍运行时M次的开销。此外，如果每个服务都在自己的VM上运行（例如EC2实例），就像Netflix一样，开销甚至更高。")])]),v._v(" "),a("h3",{attrs:{id:"何时使用微服务架构"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#何时使用微服务架构","aria-hidden":"true"}},[v._v("#")]),v._v(" 何时使用微服务架构")]),v._v(" "),a("p",[v._v("使用这种方法的一个挑战是决定何时使用它。在开发应用程序的第一个版本时，您通常不会遇到此方法所解决的问题。此外，使用精心设计的分布式架构将减缓开发速度。对于初创公司而言，这可能是一个主要问题，其最大的挑战通常是如何快速发展业务模型和随附的应用程序。使用Y轴拆分可能会使快速迭代变得更加困难。然而，稍后，当挑战是如何扩展并且您需要使用功能分解时，纠结的依赖关系可能使您难以将整体应用程序分解为一组服务。")]),v._v(" "),a("h2",{attrs:{id:"如何将单体重构为微服务架构（how）"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#如何将单体重构为微服务架构（how）","aria-hidden":"true"}},[v._v("#")]),v._v(" 如何将单体重构为微服务架构（how）")]),v._v(" "),a("p",[v._v("将单体架构重构为微服务架构必须解决的一些问题:")]),v._v(" "),a("ul",[a("li",[v._v("按业务能力分解并定义与业务功能拆分相对应的服务。")]),v._v(" "),a("li",[v._v("通过域驱动设计子域进行分解。")]),v._v(" "),a("li",[v._v("通过动词或用例分解并定义负责特定操作的服务。例如Shipping Service，负责运送完整订单。RESTFUL风格")]),v._v(" "),a("li",[v._v("通过定义一个服务来分解名词或资源，该服务负责对给定类型的实体/资源的所有操作。例如 Account Service，负责管理用户帐户的人。\n理想情况下，每项服务应该只有一小部分职责。（设计模式中的"),a("b",[v._v("单一责任原则")]),v._v("）")])])])}],!1,null,null,null);_.default=i.exports}}]);