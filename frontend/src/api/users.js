import api from './index'

// 用户管理相关API
export const usersAPI = {
  // 获取当前用户信息
  getCurrentUser() {
    return api.get('/users/profile')
  },

  // 更新用户信息
  updateProfile(data) {
    return api.put('/users/profile', data)
  },

  // 修改密码
  changePassword(data) {
    return api.put('/users/change-password', data)
  },

  // 上传头像
  uploadAvatar(formData) {
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取团队成员列表
  getTeamMembers() {
    return api.get('/users/team')
  },

  // 获取通知设置
  getNotificationSettings() {
    return api.get('/users/notification-settings')
  },

  // 更新通知设置
  updateNotificationSettings(data) {
    return api.put('/users/notification-settings', data)
  },

  // 管理员：获取所有用户
  getAllUsers(params = {}) {
    return api.get('/users', { params })
  },

  // 管理员：更新用户状态
  updateUserStatus(id, data) {
    return api.put(`/users/${id}/status`, data)
  },

  // 别名函数，保持向后兼容
  getUserProfile() {
    return this.getCurrentUser()
  },

  updateUserProfile(data) {
    return this.updateProfile(data)
  }
}

// 命名导出，支持 import * as usersAPI 的方式
export const getCurrentUser = usersAPI.getCurrentUser.bind(usersAPI)
export const updateProfile = usersAPI.updateProfile.bind(usersAPI)
export const changePassword = usersAPI.changePassword.bind(usersAPI)
export const uploadAvatar = usersAPI.uploadAvatar.bind(usersAPI)
export const getTeamMembers = usersAPI.getTeamMembers.bind(usersAPI)
export const getNotificationSettings = usersAPI.getNotificationSettings.bind(usersAPI)
export const updateNotificationSettings = usersAPI.updateNotificationSettings.bind(usersAPI)
export const getAllUsers = usersAPI.getAllUsers.bind(usersAPI)
export const updateUserStatus = usersAPI.updateUserStatus.bind(usersAPI)
export const getUserProfile = usersAPI.getUserProfile.bind(usersAPI)
export const updateUserProfile = usersAPI.updateUserProfile.bind(usersAPI)

export default usersAPI