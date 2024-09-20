# Isomorphic-test

> 文章地址：[前端页面秒开的关键 - 小白也能看懂的同构渲染原理和实现](https://juejin.cn/post/7289661061984501819)

同构渲染 demo

- 简单同构
- 实现脱水与注水
- 服务端优化
- 预渲染

## 同构渲染要（坑）点

服务器端和浏览器端环境不同，所以我们不能像写 csr 代码一样写同构代码。根据我的踩坑经历，写同构应用需要尤其注意以下几点：

### 1、避免状态单例

服务器端返回给客户端的每个请求都应该是全新的、独立的应用程序实例，因此不应当有单例对象------也就是避免直接将对象或变量创建在全局作用域，否则它将在所有请求之间共享，在不同请求之间造成状态污染。

在客户端中，vue/pinia/vue-router 都是以单例的形式存在，为此可以用函数的形式将 vue/pinia/vue-router 等进行初始化。也就是像上面的例子那样，用一个函数进行包裹，然后调用这个函数进行应用的初始化。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/067fb8ff8d134dd7bf6903ead9c59a97~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=652&h=325&s=42450&e=png&b=f8f8f8)

### 2、避免访问特定平台 api

服务器端是 node 环境，而客户端是浏览器环境，如果你在 node 端直接使用了像 window 、 document 或者 fetch（在 node 端应该用 axios 或 node-fetch），这种仅浏览器可用的全局变量或 api，则会在 Node.js 中执行时抛出错误；反之，在浏览器使用了 node 端的 api 也是如此。

需要注意的是，在 vue 组件中，服务器端渲染时只会执行 beforeCreate 和 created 生命周期，在这两个生命周期之外执行浏览器 api 是安全的。所以推荐将操作 dom 或访问 window 之类的浏览器行为，一并写在 `onMounted` 生命周期中，这样就能避免在 node 端访问到浏览器 api。

如果要在这两个生命周期中使用浏览器端 api，可以利用相关打包工具提供的变量（如 vite 提供了 `import.meta.env.SSR`, nuxt 提供了 `process.server`），来避免服务器端调用相关代码。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad7ad5851ed94b469a1c70c36603b7da~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=350&h=160&s=8793&e=png&b=1f1f1f)

