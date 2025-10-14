#!/usr/bin/env node

/**
 * Vercel环境变量自动配置脚本
 * 使用方法：
 * 1. 安装Vercel CLI: npm install -g vercel
 * 2. 登录Vercel: vercel login
 * 3. 运行此脚本: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取.env.example文件获取环境变量模板
function readEnvExample() {
  const envExamplePath = path.join(__dirname, '../backend/.env.example');
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ 找不到 .env.example 文件');
    process.exit(1);
  }
  
  const content = fs.readFileSync(envExamplePath, 'utf8');
  const envVars = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, value] = line.split('=');
      envVars[key.trim()] = value.trim();
    }
  });
  
  return envVars;
}

// 提示用户输入环境变量值
function promptForEnvVars(envVars) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const keys = Object.keys(envVars);
    const userInputs = {};
    let currentIndex = 0;

    function askNext() {
      if (currentIndex >= keys.length) {
        rl.close();
        resolve(userInputs);
        return;
      }

      const key = keys[currentIndex];
      const defaultValue = envVars[key];
      
      rl.question(`请输入 ${key} 的值 (默认: ${defaultValue}): `, (answer) => {
        userInputs[key] = answer.trim() || defaultValue;
        currentIndex++;
        askNext();
      });
    }

    console.log('\n🔧 请输入环境变量值（直接回车使用默认值）:\n');
    askNext();
  });
}

// 设置Vercel环境变量
function setVercelEnvVars(envVars) {
  console.log('\n🚀 开始设置Vercel环境变量...\n');
  
  Object.entries(envVars).forEach(([key, value]) => {
    try {
      // 为生产环境设置环境变量
      const command = `vercel env add ${key} production`;
      console.log(`设置 ${key}...`);
      
      // 这里需要手动输入值，所以我们先输出命令
      console.log(`请运行: echo "${value}" | ${command}`);
      
    } catch (error) {
      console.error(`❌ 设置 ${key} 失败:`, error.message);
    }
  });
}

// 主函数
async function main() {
  try {
    console.log('🎯 Vercel环境变量自动配置工具\n');
    
    // 检查是否安装了Vercel CLI
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ 请先安装Vercel CLI: npm install -g vercel');
      process.exit(1);
    }
    
    // 检查是否已登录Vercel
    try {
      execSync('vercel whoami', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ 请先登录Vercel: vercel login');
      process.exit(1);
    }
    
    // 读取环境变量模板
    const envVars = readEnvExample();
    console.log(`📋 找到 ${Object.keys(envVars).length} 个环境变量\n`);
    
    // 获取用户输入
    const userInputs = await promptForEnvVars(envVars);
    
    // 生成设置命令
    console.log('\n📝 生成的Vercel环境变量设置命令:\n');
    Object.entries(userInputs).forEach(([key, value]) => {
      console.log(`vercel env add ${key} production`);
      console.log(`# 输入值: ${value}\n`);
    });
    
    console.log('💡 提示: 你可以复制上述命令逐个执行，或者使用下面的批量脚本');
    
  } catch (error) {
    console.error('❌ 配置失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { readEnvExample, setVercelEnvVars };