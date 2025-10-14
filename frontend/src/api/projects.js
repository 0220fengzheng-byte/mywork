import api from './index'

// 项目管理相关API
export const projectsAPI = {
  // 获取项目列表
  getProjects(params = {}) {
    return api.get('/projects', { params })
  },

  // 获取项目详情
  getProject(id) {
    return api.get(`/projects/${id}`)
  },

  // 创建项目
  createProject(data) {
    return api.post('/projects', data)
  },

  // 更新项目
  updateProject(id, data) {
    return api.put(`/projects/${id}`, data)
  },

  // 删除项目
  deleteProject(id) {
    return api.delete(`/projects/${id}`)
  },

  // 上传项目图片
  uploadImage(id, formData) {
    return api.post(`/projects/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除项目图片
  deleteImage(id, imageId) {
    return api.delete(`/projects/${id}/images/${imageId}`)
  },

  // 添加工时记录
  addWorkHours(id, data) {
    return api.post(`/projects/${id}/work-hours`, data)
  },

  // 获取项目统计
  getProjectStats() {
    return api.get('/projects/stats')
  }
}

export default projectsAPI