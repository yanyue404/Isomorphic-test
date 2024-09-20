<template>
  <div id="app">
    <h1>简单计数器</h1>
    <Counter />
  </div>
</template>

<script setup>
import Counter from "./components/Counter.vue";
import { useHead } from "@unhead/vue";

useHead({
  title: "预渲染",
  meta: [
    {
      name: "description",
      content: "这是一个预渲染的案例。",
    },
  ],
});
</script>

<style>
#app {
  text-align: center;
  padding: 2rem;
}
</style>
