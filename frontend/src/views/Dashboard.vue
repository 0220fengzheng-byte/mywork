<template>
  <div class="dashboard">
    <el-page-header content="仪表盘" />
    <div class="cards">
      <el-card class="card" shadow="hover">
        <h3>快速入口</h3>
        <div class="links">
          <el-button type="primary" @click="$router.push('/projects')">项目管理</el-button>
          <el-button @click="$router.push('/profile')">个人设置</el-button>
        </div>
      </el-card>

      <el-card class="card" shadow="hover">
        <h3>系统概览</h3>
        <ul>
          <li>项目总数：{{ totalProjects }}</li>
          <li>任务总数：{{ totalTasks }}</li>
          <li>进行中的任务：{{ ongoingTasks }}</li>
        </ul>
      </el-card>
    </div>
  </div>
  
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '../stores/projects'

const store = useProjectsStore()
const { totalProjects, totalTasks, ongoingTasks } = storeToRefs(store)
</script>

<style scoped>
.dashboard {
  padding: 24px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.card h3 {
  margin: 0 0 12px;
}
.links {
  display: flex;
  gap: 12px;
}
</style>