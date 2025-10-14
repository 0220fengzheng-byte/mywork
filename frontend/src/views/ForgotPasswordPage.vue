<template>
  <div class="forgot-password-container">
    <el-card class="forgot-password-card">
      <div class="forgot-password-header">
        <h2>找回密码</h2>
        <p>请输入您的注册邮箱，我们将发送重置密码链接</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-button type="primary" class="submit-button" @click="handleSubmit" :loading="loading">发送重置链接</el-button>
        <div class="back-link">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  email: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        ElMessage.success('重置密码链接已发送到您的邮箱')
        form.email = ''
      } catch (error) {
        ElMessage.error('发送失败，请稍后再试')
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.forgot-password-card {
  width: 400px;
  padding: 20px;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-password-header h2 {
  margin-bottom: 10px;
  color: #409EFF;
}

.submit-button {
  width: 100%;
  margin-bottom: 20px;
}

.back-link {
  text-align: center;
}
</style>