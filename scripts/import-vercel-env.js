#!/usr/bin/env node

/**
 * 从vercel-env.json文件导入环境变量到Vercel
 * 使用方法：
 * 1. 填写vercel-env.json文件中的环境变量值
 * 2. 运行: node scripts/import-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  console.log('🎯 Vercel环境变量导入工具\n');
  
  // 检查配置文件
  const configPath = path.join(__dirname, '../vercel-env.json');
  if (!fs.existsSync(configPath)) {
    console.error('❌ 找不到 vercel-env.json 配置文件');
    process.exit(1);
  }
  
  // 读取配置
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('❌ 解析配置文件失败:', error.message);
    process.exit(1);
  }
  
  const envVars = config.production;
  if (!envVars) {
    console.error('❌ 配置文件中找不到 production 环境变量');
    process.exit(1);
  }
  
  // 检查是否有未配置的值
  const unsetVars = [];
  Object.entries(envVars).forEach(([key, value]) => {
    if (typeof value === 'string' && (value.includes('请填写') || value.includes('your'))) {
      unsetVars.push(key);
    }
  });
  
  if (unsetVars.length > 0) {
    console.error('❌ 以下环境变量还未配置实际值:');
    unsetVars.forEach(key => {
      console.error(`   - ${key}: ${envVars[key]}`);
    });
    console.error('\n请先在 vercel-env.json 文件中填写实际值');
    process.exit(1);
  }
  
  // 检查Vercel CLI
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ 请先安装Vercel CLI: npm install -g vercel');
    process.exit(1);
  }
  
  // 检查登录状态
  try {
    const user = execSync('vercel whoami', { encoding: 'utf8' }).trim();
    console.log(`✅ 已登录Vercel用户: ${user}\n`);
  } catch (error) {
    console.error('❌ 请先登录Vercel: vercel login');
    process.exit(1);
  }
  
  // 生成批量设置命令
  console.log('📝 生成的设置命令:\n');
  
  const commands = [];
  Object.entries(envVars).forEach(([key, value]) => {
    const command = `echo "${value}" | vercel env add ${key} production`;
    commands.push(command);
    console.log(command);
  });
  
  console.log('\n💡 你可以复制上述命令逐个执行');
  console.log('或者运行以下批处理文件:\n');
  
  // 生成批处理文件
  const batchContent = commands.join('\n');
  const batchPath = path.join(__dirname, 'set-vercel-env.bat');
  
  try {
    fs.writeFileSync(batchPath, batchContent);
    console.log(`✅ 已生成批处理文件: ${batchPath}`);
    console.log('💡 运行该文件可批量设置所有环境变量');
  } catch (error) {
    console.error('❌ 生成批处理文件失败:', error.message);
  }
  
  console.log('\n🚀 设置完成后，运行 "vercel --prod" 部署项目');
}

if (require.main === module) {
  main();
}