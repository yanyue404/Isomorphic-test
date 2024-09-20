## 执行 vue 服务器端渲染

```
node server.js
```

## 更通用的解决方案[​](https://cn.vuejs.org/guide/scaling-up/ssr#higher-level-solutions)

从上面的例子到一个生产就绪的 SSR 应用还需要很多工作。我们将需要：

- 支持 Vue 单文件组件且满足其他构建步骤要求。事实上，我们需要为同一个应用执行两次构建过程：一次用于客户端，一次用于服务器。

  TIP

  Vue 组件用在 SSR 时的编译产物不同------模板被编译为字符串拼接而不是 render 函数，以此提高渲染性能。

- 在服务器请求处理函数中，确保返回的 HTML 包含正确的客户端资源链接和最优的资源加载提示 (如 prefetch 和 preload)。我们可能还需要在 SSR 和 SSG 模式之间切换，甚至在同一个应用中混合使用这两种模式。

- 以一种通用的方式管理路由、数据获取和状态存储。

完整的实现会非常复杂，并且取决于你选择使用的构建工具链。因此，我们强烈建议你使用一种更通用的、更集成化的解决方案，帮你抽象掉那些复杂的东西。下面推荐几个 Vue 生态中的 SSR 解决方案。

### Nuxt[​](https://cn.vuejs.org/guide/scaling-up/ssr#nuxt)

[Nuxt](https://nuxt.com/)  是一个构建于 Vue 生态系统之上的全栈框架，它为编写 Vue SSR 应用提供了丝滑的开发体验。更棒的是，你还可以把它当作一个静态站点生成器来用！我们强烈建议你试一试。

### Quasar[​](https://cn.vuejs.org/guide/scaling-up/ssr#quasar)

[Quasar](https://quasar.dev/)  是一个基于 Vue 的完整解决方案，它可以让你用同一套代码库构建不同目标的应用，如 SPA、SSR、PWA、移动端应用、桌面端应用以及浏览器插件。除此之外，它还提供了一整套 Material Design 风格的组件库。

### Vite SSR[​](https://cn.vuejs.org/guide/scaling-up/ssr#vite-ssr)

Vite 提供了内置的  [Vue 服务端渲染支持](https://cn.vitejs.dev/guide/ssr.html)，但它在设计上是偏底层的。如果你想要直接使用 Vite，可以看看  [vite-plugin-ssr](https://vite-plugin-ssr.com/)，一个帮你抽象掉许多复杂细节的社区插件。

你也可以在[这里](https://github.com/vitejs/vite-plugin-vue/tree/main/playground/ssr-vue)查看一个使用手动配置的 Vue + Vite SSR 的示例项目，以它作为基础来构建。请注意，这种方式只有在你有丰富的 SSR 和构建工具经验，并希望对应用的架构做深入的定制时才推荐使用。
