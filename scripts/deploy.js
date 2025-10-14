#!/usr/bin/env node

/**
 * 一键部署脚本
 * 自动化整个部署流程，包括环境变量设置和项目部署
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class VercelDeployer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async checkPrerequisites() {
    console.log('🔍 检查部署环境...\n');
    
    // 检查Vercel CLI
    try {
      const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Vercel CLI: ${version}`);
    } catch (error) {
      console.error('❌ Vercel CLI未安装');
      console.log('💡 安装命令: npm install -g vercel');
      return false;
    }
    
    // 检查登录状态
    try {
      const user = execSync('vercel whoami', { encoding: 'utf8' }).trim();
      console.log(`✅ 已登录用户: ${user}`);
    } catch (error) {
      console.error('❌ 未登录Vercel');
      console.log('💡 登录命令: vercel login');
      return false;
    }
    
    console.log('');
    return true;
  }

  async collectEnvVars() {
    console.log('📝 配置环境变量\n');
    
    const envVars = {};
    
    // 基础配置
    envVars.PORT = '5000';
    envVars.NODE_ENV = 'production';
    
    // Supabase配置
    console.log('🗄️  Supabase数据库配置:');
    envVars.SUPABASE_URL = await this.question('Supabase项目URL: ');
    envVars.SUPABASE_ANON_KEY = await this.question('Supabase匿名密钥: ');
    envVars.SUPABASE_SERVICE_ROLE_KEY = await this.question('Supabase服务角色密钥: ');
    
    // JWT配置
    console.log('\n🔐 JWT配置:');
    const defaultJwtSecret = this.generateRandomString(64);
    const jwtInput = await this.question(`JWT密钥 (默认随机生成): `);
    envVars.JWT_SECRET = jwtInput.trim() || defaultJwtSecret;
    
    // 邮件配置
    console.log('\n📧 邮件服务配置:');
    envVars.EMAIL_HOST = 'smtp.mxhichina.com';
    envVars.EMAIL_PORT = '465';
    envVars.EMAIL_USER = await this.question('企业邮箱地址: ');
    envVars.EMAIL_PASS = await this.question('邮箱密码: ');
    envVars.EMAIL_FROM_NAME = '项目管理系统';
    
    // 前端URL
    console.log('\n🌐 前端配置:');
    envVars.FRONTEND_URL = await this.question('前端域名 (如: https://your-app.vercel.app): ');
    
    return envVars;
  }

  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async setEnvVars(envVars) {
    console.log('\n🚀 设置环境变量...\n');
    
    const total = Object.keys(envVars).length;
    let success = 0;
    
    for (const [key, value] of Object.entries(envVars)) {
      try {
        console.log(`设置 ${key}...`);
        
        // 使用spawn来处理交互式命令
        await new Promise((resolve, reject) => {
          const child = spawn('vercel', ['env', 'add', key, 'production'], {
            stdio: ['pipe', 'inherit', 'inherit']
          });
          
          child.stdin.write(value + '\n');
          child.stdin.end();
          
          child.on('close', (code) => {
            if (code === 0) {
              success++;
              resolve();
            } else {
              reject(new Error(`Command failed with code ${code}`));
            }
          });
        });
        
      } catch (error) {
        console.error(`❌ 设置 ${key} 失败:`, error.message);
      }
    }
    
    console.log(`\n📊 环境变量设置完成: ${success}/${total}`);
    return success === total;
  }

  async deployProject() {
    console.log('\n🚀 开始部署项目...\n');
    
    try {
      // 部署到生产环境
      execSync('vercel --prod', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n🎉 部署成功！');
      return true;
    } catch (error) {
      console.error('\n❌ 部署失败:', error.message);
      return false;
    }
  }

  async saveConfig(envVars) {
    const configPath = path.join(__dirname, '../vercel-env.json');
    const config = {
      comment: "Vercel环境变量配置备份",
      production: envVars,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`💾 配置已保存到: ${configPath}`);
    } catch (error) {
      console.error('❌ 保存配置失败:', error.message);
    }
  }

  async run() {
    try {
      console.log('🎯 Vercel一键部署工具\n');
      
      // 检查环境
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        process.exit(1);
      }
      
      // 询问是否继续
      const proceed = await this.question('是否继续部署? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('部署已取消');
        process.exit(0);
      }
      
      // 收集环境变量
      const envVars = await this.collectEnvVars();
      
      // 保存配置
      await this.saveConfig(envVars);
      
      // 设置环境变量
      const envSuccess = await this.setEnvVars(envVars);
      if (!envSuccess) {
        console.log('\n⚠️  部分环境变量设置失败，但可以继续部署');
      }
      
      // 部署项目
      const deploySuccess = await this.deployProject();
      
      if (deploySuccess) {
        console.log('\n🎉 部署完成！');
        console.log('💡 你可以在Vercel控制台查看部署状态');
      }
      
    } catch (error) {
      console.error('\n❌ 部署过程中出现错误:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// 运行部署器
if (require.main === module) {
  const deployer = new VercelDeployer();
  deployer.run();
}