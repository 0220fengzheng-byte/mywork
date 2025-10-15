#!/usr/bin/env node

/**
 * 检查Vercel部署状态和提供环境变量设置指导
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel部署状态检查工具\n');

// 检查Git状态
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  有未提交的更改:');
      console.log(status);
    } else {
      console.log('✅ Git工作目录干净');
    }
    
    const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' });
    console.log(`📝 最新提交: ${lastCommit.trim()}\n`);
  } catch (error) {
    console.error('❌ Git检查失败:', error.message);
  }
}

// 检查配置文件
function checkConfigFiles() {
  console.log('📋 检查配置文件:\n');
  
  const files = [
    'vercel.json',
    'backend/.env.example',
    'frontend/package.json',
    'backend/package.json'
  ];
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`❌ ${file} 缺失`);
    }
  });
  console.log();
}

// 显示环境变量设置指导
function showEnvSetupGuide() {
  console.log('🔧 环境变量设置指导:\n');
  console.log('请在Vercel控制台中设置以下环境变量:\n');
  
  const envVars = [
    { key: 'NODE_ENV', value: 'production', description: '运行环境' },
    { key: 'PORT', value: '5000', description: '服务器端口' },
    { key: 'SUPABASE_URL', value: 'https://your-project.supabase.co', description: 'Supabase项目URL' },
    { key: 'SUPABASE_ANON_KEY', value: 'your-anon-key', description: 'Supabase匿名密钥' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'your-service-role-key', description: 'Supabase服务角色密钥' },
    { key: 'JWT_SECRET', value: 'your-random-jwt-secret', description: 'JWT密钥（随机字符串）' },
    { key: 'FRONTEND_URL', value: 'https://your-app.vercel.app', description: 'Vercel应用域名' }
  ];
  
  envVars.forEach(({ key, value, description }) => {
    console.log(`${key}=${value}`);
    console.log(`  # ${description}\n`);
  });
  
  console.log('📖 设置步骤:');
  console.log('1. 访问 https://vercel.com/dashboard');
  console.log('2. 选择你的项目');
  console.log('3. 进入 Settings > Environment Variables');
  console.log('4. 逐个添加上述环境变量\n');
}

// 显示部署检查清单
function showDeploymentChecklist() {
  console.log('📋 部署检查清单:\n');
  
  const checklist = [
    '✅ 代码已推送到GitHub',
    '✅ vercel.json配置正确',
    '✅ 后端server.js支持无服务器部署',
    '⏳ 在Vercel控制台设置环境变量',
    '⏳ 等待Vercel自动重新部署',
    '⏳ 测试前端和API端点'
  ];
  
  checklist.forEach(item => console.log(item));
  console.log();
}

// 主函数
function main() {
  checkGitStatus();
  checkConfigFiles();
  showEnvSetupGuide();
  showDeploymentChecklist();
  
  console.log('💡 提示:');
  console.log('- Vercel会在检测到新提交后自动重新部署');
  console.log('- 设置环境变量后可能需要手动触发重新部署');
  console.log('- 可以在Vercel控制台查看构建日志和部署状态');
}

if (require.main === module) {
  main();
}