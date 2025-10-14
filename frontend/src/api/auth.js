import api from './index'

// 用户认证相关API
export const authAPI = {
  // 用户注册
  register(data) {
    return api.post('/auth/register', data)
  },

  // 用户登录
  login(data) {
    return api.post('/auth/login', data)
  },

  // 刷新token
  refreshToken(refreshToken) {
    return api.post('/auth/refresh', { refreshToken })
  },

  // 用户登出
  logout() {
    return api.post('/auth/logout')
  },

  // 忘记密码
  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword(data) {
    return api.post('/auth/reset-password', data)
  },

  // 验证邮箱
  verifyEmail(token) {
    return api.post('/auth/verify-email', { token })
  },

  // 验证token
  verifyToken() {
    return api.get('/auth/verify-token')
  }
}

export default authAPI