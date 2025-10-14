<template>
  <div class="project-list">
    <el-table :data="projects" style="width: 100%" border>
      <el-table-column prop="name" label="项目名称" min-width="150"></el-table-column>
      <el-table-column prop="requester" label="提需人" width="100"></el-table-column>
      <el-table-column prop="assignee" label="负责人" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="紧急程度" width="100">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">{{ scope.row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="120"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="$emit('view', scope.row)">详情</el-button>
          <el-button size="small" type="primary" @click="$emit('edit', scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="$emit('page-change', $event)"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineEmits(['view', 'edit', 'page-change'])

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const statusMap = {
    '未开始': 'info',
    '进行中': 'primary',
    '已完成': 'success',
    '暂停': 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取优先级对应的标签类型
const getPriorityType = (priority) => {
  const priorityMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return priorityMap[priority] || 'info'
}
</script>

<style scoped>
.project-list {
  width: 100%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>