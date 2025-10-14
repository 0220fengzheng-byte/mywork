import { defineStore } from 'pinia'

const STORAGE_KEY = 'projects'

function defaultProjects() {
  return [
    {
      id: 1,
      name: '用户认证系统',
      status: '进行中',
      deadline: '2025-10-15',
      description: '实现登录、注册、忘记密码以及基本守卫功能。包括用户界面设计、后端API开发、数据库设计等完整的用户认证解决方案。',
      createdAt: '2025-01-01',
      requesterName: '张三',
      assigneeName: '李四',
      priority: '高',
      documentUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      documentTitle: '用户认证系统需求文档',
      imageFiles: [
        {
          name: '登录页面设计稿.png',
          url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&h=600&fit=crop',
          size: 245760,
          type: 'image/png'
        },
        {
          name: '注册流程图.jpg',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
          size: 189440,
          type: 'image/jpeg'
        },
        {
          name: '用户界面原型.png',
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          size: 312320,
          type: 'image/png'
        }
      ],
      documents: [
        {
          id: 1,
          name: '需求文档',
          url: 'https://docs.google.com/document/d/1234567890',
          type: 'google_docs',
          uploadedAt: '2025-01-01',
          uploadedBy: '张三'
        },
        {
          id: 2,
          name: '设计稿',
          url: '/uploads/design.pdf',
          type: 'pdf',
          uploadedAt: '2025-01-02',
          uploadedBy: '李四'
        }
      ],
      workHours: [
        {
          id: 1,
          date: '2025-01-01',
          hours: 8,
          description: '完成登录页面开发',
          user: '张三'
        },
        {
          id: 2,
          date: '2025-01-02',
          hours: 6,
          description: '注册页面开发进行中',
          user: '李四'
        }
      ],
      tasks: [
        { id: 1, name: '登录页面', status: '已完成', assignee: '张三' },
        { id: 2, name: '注册页面', status: '进行中', assignee: '李四' }
      ]
    },
    {
      id: 2,
      name: '项目管理模块',
      status: '未开始',
      deadline: '2025-11-20',
      description: '开发完整的项目管理功能，包括项目列表、详情页面、任务管理、进度跟踪等核心功能模块。',
      createdAt: '2025-01-05',
      requesterName: '王五',
      assigneeName: '赵六',
      priority: '中',
      documentUrl: 'https://www.figma.com/file/abc123/project-management-design',
      documentTitle: '项目管理模块设计文档',
      imageFiles: [
        {
          name: '项目列表界面.png',
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
          size: 278528,
          type: 'image/png'
        },
        {
          name: '任务管理界面.jpg',
          url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop',
          size: 234567,
          type: 'image/jpeg'
        }
      ],
      documents: [],
      workHours: [],
      tasks: [
        { id: 1, name: '项目列表页面', status: '未开始', assignee: '王五' }
      ]
    },
    {
      id: 3,
      name: '通知系统',
      status: '已完成',
      deadline: '2025-09-30',
      description: '实现实时消息推送、站内通知、邮件提醒等完整的通知解决方案，支持多种通知类型和个性化设置。',
      createdAt: '2024-12-15',
      requesterName: '赵六',
      assigneeName: '孙七',
      priority: '低',
      documentUrl: '',
      documentTitle: '',
      imageFiles: [
        {
          name: '通知中心界面.png',
          url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
          size: 198765,
          type: 'image/png'
        }
      ],
      documents: [
        {
          id: 1,
          name: '通知系统架构',
          url: 'https://www.figma.com/file/notification-system',
          type: 'figma',
          uploadedAt: '2024-12-16',
          uploadedBy: '赵六'
        }
      ],
      workHours: [
        {
          id: 1,
          date: '2024-12-20',
          hours: 10,
          description: '完成通知组件开发',
          user: '赵六'
        }
      ],
      tasks: [
        { id: 1, name: '通知组件', status: '已完成', assignee: '赵六' }
      ]
    }
  ]
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return defaultProjects()
}

function computeMaxId(list) {
  return (list || []).reduce((m, p) => Math.max(m, Number(p.id) || 0), 0)
}

