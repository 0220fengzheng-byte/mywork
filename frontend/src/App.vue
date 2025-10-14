<template>
  <div id="app">
    <HeaderBar v-if="showHeader" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from './components/HeaderBar.vue'

const route = useRoute()
const showHeader = computed(() => !['/login','/register','/forgot-password'].includes(route.path))
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>