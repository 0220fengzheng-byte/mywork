import api from './index'

// 通知相关API
export const notificationsAPI = {
  // 获取通知列表
  getNotifications(params = {}) {
    return api.get('/notifications', { params })
  },

  // 标记通知为已读
  markAsRead(id) {
    return api.put(`/notifications/${id}/read`)
  },

  // 标记所有通知为已读
  markAllAsRead() {
    return api.put('/notifications/read-all')
  },

  // 删除通知
  deleteNotification(id) {
    return api.delete(`/notifications/${id}`)
  },

  // 批量删除已读通知
  deleteReadNotifications() {
    return api.delete('/notifications/read')
  },

  // 获取未读通知数量
  getUnreadCount() {
    return api.get('/notifications/unread-count')
  }
}

export default notificationsAPI