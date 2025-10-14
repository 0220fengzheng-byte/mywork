<template>
  <div class="project-management">
    <div class="header">
      <h1>项目管理</h1>
      <div class="header-right">
        <el-button type="primary" @click="openCreate" class="create-btn">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
        
        <!-- 用户信息 -->
        <el-dropdown class="user-dropdown" @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.userAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ userStore.userName || '用户' }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">
                <el-icon><Bell /></el-icon>
                通知设置
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 项目视图分类标签 -->
    <div class="project-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="project-tabs-container">
        <el-tab-pane label="全部项目" name="all">
          <template #label>
            <span class="tab-label">
              <el-icon><Grid /></el-icon>
              全部项目 ({{ allProjects.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的项目" name="myProjects">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              我的项目 ({{ myProjects.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="本周项目" name="thisWeek">
          <template #label>
            <span class="tab-label">
              <el-icon><Calendar /></el-icon>
              本周项目 ({{ thisWeekProjects.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="进行中" name="ongoing">
          <template #label>
            <span class="tab-label">
              <el-icon><Loading /></el-icon>
              进行中 ({{ ongoingProjects.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <template #label>
            <span class="tab-label">
              <el-icon><Check /></el-icon>
              已完成 ({{ completedProjects.length }})
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="历史项目" name="history">
          <template #label>
            <span class="tab-label">
              <el-icon><Clock /></el-icon>
              历史项目 ({{ historyProjects.length }})
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 项目统计卡片 -->
    <div class="stats-cards" v-if="activeTab === 'all'">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card clickable" @click="filterByStatCard('all')">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ allProjects.length }}</div>
                <div class="stat-label">总项目数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable" @click="filterByStatCard('ongoing')">
            <div class="stat-content">
              <div class="stat-icon ongoing">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ ongoingProjects.length }}</div>
                <div class="stat-label">进行中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable" @click="filterByStatCard('completed')">
            <div class="stat-content">
              <div class="stat-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ completedProjects.length }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable" @click="filterByStatCard('urgent')">
            <div class="stat-content">
              <div class="stat-icon urgent">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ urgentProjects.length }}</div>
                <div class="stat-label">即将到期</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 高级筛选搜索功能 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <template #header>
          <div class="filter-header">
            <span class="filter-title">
              <el-icon><Filter /></el-icon>
              高级筛选
            </span>
            <el-button 
              size="small" 
              type="primary" 
              link 
              @click="toggleFilterExpanded"
              class="toggle-btn"
            >
              {{ filterExpanded ? '收起' : '展开' }}
              <el-icon>
                <ArrowDown v-if="!filterExpanded" />
                <ArrowUp v-if="filterExpanded" />
              </el-icon>
            </el-button>
          </div>
        </template>
        
        <!-- 基础搜索栏 -->
        <div class="basic-search">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-input
                v-model="searchQuery"
                placeholder="搜索项目名称或描述..."
                clearable
                @input="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="filterType"
                placeholder="筛选类型"
                @change="handleFilterTypeChange"
                class="filter-select"
              >
                <el-option label="按负责人筛选" value="assignee" />
                <el-option label="按提需人筛选" value="requester" />
                <el-option label="按状态筛选" value="status" />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="filterValue"
                :placeholder="getFilterPlaceholder()"
                :disabled="!filterType"
                @change="handleFilter"
                class="filter-select"
                clearable
              >
                <el-option 
                  v-for="option in getFilterOptions()" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button 
                type="danger" 
                @click="clearFilters"
                class="clear-btn"
              >
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
            </el-col>
          </el-row>
        </div>
        
        <!-- 高级筛选选项 -->
        <el-collapse-transition>
          <div v-show="filterExpanded" class="advanced-filters">
            <el-divider content-position="left">排序和高级选项</el-divider>
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">排序方式</label>
                  <el-select
                    v-model="sortBy"
                    placeholder="选择排序字段"
                    @change="handleSort"
                    class="filter-select"
                  >
                    <el-option label="项目名称" value="name" />
                    <el-option label="截止日期" value="deadline" />
                    <el-option label="状态" value="status" />
                    <el-option label="创建时间" value="createdAt" />
                  </el-select>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">排序顺序</label>
                  <el-select
                    v-model="sortOrder"
                    placeholder="选择排序顺序"
                    @change="handleSort"
                    class="filter-select"
                  >
                    <el-option label="升序" value="asc" />
                    <el-option label="降序" value="desc" />
                  </el-select>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">截止日期范围</label>
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleFilter"
                    class="date-picker"
                  />
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">快速筛选</label>
                  <div class="quick-filters">
                    <el-button 
                      size="small" 
                      :type="quickFilter === 'urgent' ? 'danger' : ''"
                      @click="setQuickFilter('urgent')"
                    >
                      紧急项目
                    </el-button>
                    <el-button 
                      size="small" 
                      :type="quickFilter === 'completed' ? 'success' : ''"
                      @click="setQuickFilter('completed')"
                    >
                      已完成项目
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-collapse-transition>
      </el-card>
    </div>
    
    <el-table :data="finalFilteredProjects" style="width: 100%; margin-top: 20px;" class="project-table" empty-text="暂无项目数据">
      <el-table-column prop="name" label="项目名称" min-width="200">
        <template #default="scope">
          <div class="project-name">
            <el-icon class="project-icon"><Folder /></el-icon>
            <span>{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="140">
        <template #default="scope">
          <div class="deadline-cell">
            <el-icon><Calendar /></el-icon>
            <span :class="{ 'deadline-urgent': isUrgent(scope.row.deadline) }">
              {{ scope.row.deadline }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提需人" width="120">
        <template #default="scope">
          <div class="requester-cell">
            <el-icon><User /></el-icon>
            <span>{{ scope.row.requesterName || '未指定' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="120">
        <template #default="scope">
          <div class="assignee-cell">
            <el-icon><UserFilled /></el-icon>
            <span>{{ scope.row.assigneeName || '未指定' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <el-button size="small" @click="viewProject(scope.row)" class="action-btn">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" type="primary" @click="openEdit(scope.row)" class="action-btn">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="remove(scope.row)" class="action-btn">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提需人" prop="requesterName">
              <el-select 
                v-model="form.requesterName" 
                placeholder="选择或输入提需人" 
                filterable 
                allow-create
                default-first-option
              >
                <el-option 
                  v-for="user in teamMembers" 
                  :key="user._id" 
                  :label="user.name" 
                  :value="user.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="assigneeName">
              <el-select 
                v-model="form.assigneeName" 
                placeholder="选择或输入负责人" 
                filterable 
                allow-create
                default-first-option
              >
                <el-option 
                  v-for="user in teamMembers" 
                  :key="user._id" 
                  :label="user.name" 
                  :value="user.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="选择状态">
                <el-option label="未开始" value="未开始" />
                <el-option label="进行中" value="进行中" />
                <el-option label="已完成" value="已完成" />
                <el-option label="暂停" value="暂停" />
                <el-option label="取消" value="取消" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="选择优先级">
                <el-option label="高" value="高" />
                <el-option label="中" value="中" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="文档链接">
          <el-input v-model="form.documentUrl" placeholder="请输入文档链接（如Google Docs、飞书文档等）" />
        </el-form-item>

        <el-form-item label="文档标题">
          <el-input v-model="form.documentTitle" placeholder="请输入文档标题" />
        </el-form-item>

        <el-form-item label="项目图片">
          <el-upload
            v-model:file-list="form.imageFiles"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :before-upload="beforeUpload"
            multiple
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-dialog v-model="previewVisible" title="图片预览">
            <img w-full :src="previewImageUrl" alt="Preview Image" style="width: 100%" />
          </el-dialog>
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects'
import { useUserStore } from '../stores/user'
import { 
  Plus, Grid, Calendar, Loading, Check, Clock, Warning, 
  Folder, View, Edit, Delete, Filter, Search, ArrowDown, 
  ArrowUp, RefreshLeft, User, UserFilled, Bell, SwitchButton 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const store = useProjectsStore()
const userStore = useUserStore()
const projects = ref(store.projects)

// 当前激活的标签页
const activeTab = ref('all')

// 筛选搜索相关状态
const filterExpanded = ref(false)
const searchQuery = ref('')
const filterType = ref('')  // 筛选类型：assignee, requester, status
const filterValue = ref('')  // 筛选值
const dateRange = ref([])
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const quickFilter = ref('')

// 计算属性 - 项目分类
const allProjects = computed(() => projects.value)

const myProjects = computed(() => {
  const currentUserName = userStore.user?.name || userStore.userName || ''
  if (!currentUserName) return []
  
  return projects.value.filter(project => {
    return project.requesterName === currentUserName || 
           project.assigneeName === currentUserName ||
           project.requester === currentUserName ||
           project.assignee === currentUserName
  })
})

const thisWeekProjects = computed(() => {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  
  return projects.value.filter(project => {
    const deadline = new Date(project.deadline)
    return deadline >= weekStart && deadline <= weekEnd
  })
})

const ongoingProjects = computed(() => {
  return projects.value.filter(project => project.status === '进行中')
})

const completedProjects = computed(() => {
  return projects.value.filter(project => project.status === '已完成')
})

const historyProjects = computed(() => {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  return projects.value.filter(project => {
    const deadline = new Date(project.deadline)
    return deadline < threeMonthsAgo || project.status === '已完成'
  })
})

const urgentProjects = computed(() => {
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)
  
  return projects.value.filter(project => {
    const deadline = new Date(project.deadline)
    return deadline <= threeDaysLater && project.status !== '已完成'
  })
})

// 根据当前标签页过滤项目
const filteredProjects = computed(() => {
  switch (activeTab.value) {
    case 'all':
      return allProjects.value
    case 'myProjects':
      return myProjects.value
    case 'thisWeek':
      return thisWeekProjects.value
    case 'ongoing':
      return ongoingProjects.value
    case 'completed':
      return completedProjects.value
    case 'history':
      return historyProjects.value
    default:
      return allProjects.value
  }
})



// 最终筛选和排序后的项目列表
const finalFilteredProjects = computed(() => {
  let result = [...filteredProjects.value]
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(project => 
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    )
  }
  
  // 新的两级筛选逻辑
  if (filterType.value && filterValue.value) {
    switch (filterType.value) {
      case 'status':
        result = result.filter(project => project.status === filterValue.value)
        break
      case 'assignee':
        result = result.filter(project => project.assignee === filterValue.value)
        break
      case 'requester':
        result = result.filter(project => project.requester === filterValue.value)
        break
    }
  }
  
  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(project => {
      const deadline = new Date(project.deadline)
      return deadline >= new Date(startDate) && deadline <= new Date(endDate)
    })
  }
  
  // 快速筛选
  if (quickFilter.value) {
    switch (quickFilter.value) {
      case 'urgent':
        result = result.filter(project => isUrgent(project.deadline) && project.status !== '已完成')
        break
      case 'completed':
        result = result.filter(project => project.status === '已完成')
        break
    }
  }
  
  // 排序
  result.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      case 'deadline':
        aValue = new Date(a.deadline)
        bValue = new Date(b.deadline)
        break
      case 'status':
        const statusOrder = { '未开始': 0, '进行中': 1, '已完成': 2 }
        aValue = statusOrder[a.status] || 0
        bValue = statusOrder[b.status] || 0
        break
      case 'progress':
        aValue = getProjectProgress(a)
        bValue = getProjectProgress(b)
        break
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt || a.deadline)
        bValue = new Date(b.createdAt || b.deadline)
        break
    }
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

// 弹窗与表单状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const form = ref({ 
  name: '', 
  status: '未开始', 
  priority: '中',
  deadline: '', 
  description: '',
  requesterName: '',
  assigneeName: '',
  documentUrl: '',
  documentTitle: '',
  imageFiles: []
})

// 团队成员数据
const teamMembers = ref([])

// 图片预览相关
const previewVisible = ref(false)
const previewImageUrl = ref('')

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  requesterName: [
    { required: true, message: '请输入或选择提需人', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 标签页切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName
}

// 筛选搜索相关方法
const toggleFilterExpanded = () => {
  filterExpanded.value = !filterExpanded.value
}

const handleSearch = () => {
  // 搜索会自动触发 finalFilteredProjects 的重新计算
}

// 筛选类型改变时的处理
const handleFilterTypeChange = () => {
  filterValue.value = '' // 清空筛选值
}

// 获取筛选占位符文本
const getFilterPlaceholder = () => {
  switch (filterType.value) {
    case 'assignee':
      return '选择负责人'
    case 'requester':
      return '选择提需人'
    case 'status':
      return '选择状态'
    default:
      return '请先选择筛选类型'
  }
}

// 获取筛选选项
const getFilterOptions = () => {
  if (!filterType.value) return []
  
  switch (filterType.value) {
    case 'status':
      return [
        { label: '未开始', value: '未开始' },
        { label: '进行中', value: '进行中' },
        { label: '已完成', value: '已完成' }
      ]
    case 'assignee':
      // 获取所有负责人
      const assignees = new Set()
      projects.value.forEach(project => {
        if (project.assignee) {
          assignees.add(project.assignee)
        }
      })
      return Array.from(assignees).map(assignee => ({
        label: assignee,
        value: assignee
      }))
    case 'requester':
      // 获取所有提需人
      const requesters = new Set()
      projects.value.forEach(project => {
        if (project.requester) {
          requesters.add(project.requester)
        }
      })
      return Array.from(requesters).map(requester => ({
        label: requester,
        value: requester
      }))
    default:
      return []
  }
}

const handleFilter = () => {
  // 筛选会自动触发 finalFilteredProjects 的重新计算
}

const handleSort = () => {
  // 排序会自动触发 finalFilteredProjects 的重新计算
}

const setQuickFilter = (filterType) => {
  if (quickFilter.value === filterType) {
    quickFilter.value = '' // 取消选择
  } else {
    quickFilter.value = filterType
  }
}

// 统计卡片点击筛选
const filterByStatCard = (cardType) => {
  // 清除其他筛选条件
  searchQuery.value = ''
  filterType.value = ''
  filterValue.value = ''
  dateRange.value = []
  
  switch (cardType) {
    case 'all':
      // 显示所有项目，清除所有筛选
      quickFilter.value = ''
      ElMessage.success('显示所有项目')
      break
    case 'ongoing':
      // 筛选进行中的项目
      filterType.value = 'status'
      filterValue.value = '进行中'
      quickFilter.value = ''
      ElMessage.success('筛选进行中的项目')
      break
    case 'completed':
      // 筛选已完成的项目
      filterType.value = 'status'
      filterValue.value = '已完成'
      quickFilter.value = ''
      ElMessage.success('筛选已完成的项目')
      break
    case 'urgent':
      // 使用快速筛选显示紧急项目
      quickFilter.value = 'urgent'
      ElMessage.success('筛选即将到期的项目')
      break
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterValue.value = ''
  dateRange.value = []
  sortBy.value = 'createdAt'
  sortOrder.value = 'desc'
  quickFilter.value = ''
  saveFilterConditions() // 保存重置后的筛选条件
  ElMessage.success('筛选条件已重置')
}

// 保存筛选条件到localStorage
const saveFilterConditions = () => {
  const filterConditions = {
    searchQuery: searchQuery.value,
    filterType: filterType.value,
    filterValue: filterValue.value,
    dateRange: dateRange.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    quickFilter: quickFilter.value,
    activeTab: activeTab.value
  }
  localStorage.setItem('projectManagementFilters', JSON.stringify(filterConditions))
}

// 从localStorage恢复筛选条件
const restoreFilterConditions = () => {
  try {
    const saved = localStorage.getItem('projectManagementFilters')
    if (saved) {
      const filterConditions = JSON.parse(saved)
      searchQuery.value = filterConditions.searchQuery || ''
      filterType.value = filterConditions.filterType || ''
      filterValue.value = filterConditions.filterValue || ''
      dateRange.value = filterConditions.dateRange || []
      sortBy.value = filterConditions.sortBy || 'createdAt'
      sortOrder.value = filterConditions.sortOrder || 'desc'
      quickFilter.value = filterConditions.quickFilter || ''
      activeTab.value = filterConditions.activeTab || 'all'
    }
  } catch (error) {
    console.warn('恢复筛选条件失败:', error)
  }
}

// 状态类型映射
const getStatusType = (status) => {
  const map = {
    '未开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

// 判断是否紧急（3天内到期）
const isUrgent = (deadline) => {
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)
  const deadlineDate = new Date(deadline)
  return deadlineDate <= threeDaysLater
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取项目进度百分比
const getProjectProgress = (project) => {
  const tasks = project.tasks || []
  if (tasks.length === 0) return 0
  const completedTasks = tasks.filter(task => task.status === '已完成').length
  return Math.round((completedTasks / tasks.length) * 100)
}

// 获取已完成任务数
const getCompletedTasks = (project) => {
  const tasks = project.tasks || []
  return tasks.filter(task => task.status === '已完成').length
}

// 获取总任务数
const getTotalTasks = (project) => {
  return (project.tasks || []).length
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const viewProject = (project) => {
  router.push(`/projects/${project.id}`)
}

const openCreate = () => {
  dialogTitle.value = '新建项目'
  editingId.value = null
  form.value = { 
    name: '', 
    status: '未开始', 
    priority: '中',
    deadline: '', 
    description: '',
    requesterName: userStore.user?.name || '', // 默认设置当前用户为提需人
    assigneeName: '',
    documentUrl: '',
    documentTitle: '',
    imageFiles: []
  }
  dialogVisible.value = true
}

const submit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const payload = { ...form.value }
    
    // 处理图片文件
    if (payload.imageFiles && payload.imageFiles.length > 0) {
      // 将文件转换为base64格式，确保图片持久性
      const imagePromises = payload.imageFiles.map(file => {
        return new Promise((resolve) => {
          // 如果已经是base64或URL，直接使用
          if (file.url && (file.url.startsWith('data:') || file.url.startsWith('http'))) {
            resolve({
              name: file.name,
              url: file.url,
              size: file.size,
              type: file.type
            })
          } else if (file.raw) {
            // 将文件转换为base64
            const reader = new FileReader()
            reader.onload = (e) => {
              resolve({
                name: file.name,
                url: e.target.result,
                size: file.size,
                type: file.raw.type
              })
            }
            reader.readAsDataURL(file.raw)
          } else {
            // 兜底处理
            resolve({
              name: file.name,
              url: file.url || '',
              size: file.size,
              type: file.type
            })
          }
        })
      })
      
      payload.imageFiles = await Promise.all(imagePromises)
    } else {
      payload.imageFiles = []
    }
    
    if (editingId.value) {
      store.updateProject(editingId.value, payload)
      ElMessage.success('项目更新成功')
    } else {
      store.addProject(payload)
      ElMessage.success('项目创建成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 图片上传相关方法
const handlePictureCardPreview = (file) => {
  previewImageUrl.value = file.url || file.response?.url || URL.createObjectURL(file.raw)
  previewVisible.value = true
}

const handleRemove = (file, fileList) => {
  form.value.imageFiles = fileList
}

const handleChange = (file, fileList) => {
  // 为新上传的文件创建预览URL
  if (file.raw && !file.url) {
    file.url = URL.createObjectURL(file.raw)
  }
  form.value.imageFiles = fileList
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  // 阻止自动上传，我们手动处理
  return false
}

// 获取团队成员列表
const fetchTeamMembers = async () => {
  try {
    const { usersAPI } = await import('../api/users')
    const members = await usersAPI.getTeamMembers()
    teamMembers.value = members
  } catch (error) {
    console.warn('获取团队成员失败，将使用手动输入模式:', error)
    // 不显示错误消息，允许用户手动输入
    teamMembers.value = []
  }
}

const openEdit = (row) => {
  dialogTitle.value = '编辑项目'
  editingId.value = row.id
  
  // 处理图片数据
  const imageFiles = (row.imageFiles || []).map((img, index) => ({
    uid: index,
    name: img.name || `image-${index}`,
    url: img.url || img,
    status: 'success'
  }))
  
  form.value = { 
    name: row.name, 
    status: row.status, 
    priority: row.priority || '中',
    deadline: row.deadline, 
    description: row.description || '',
    requesterName: row.requesterName || '',
    assigneeName: row.assigneeName || '',
    documentUrl: row.documentUrl || '',
    documentTitle: row.documentTitle || '',
    imageFiles: imageFiles
  }
  dialogVisible.value = true
}

const remove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除项目「${row.name}」？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    store.deleteProject(row.id)
    ElMessage.success('项目删除成功')
  } catch {
    // 用户取消删除
  }
}

// 处理用户下拉菜单命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'settings':
      // 跳转到个人资料页面的通知设置部分
      router.push('/profile#notification-settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确认退出登录？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清除用户信息和token
    userStore.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}

// 监听筛选条件变化，自动保存
watch([searchQuery, filterType, filterValue, dateRange, sortBy, sortOrder, quickFilter, activeTab], () => {
  saveFilterConditions()
}, { deep: true })

// 组件挂载时更新项目数据
onMounted(() => {
  projects.value = store.projects
  fetchTeamMembers()
  restoreFilterConditions() // 恢复保存的筛选条件
})
</script>

<style scoped>
.project-management {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 项目标签页样式 */
.project-tabs {
  margin-bottom: 20px;
}

.project-tabs-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

/* 统计卡片样式 */
.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.clickable {
  cursor: pointer;
  user-select: none;
}

.stat-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.stat-card.clickable:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.ongoing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.urgent {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 筛选搜索区域样式 */
.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.basic-search {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
}

.filter-select {
  width: 100%;
}

.clear-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.advanced-filters {
  padding-top: 15px;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.date-picker {
  width: 100%;
}

.progress-slider {
  margin-top: 10px;
}

.progress-range-text {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.quick-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 项目表格样式 */
.project-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-icon {
  color: #409eff;
  font-size: 16px;
}

.deadline-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.deadline-urgent {
  color: #f56c6c;
  font-weight: 600;
}

.requester-cell,
.assignee-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
}

.requester-cell .el-icon,
.assignee-cell .el-icon {
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  font-size: 11px;
  min-width: auto;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-management {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stats-cards .el-row {
    margin: 0 -5px;
  }
  
  .stats-cards .el-col {
    padding: 0 5px;
    margin-bottom: 10px;
  }
  
  .basic-search .el-row {
    margin: 0 -5px;
  }
  
  .basic-search .el-col {
    padding: 0 5px;
    margin-bottom: 10px;
  }
  
  .advanced-filters .el-row {
    margin: 0 -5px;
  }
  
  .advanced-filters .el-col {
    padding: 0 5px;
    margin-bottom: 15px;
  }
  
  .action-buttons {
    gap: 2px;
  }
}

/* 用户下拉菜单样式 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s;
}

.user-dropdown.is-opened .dropdown-icon {
  transform: rotate(180deg);
}

.action-btn {
  padding: 3px 4px;
  font-size: 10px;
}
</style>