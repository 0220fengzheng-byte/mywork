<template>
  <div class="profile">
    <el-page-header content="个人设置" />
    
    <!-- 个人信息卡片 -->
    <el-card class="card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-section">
              <el-avatar :size="120" :src="profileForm.avatar" class="avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="uploadAvatar"
                accept="image/*"
              >
                <el-button size="small" type="primary">更换头像</el-button>
              </el-upload>
            </div>
          </el-col>
          <el-col :span="16">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" disabled />
            </el-form-item>
            <el-form-item label="部门" prop="department">
              <el-select v-model="profileForm.department" placeholder="选择部门" style="width: 100%">
                <el-option label="产品部" value="产品部" />
                <el-option label="研发部" value="研发部" />
                <el-option label="测试部" value="测试部" />
                <el-option label="运营部" value="运营部" />
                <el-option label="设计部" value="设计部" />
                <el-option label="市场部" value="市场部" />
              </el-select>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="updateProfile" :loading="profileLoading">保存信息</el-button>
          <el-button @click="resetProfile">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 密码修改卡片 -->
    <el-card class="card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword" :loading="passwordLoading">修改密码</el-button>
          <el-button @click="resetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知设置卡片 -->
    <el-card id="notification-settings" class="card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>通知设置</span>
        </div>
      </template>
      
      <el-form :model="notificationForm" label-width="150px">
        <el-form-item label="邮件通知">
          <el-switch v-model="notificationForm.emailNotifications" />
          <span class="setting-desc">接收项目相关的邮件通知</span>
        </el-form-item>
        <el-form-item label="项目分配通知">
          <el-switch v-model="notificationForm.projectAssignments" />
          <span class="setting-desc">当被分配到新项目时接收通知</span>
        </el-form-item>
        <el-form-item label="状态变更通知">
          <el-switch v-model="notificationForm.statusChanges" />
          <span class="setting-desc">当项目状态发生变更时接收通知</span>
        </el-form-item>
        <el-form-item label="截止日期提醒">
          <el-switch v-model="notificationForm.deadlineReminders" />
          <span class="setting-desc">在项目截止日期前接收提醒</span>
        </el-form-item>
        <el-form-item label="评论通知">
          <el-switch v-model="notificationForm.comments" />
          <span class="setting-desc">当有人评论您的项目时接收通知</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateNotificationSettings" :loading="notificationLoading">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>账户操作</span>
        </div>
      </template>
      
      <el-space direction="vertical" style="width: 100%">
        <el-button type="danger" @click="logout" :loading="logoutLoading">退出登录</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as usersAPI from '@/api/users'
import * as authAPI from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const profileFormRef = ref()
const passwordFormRef = ref()

// 加载状态
const profileLoading = ref(false)
const passwordLoading = ref(false)
const notificationLoading = ref(false)
const logoutLoading = ref(false)

// 个人信息表单
const profileForm = reactive({
  name: '',
  email: '',
  department: '',
  phone: '',
  avatar: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 通知设置表单
const notificationForm = reactive({
  emailNotifications: true,
  projectAssignments: true,
  statusChanges: true,
  deadlineReminders: true,
  comments: true
})

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化数据
onMounted(async () => {
  await loadUserProfile()
  await loadNotificationSettings()
})

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const response = await usersAPI.getUserProfile()
    const user = response.data
    
    profileForm.name = user.name || ''
    profileForm.email = user.email || ''
    profileForm.department = user.department || ''
    profileForm.phone = user.phone || ''
    profileForm.avatar = user.avatar || ''
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

// 加载通知设置
const loadNotificationSettings = async () => {
  try {
    const response = await usersAPI.getNotificationSettings()
    const settings = response.data
    
    notificationForm.emailNotifications = settings.emailNotifications ?? true
    notificationForm.projectAssignments = settings.projectAssignments ?? true
    notificationForm.statusChanges = settings.statusChanges ?? true
    notificationForm.deadlineReminders = settings.deadlineReminders ?? true
    notificationForm.comments = settings.comments ?? true
  } catch (error) {
    console.error('加载通知设置失败:', error)
  }
}

// 更新个人信息
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true
    
    const updateData = {
      name: profileForm.name,
      department: profileForm.department,
      phone: profileForm.phone
    }
    
    await usersAPI.updateUserProfile(updateData)
    
    // 更新用户store
    await userStore.fetchUserProfile()
    
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error(error.response?.data?.message || '更新个人信息失败')
  } finally {
    profileLoading.value = false
  }
}

// 重置个人信息表单
const resetProfile = () => {
  loadUserProfile()
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传头像
const uploadAvatar = async (options) => {
  try {
    const formData = new FormData()
    formData.append('avatar', options.file)
    
    const response = await usersAPI.uploadAvatar(formData)
    profileForm.avatar = response.data.avatar
    
    // 更新用户store
    await userStore.fetchUserProfile()
    
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.response?.data?.message || '头像上传失败')
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await usersAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功')
    resetPassword()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.message || '修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPassword = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 更新通知设置
const updateNotificationSettings = async () => {
  try {
    notificationLoading.value = true
    
    await usersAPI.updateNotificationSettings(notificationForm)
    
    ElMessage.success('通知设置更新成功')
  } catch (error) {
    console.error('更新通知设置失败:', error)
    ElMessage.error(error.response?.data?.message || '更新通知设置失败')
  } finally {
    notificationLoading.value = false
  }
}

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    logoutLoading.value = true
    
    // 调用后端登出接口
    try {
      await authAPI.logout({ refreshToken: localStorage.getItem('refreshToken') })
    } catch (error) {
      console.error('后端登出失败:', error)
    }
    
    // 清除本地数据
    userStore.clearUser()
    
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      ElMessage.error('退出登录失败')
    }
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style scoped>
.profile {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.card {
  margin-top: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card:first-of-type {
  margin-top: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.avatar {
  border: 4px solid #f0f2f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.setting-desc {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 24px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #f45454 100%);
  border: none;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #409eff;
}

:deep(.el-page-header__content) {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .profile {
    padding: 16px;
  }
  
  .avatar-section {
    padding: 16px;
  }
  
  :deep(.el-col) {
    margin-bottom: 20px;
  }
}
</style>