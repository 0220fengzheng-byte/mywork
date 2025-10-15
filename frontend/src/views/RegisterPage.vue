<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="register-header">
        <h1>项目管理系统</h1>
        <p>创建您的账户，开始使用系统</p>
      </div>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        size="large"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="fengzheng@51talk.com"
            prefix-icon="Message"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入您的姓名"
            prefix-icon="User"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码（至少6位）"
            prefix-icon="Lock"
            show-password
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item label="部门" prop="department">
          <el-input 
            v-model="form.department" 
            placeholder="请输入您的部门（可选）"
            prefix-icon="OfficeBuilding"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号（可选）"
            prefix-icon="Phone"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.agreeTerms">
            我已阅读并同意<el-link type="primary">服务条款</el-link>和<el-link type="primary">隐私政策</el-link>
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%"
            size="large"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
         <span>已有账号？</span>
         <el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
       </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '../api/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({ 
  name: '', 
  email: '', 
  password: '',
  confirmPassword: '',
  department: '',
  phone: '',
  agreeTerms: false
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名长度不能少于2位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (!form.agreeTerms) {
      ElMessage.warning('请先同意服务条款和隐私政策')
      return
    }
    
    loading.value = true
    
    const response = await authAPI.register({
      name: form.name,
      email: form.email,
      password: form.password,
      department: form.department,
      phone: form.phone
    })
    
    ElMessage.success('注册成功！请登录您的账户')
    
    // 跳转到登录页面
    router.push('/login')
    
  } catch (error) {
    console.error('Register error:', error)
    
    // 处理不同类型的错误
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || '注册信息有误'
      if (errorMessage.includes('邮箱已被注册')) {
        ElMessage.error('该邮箱已被注册，请使用其他邮箱或直接登录')
      } else {
        ElMessage.error(errorMessage)
      }
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接错误，请检查网络设置后重试')
    } else {
      ElMessage.error(error.response?.data?.message || '注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 450px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 28px;
}

.register-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 14px;
}

.register-footer span {
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
</style>