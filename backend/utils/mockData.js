const bcrypt = require('bcryptjs');

// 模拟用户数据
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    name: '系统管理员',
    role: 'admin',
    department: 'IT部门',
    phone: '13800138000',
    isActive: true,
    isEmailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439012',
    email: 'user1@example.com',
    password: bcrypt.hashSync('123456', 10),
    name: '张三',
    role: 'user',
    department: '产品部',
    phone: '13800138001',
    isActive: true,
    isEmailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439013',
    email: 'user2@example.com',
    password: bcrypt.hashSync('123456', 10),
    name: '李四',
    role: 'user',
    department: '开发部',
    phone: '13800138002',
    isActive: true,
    isEmailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439014',
    email: 'manager@example.com',
    password: bcrypt.hashSync('123456', 10),
    name: '王经理',
    role: 'manager',
    department: '项目部',
    phone: '13800138003',
    isActive: true,
    isEmailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 模拟项目数据
const mockProjects = [
  {
    _id: '507f1f77bcf86cd799439021',
    name: '网站重构项目',
    description: '对公司官网进行全面重构，提升用户体验',
    requesterId: '507f1f77bcf86cd799439011',
    assigneeId: '507f1f77bcf86cd799439012',
    status: '进行中',
    priority: '高',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    documentUrl: 'https://example.com/doc1',
    documentTitle: '项目需求文档',
    images: [],
    notes: '项目进展顺利，预计按时完成',
    workHours: [
      {
        date: new Date(),
        hours: 8,
        description: '完成首页设计'
      }
    ],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '507f1f77bcf86cd799439022',
    name: '移动端APP开发',
    description: '开发公司移动端应用，支持iOS和Android',
    requesterId: '507f1f77bcf86cd799439014',
    assigneeId: '507f1f77bcf86cd799439013',
    status: '待开始',
    priority: '中',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天后
    documentUrl: 'https://example.com/doc2',
    documentTitle: 'APP功能规格书',
    images: [],
    notes: '等待UI设计完成',
    workHours: [],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 模拟通知数据
const mockNotifications = [
  {
    _id: '507f1f77bcf86cd799439031',
    userId: '507f1f77bcf86cd799439012',
    senderId: '507f1f77bcf86cd799439011',
    type: 'project_assignment',
    title: '新项目分配',
    content: '您被分配了新项目：网站重构项目',
    relatedProjectId: '507f1f77bcf86cd799439021',
    isRead: false,
    isEmailSent: false,
    metadata: {
      projectName: '网站重构项目',
      priority: '高'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 模拟用户通知设置
const mockUserNotificationSettings = [
  {
    _id: '507f1f77bcf86cd799439041',
    userId: '507f1f77bcf86cd799439011',
    emailDeadlineReminder: true,
    emailStatusChange: true,
    emailAssignment: true,
    emailWeeklyReport: true,
    siteDeadlineReminder: true,
    siteStatusChange: true,
    siteAssignment: true,
    reminderDaysBefore: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  mockUsers,
  mockProjects,
  mockNotifications,
  mockUserNotificationSettings
};