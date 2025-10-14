# 专业项目管理系统

一个功能完整的现代化项目管理系统，采用前后端分离架构开发。

## 🚀 功能特性

### 核心功能
- **用户认证系统** - 注册、登录、密码重置
- **项目管理** - 创建、编辑、删除项目
- **任务管理** - 任务分配、状态跟踪、优先级设置
- **团队协作** - 成员管理、权限控制
- **通知系统** - 实时通知、邮件提醒
- **个人资料** - 用户信息管理、头像上传

### 技术特性
- **响应式设计** - 支持各种设备尺寸
- **实时更新** - 数据实时同步
- **安全认证** - JWT token 认证
- **数据持久化** - MongoDB 数据存储
- **模块化架构** - 易于维护和扩展

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 UI 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Vite** - 构建工具

### 后端
- **Node.js** - JavaScript 运行环境
- **Express.js** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模
- **JWT** - 身份验证
- **Nodemailer** - 邮件服务
- **bcryptjs** - 密码加密

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4.0
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/0220fengzheng-byte/mywork.git
   cd mywork
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接等信息
   ```

4. **安装前端依赖**
   ```bash
   cd ../frontend
   npm install
   ```

### 运行项目

1. **启动后端服务**
   ```bash
   cd backend
   npm run dev
   ```
   后端服务将在 http://localhost:5000 启动

2. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```
   前端服务将在 http://localhost:5173 启动

## 📁 项目结构

```
project-management-system/
├── backend/                 # 后端代码
│   ├── config/             # 配置文件
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # 路由定义
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   └── server.js           # 服务器入口
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # 状态管理
│   │   └── views/         # 页面视图
│   └── vite.config.js     # Vite 配置
└── README.md              # 项目说明
```

## 🎯 主要页面

- **登录/注册页面** - 用户身份验证
- **仪表板** - 项目概览和统计
- **项目管理** - 项目列表和详情
- **个人资料** - 用户信息和设置
- **通知中心** - 消息和提醒

## 🔧 开发说明

### API 接口
- 基础URL: `http://localhost:5000/api`
- 认证方式: Bearer Token (JWT)
- 数据格式: JSON

### 主要 API 端点
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /projects` - 获取项目列表
- `POST /projects` - 创建新项目
- `GET /users/team` - 获取团队成员
- `GET /notifications` - 获取通知列表

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **fengzheng** - [0220fengzheng-byte](https://github.com/0220fengzheng-byte)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和开源社区的支持。