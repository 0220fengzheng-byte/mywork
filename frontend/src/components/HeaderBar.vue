<template>
  <el-header height="56px" class="header">
    <div class="left">
      <span class="logo" @click="$router.push('/dashboard')">项目管理系统</span>
      <el-menu mode="horizontal" :default-active="active" class="menu" router>
        <el-menu-item index="/dashboard">仪表盘</el-menu-item>
        <el-menu-item index="/projects">项目</el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <el-button text @click="$router.push('/profile')">个人设置</el-button>
    </div>
  </el-header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(route.path)

watch(() => route.path, (p) => active.value = p)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
}
.left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo {
  font-weight: 600;
  cursor: pointer;
}
.menu {
  border-bottom: none;
}
.right {
}
</style>