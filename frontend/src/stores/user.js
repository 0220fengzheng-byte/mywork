import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersAPI } from '../api/users'
import { authAPI } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => user.value?.avatar || '')

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 设置token
  const setToken = (tokenValue, refreshTokenValue = null) => {
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    
    if (refreshTokenValue) {
      refreshToken.value = refreshTokenValue
      localStorage.setItem('refreshToken', refreshTokenValue)
    }
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // 初始化用户信息
  const initUser = async () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
        
        // 验证token是否有效
        await authAPI.verifyToken()
        
        // 获取最新用户信息
        await fetchUserProfile()
      } catch (error) {
        console.error('Token verification failed:', error)
        clearUser()
      }
    }
  }

  // 获取用户资料
  const fetchUserProfile = async () => {
    try {
      isLoading.value = true
      const userData = await usersAPI.getCurrentUser()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Fetch user profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户资料
  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      const updatedUser = await usersAPI.updateProfile(profileData)
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      isLoading.value = true
      await usersAPI.changePassword(passwordData)
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 上传头像
  const uploadAvatar = async (file) => {
    try {
      isLoading.value = true
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await usersAPI.uploadAvatar(formData)
      
      // 更新用户头像
      if (user.value) {
        user.value.avatar = response.avatar
        setUser(user.value)
      }
      
      return response
    } catch (error) {
      console.error('Upload avatar error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearUser()
    }
  }

  // 刷新token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await authAPI.refreshToken(refreshToken.value)
      setToken(response.token, response.refreshToken)
      
      return response.token
    } catch (error) {
      console.error('Refresh token error:', error)
      clearUser()
      throw error
    }
  }

  return {
    // 状态
    user,
    token,
    refreshToken,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    userName,
    userEmail,
    userAvatar,
    
    // 方法
    setUser,
    setToken,
    clearUser,
    initUser,
    fetchUserProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    logout,
    refreshAccessToken
  }
})