import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersAPI } from '../api/users'
import { authAPI } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  // 默认用户信息
  const defaultUser = {
    id: 1,
    name: '默认用户',
    email: 'user@example.com',
    department: '产品部',
    phone: '13800138000',
    role: 'user',
    avatar: ''
  }

  // 状态
  const user = ref(defaultUser)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => true) // 始终认为已认证
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userAvatar = computed(() => user.value?.avatar || '')

  // 设置用户信息
  const setUser = (userData) => {
    user.value = { ...defaultUser, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 初始化用户信息
  const initUser = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        user.value = { ...defaultUser, ...userData }
      } catch (error) {
        console.error('Parse stored user failed:', error)
        user.value = defaultUser
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

  return {
    // 状态
    user,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    userName,
    userEmail,
    userAvatar,
    
    // 方法
    setUser,
    initUser,
    fetchUserProfile,
    updateProfile,
    changePassword,
    uploadAvatar
  }
})