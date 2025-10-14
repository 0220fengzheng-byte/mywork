<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>项目管理系统</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
          <el-link 
            type="primary" 
            style="float: right"
            @click="$router.push('/forgot-password')"
          >
            忘记密码？
          </el-link>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large"
            style="width: 100%" 
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <span>还没有账号？</span>
        <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
      </div>
      
      <!-- 测试账号提示 -->
      <el-alert
        title="测试账号"
        type="info"
        :closable="false"
        style="margin-top: 20px"
      >
        <template #default>
          <p>邮箱: admin@example.com</p>
          <p>密码: 123456</p>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '../api/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({ 
  email: '', 
  password: '',
  rememberMe: false
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await authAPI.login({
      email: form.email,
      password: form.password
    })
    
    // 保存token和用户信息
    localStorage.setItem('token', response.token)
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    
    // 更新用户store
    await userStore.setUser(response.user)
    
    ElMessage.success('登录成功')
    
    // 跳转到项目管理页面
    const redirect = router.currentRoute.value.query.redirect || '/projects'
    router.push(redirect)
    
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error.response?.data?.message || '登录失败，请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 400px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 28px;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 14px;
}

.login-footer span {
  margin-right: 8px;
}

:deep(.el-form-item__label) {
  color: #2c3e50;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-button--primary) {
  border-radius: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

:deep(.el-alert) {
  border-radius: 8px;
  border: none;
  background: rgba(144, 202, 249, 0.1);
}

:deep(.el-alert__title) {
  color: #1976d2;
  font-weight: 500;
}

:deep(.el-alert__content p) {
  margin: 2px 0;
  color: #1976d2;
  font-size: 13px;
}
</style>