# 🚀 Vercel部署指南

本项目提供了多种自动化部署方案，让你无需手动设置环境变量。

## 📋 准备工作

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

## 🎯 推荐方案：一键部署

### 方案1：交互式一键部署 ⭐⭐⭐⭐⭐

最简单的方式，脚本会引导你输入所有必要信息：

```bash
node scripts/deploy.js
```

**优点：**
- 完全自动化
- 交互式输入，不容易出错
- 自动保存配置备份
- 一次性完成环境变量设置和部署

### 方案2：配置文件方式 ⭐⭐⭐⭐

1. **编辑配置文件**
   ```bash
   # 编辑 vercel-env.json 文件，填写实际值
   ```

2. **运行导入脚本**
   ```bash
   node scripts/import-vercel-env.js
   ```

3. **部署项目**
   ```bash
   vercel --prod
   ```

### 方案3：PowerShell批量设置 ⭐⭐⭐

1. **编辑PowerShell脚本**
   ```powershell
   # 编辑 scripts/setup-vercel-env.ps1
   # 修改其中的环境变量值
   ```

2. **运行脚本**
   ```powershell
   .\scripts\setup-vercel-env.ps1
   ```

## 🔧 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SUPABASE_URL` | Supabase项目URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase服务角色密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | JWT签名密钥 | 随机64位字符串 |
| `EMAIL_USER` | 企业邮箱地址 | `your-email@company.com` |
| `EMAIL_PASS` | 邮箱密码 | `your-email-password` |
| `FRONTEND_URL` | 前端域名 | `https://your-app.vercel.app` |

## 📍 获取Supabase配置

1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 `Settings` > `API`
4. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 🔍 故障排除

### 问题1：Vercel CLI未安装
```bash
npm install -g vercel
```

### 问题2：未登录Vercel
```bash
vercel login
```

### 问题3：环境变量设置失败
- 检查网络连接
- 确认已登录正确的Vercel账户
- 手动在Vercel控制台设置

### 问题4：部署失败
- 检查代码是否已推送到Git仓库
- 确认所有环境变量已正确设置
- 查看Vercel控制台的部署日志

## 🎉 部署成功后

1. **检查前端**：访问Vercel提供的域名
2. **检查后端**：确认API接口正常工作
3. **测试功能**：注册、登录、项目管理等

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看Vercel控制台的部署日志
2. 检查浏览器开发者工具的错误信息
3. 确认所有环境变量值正确

---

💡 **提示**：推荐使用方案1（一键部署），它会自动处理所有复杂的配置步骤。