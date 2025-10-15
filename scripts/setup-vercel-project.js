#!/usr/bin/env node

/**
 * Vercel项目重新设置脚本
 * 解决DEPLOYMENT_NOT_FOUND错误
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel项目重新设置工具\n');

// 检查当前项目状态
function checkCurrentStatus() {
  console.log('📋 检查当前项目状态:\n');
  
  try {
    // 检查Git仓库
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`✅ Git仓库: ${remoteUrl}`);
    
    // 检查最新提交
    const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    console.log(`📝 最新提交: ${lastCommit}`);
    
    // 检查配置文件
    const configFiles = ['vercel.json', 'package.json'];
    configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} 存在`);
      } else {
        console.log(`❌ ${file} 缺失`);
      }
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
  console.log();
}

// 显示Vercel项目设置指导
function showVercelSetupGuide() {
  console.log('🚀 Vercel项目设置指导:\n');
  
  console.log('方法1: 通过Vercel控制台设置');
  console.log('1. 访问 https://vercel.com/dashboard');
  console.log('2. 点击 "Add New..." > "Project"');
  console.log('3. 选择 "Import Git Repository"');
  console.log('4. 找到并选择你的GitHub仓库: 0220fengzheng-byte/mywork');
  console.log('5. 配置项目设置:');
  console.log('   - Project Name: project-management-system');
  console.log('   - Framework Preset: Other');
  console.log('   - Root Directory: ./');
  console.log('   - Build Command: 留空（使用vercel.json配置）');
  console.log('   - Output Directory: 留空（使用vercel.json配置）');
  console.log('6. 点击 "Deploy"\n');
  
  console.log('方法2: 通过Vercel CLI设置');
  console.log('1. 确保已登录: vercel login');
  console.log('2. 在项目根目录运行: vercel');
  console.log('3. 选择 "Link to existing project" 或 "Create new project"');
  console.log('4. 按提示完成设置\n');
}

// 显示环境变量设置指导
function showEnvironmentVariables() {
  console.log('🔧 环境变量设置（在Vercel控制台中设置）:\n');
  
  const envVars = [
    'NODE_ENV=production',
    'PORT=5000',
    'SUPABASE_URL=https://your-project.supabase.co',
    'SUPABASE_ANON_KEY=your-anon-key',
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
    'JWT_SECRET=your-random-jwt-secret',
    'FRONTEND_URL=https://your-app.vercel.app'
  ];
  
  envVars.forEach(env => console.log(`  ${env}`));
  console.log();
}

// 显示故障排除步骤
function showTroubleshooting() {
  console.log('🔍 DEPLOYMENT_NOT_FOUND 故障排除:\n');
  
  console.log('可能的原因和解决方案:');
  console.log('1. 项目未正确连接到Vercel');
  console.log('   → 重新导入GitHub仓库到Vercel');
  console.log();
  console.log('2. 部署被意外删除');
  console.log('   → 触发新的部署');
  console.log();
  console.log('3. 项目配置错误');
  console.log('   → 检查vercel.json配置');
  console.log();
  console.log('4. GitHub集成问题');
  console.log('   → 重新授权GitHub集成');
  console.log();
}

// 生成部署命令
function generateDeployCommands() {
  console.log('⚡ 快速部署命令:\n');
  
  console.log('如果你有Vercel CLI访问权限:');
  console.log('```bash');
  console.log('# 登录Vercel');
  console.log('vercel login');
  console.log();
  console.log('# 部署项目');
  console.log('vercel --prod');
  console.log('```\n');
  
  console.log('或者通过Git触发自动部署:');
  console.log('```bash');
  console.log('# 创建空提交触发部署');
  console.log('git commit --allow-empty -m "trigger: 重新部署"');
  console.log('git push');
  console.log('```\n');
}

// 主函数
function main() {
  checkCurrentStatus();
  showVercelSetupGuide();
  showEnvironmentVariables();
  showTroubleshooting();
  generateDeployCommands();
  
  console.log('💡 建议的解决步骤:');
  console.log('1. 首先尝试通过Vercel控制台重新导入项目');
  console.log('2. 设置所有必需的环境变量');
  console.log('3. 触发新的部署');
  console.log('4. 如果问题持续，检查构建日志');
}

if (require.main === module) {
  main();
}