export const useProjectsStore = defineStore('projects', {
  state: () => {
    const projects = loadFromStorage()
    return {
      projects,
      lastId: computeMaxId(projects)
    }
  },
  getters: {
    totalProjects: (state) => state.projects.length,
    totalTasks: (state) => state.projects.reduce((sum, p) => sum + ((p.tasks || []).length), 0),
    ongoingTasks: (state) => state.projects.reduce((sum, p) => sum + (p.tasks || []).filter(t => t.status === '进行中').length, 0)
  },
  actions: {
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects))
    },
    addProject(project) {
      const id = ++this.lastId
      this.projects.push({ ...project, id, tasks: project.tasks || [] })
      this.save()
      return id
    },
    updateProject(id, patch) {
      const p = this.getProjectById(id)
      if (!p) return
      Object.assign(p, patch)
      this.save()
    },
    deleteProject(id) {
      const idx = this.projects.findIndex(p => String(p.id) === String(id))
      if (idx !== -1) {
        this.projects.splice(idx, 1)
        this.save()
      }
    },
    getProjectById(id) {
      return this.projects.find(p => String(p.id) === String(id))
    },
    addTask(projectId, task) {
      const p = this.getProjectById(projectId)
      if (!p) return
      p.tasks = p.tasks || []
      const nextId = (p.tasks.length ? Math.max(...p.tasks.map(t => Number(t.id) || 0)) : 0) + 1
      p.tasks.push({ ...task, id: nextId })
      this.save()
    },
    updateTask(projectId, taskId, patch) {
      const p = this.getProjectById(projectId)
      if (!p || !p.tasks) return
      const t = p.tasks.find(t => String(t.id) === String(taskId))
      if (!t) return
      Object.assign(t, patch)
      this.save()
    },
    deleteTask(projectId, taskId) {
      const p = this.getProjectById(projectId)
      if (!p || !p.tasks) return
      const idx = p.tasks.findIndex(t => String(t.id) === String(taskId))
      if (idx !== -1) {
        p.tasks.splice(idx, 1)
        this.save()
      }
    },
    
    // 文档管理
    addDocument(projectId, document) {
      const p = this.getProjectById(projectId)
      if (!p) return
      p.documents = p.documents || []
      const nextId = (p.documents.length ? Math.max(...p.documents.map(d => Number(d.id) || 0)) : 0) + 1
      p.documents.push({ 
        ...document, 
        id: nextId,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: '当前用户' // 实际应用中应该从用户store获取
      })
      this.save()
      return nextId
    },
    updateDocument(projectId, documentId, patch) {
      const p = this.getProjectById(projectId)
      if (!p || !p.documents) return
      const d = p.documents.find(d => String(d.id) === String(documentId))
      if (!d) return
      Object.assign(d, patch)
      this.save()
    },
    deleteDocument(projectId, documentId) {
      const p = this.getProjectById(projectId)
      if (!p || !p.documents) return
      const idx = p.documents.findIndex(d => String(d.id) === String(documentId))
      if (idx !== -1) {
        p.documents.splice(idx, 1)
        this.save()
      }
    },
    
    // 工时管理
    addWorkHour(projectId, workHour) {
      const p = this.getProjectById(projectId)
      if (!p) return
      p.workHours = p.workHours || []
      const nextId = (p.workHours.length ? Math.max(...p.workHours.map(w => Number(w.id) || 0)) : 0) + 1
      p.workHours.push({ 
        ...workHour, 
        id: nextId,
        user: '当前用户' // 实际应用中应该从用户store获取
      })
      this.save()
      return nextId
    },
    updateWorkHour(projectId, workHourId, patch) {
      const p = this.getProjectById(projectId)
      if (!p || !p.workHours) return
      const w = p.workHours.find(w => String(w.id) === String(workHourId))
      if (!w) return
      Object.assign(w, patch)
      this.save()
    },
    deleteWorkHour(projectId, workHourId) {
      const p = this.getProjectById(projectId)
      if (!p || !p.workHours) return
      const idx = p.workHours.findIndex(w => String(w.id) === String(workHourId))
      if (idx !== -1) {
        p.workHours.splice(idx, 1)
        this.save()
      }
    }
  }
})