尤其需要注意的是，一些组件库可能也会因为编写的时候没有考虑到服务器端渲染的情况，导致渲染出错。这时候可以借助一些第三方组件，如 nuxt 中的[ClientOnly](https://link.juejin.cn?target=https%3A%2F%2Fnuxt.com%2Fdocs%2Fapi%2Fcomponents%2Fclient-only%23clientonly "https://nuxt.com/docs/api/components/client-only#clientonly")，可以避免这些出错的组件在服务器端进行渲染。

### 3、避免在服务器端生命周期内执行全局副作用代码

vue 服务器端渲染会执行 `beforeCreate` 和 `created` 生命周期，应该避免在这两个生命周期里产生全局副作用的代码。而像 `onMounted` 或者 `onUpdated` 这样的生命周期钩子不会在 SSR 期间被调用，而只会在客户端运行。

例如使用 setInterval 设置定时器。在纯客户端的代码中，我们可以设置一个定时器，然后在 beforeDestroy 或 destroyed 生命周期时将其销毁。但是，由于在 SSR 期间并不会调用销毁钩子函数（unmount），所以 timer 将永远保留下来，最终造成服务器内存溢出。为了避免这种情况，请将含有副作用的代码放到 `onMounted` 中。

## 4、创建实际生产中的同构应用

上面的例子是一个最基础的同构渲染，但距离一个能在开发中实际使用的框架还差得很远。如果把这些内容都细细讲完，我估摸文章要到三万字了，实在太累，而且也很难让新手程序员看得懂。所以这些难点我只讲解一下关键点，如果有兴趣深究的可以下来自己研究。

按照我踩坑的经历，至少还要解决下面几个问题：

1.  集成前端工具链，如 vite、eslint、ts 等
2.  集成前端路由，如 vue-router
3.  集成全局状态管理库，如 pinia
4.  处理`#app`节点之外的元素。如 vue 的 teleport，react 的 portal
5.  处理预加载资源

顺带一提，vue 社区有一篇[vue ssr 指南](https://link.juejin.cn?target=https%3A%2F%2Fv2.ssr.vuejs.org%2Fzh%2F "https://v2.ssr.vuejs.org/zh/")也值得一看，虽然只有 vue2 版本的，但是仍然有很多值得学习的地方。

**4.1 集成前端工具链**

这部分内容实在太多太杂，需要对打包工具有比较好的掌握才能理解。好在 vite 官方已经有了一篇[完善的教程](https://link.juejin.cn?target=https%3A%2F%2Fcn.vitejs.dev%2Fguide%2Fssr.html "https://cn.vitejs.dev/guide/ssr.html")，而且提供了完整的代码示例，想深入了解的可以点进去看看。

**4.2 集成前端路由**

前端路由都提供了相关的 api 来辅助服务器端进行处理。如 vue-router 进行服务器端处理的流程如下：

1.  使用[createMemoryHistory](https://link.juejin.cn?target=https%3A%2F%2Frouter.vuejs.org%2Fzh%2Fapi%2F%23Functions-createMemoryHistory "https://router.vuejs.org/zh/api/#Functions-createMemoryHistory")创建路由。
2.  在服务器端获取用户请求的路径，将路径传入`router.push`函数，这样 router 就会处理该路径对应的页面。
3.  router 在处理页面的时候，可能会碰到一些异步代码，所以 vue-router 提供了[router.isReady](https://link.juejin.cn?target=https%3A%2F%2Frouter.vuejs.org%2Fzh%2Fapi%2Finterfaces%2FRouter.html%23Methods-isReady "https://router.vuejs.org/zh/api/interfaces/Router.html#Methods-isReady")这个异步函数。`await`这个函数后，再渲染整个应用，获取的就是当前用户请求的页面了。

**4.3 集成全局状态管理库**

官方文档一般就有详细教程，如 pinia 官网就有教你[如何进行服务器端渲染](https://link.juejin.cn?target=https%3A%2F%2Fpinia.web3doc.top%2Fssr%2F "https://pinia.web3doc.top/ssr/")。实际上全局状态管理库的处理就是脱水和注水，所以这里不做详细解释了。

**4.4 处理`#app`节点之外的元素**

页面内容一般会渲染到 id 为 app 的节点下，但像 vue 中的 teleport 和 react 的 portal 独立于 app 节点外，因此需要单独处理。

这里建议把所有的根节点之外的元素统一设置到一个节点下面，如 teleport 可以通过设置 to 属性来指定挂载的节点；同时 vue 也提供了方法来[获取所有的 teleport](https://link.juejin.cn?target=https%3A%2F%2Fcn.vuejs.org%2Fguide%2Fscaling-up%2Fssr.html%23teleports "https://cn.vuejs.org/guide/scaling-up/ssr.html#teleports")。拿到 teleport 的信息后，即可通过字符串拼接的方式，将它们一并放到 html 模板中的目标节点下面了。

**4.5 处理预加载资源**

使用打包器可以生成 manifest，它的作用是将打包后的模块 ID 与它们关联的 chunk 和资源文件进行映射（简单理解就是通过它你可以知道 js、图片等页面资源的位置在哪儿）。依靠这个 manifest 获取资源的路径，然后创建 link 标签拼接到 html 模板中即可。

详情可[查看这里](https://link.juejin.cn?target=https%3A%2F%2Fcn.vitejs.dev%2Fguide%2Fssr.html%23generating-preload-directives "https://cn.vitejs.dev/guide/ssr.html#generating-preload-directives")。

**4.6 激活不匹配**

如果预渲染的 HTML 的 DOM 结构不符合客户端应用的期望，就会出现激活不匹配。这是在同构渲染的应用中高频出现的一个问题。

（1）. 组件模板中存在不符合规范的 HTML 结构，渲染后的 HTML 被浏览器原生的 HTML 解析行为纠正导致不匹配。举例来说，一个常见的错误是 <div> 不能被放在 <p> 中：

（2）. 渲染所用的数据中包含随机生成的值。由于同一个应用会在服务端和客户端执行两次，每次执行生成的随机数都不能保证相同。避免随机数不匹配有两种选择：

- 利用 v-if + onMounted 让需要用到随机数的模板只在客户端渲染。你所用的上层框架可能也会提供简化这个用例的内置 API，比如 VitePress 的 `<ClientOnly>` 组件。
- 使用一个能够接受随机种子的随机数生成库，并确保服务端和客户端使用同样的随机数种子 (比如把种子包含在序列化的状态中，然后在客户端取回)。

（3）.服务端和客户端的时区不一致。有时候我们可能会想要把一个时间转换为用户的当地时间，但在服务端的时区跟用户的时区可能并不一致，我们也并不能可靠的在服务端预先知道用户的时区。这种情况下，当地时间的转换也应该作为纯客户端逻辑去执行。

当 Vue 遇到激活不匹配时，它将尝试自动恢复并调整预渲染的 DOM 以匹配客户端的状态。这将导致一些渲染性能的损失，因为需要丢弃不匹配的节点并渲染新的节点，但大多数情况下，应用应该会如预期一样继续工作。尽管如此，最好还是在开发过程中发现并避免激活不匹配。

## 5、服务器端优化

虽然我们写好了服务端的代码，但是这样的代码是十分脆弱的，无论性能还是可靠性都没有保障，是没法在实际生产中应用的。为此我们需要对服务端代码进行一系列优化。

**5.1. 服务器端测试**

- 压力测试
- Node 调试工具

**5.2 多进程优化**

**5.3 内存溢出处理**

**5.4 处理未捕获异常**

**5.5 心跳包检测**

**5.6 子进程自动重建**

### 参考

- https://cn.vuejs.org/guide/scaling-up/ssr.html
- https://cn.vitejs.dev/guide/ssr.html
  - https://github.com/vitejs/vite-plugin-vue/tree/main/playground/ssr-vue
- https://github.com/yanyue404/vue2-ssr-docs
- https://juejin.cn/post/7273987266523365432
- https://juejin.cn/post/6902993571293429774
