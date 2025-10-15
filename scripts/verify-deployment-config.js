#!/usr/bin/env node

/**
 * Vercel部署配置验证脚本
 * 验证修复后的配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel部署配置验证\n');

// 验证vercel.json配置
function validateVercelConfig() {
  console.log('📋 验证 vercel.json 配置:');
  
  try {
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    
    if (!fs.existsSync(vercelConfigPath)) {
      console.log('❌ vercel.json 文件不存在');
      return false;
    }
    
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // 检查必需的属性
    const requiredProps = ['version', 'buildCommand', 'outputDirectory'];
    const missingProps = requiredProps.filter(prop => !config[prop]);
    
    if (missingProps.length > 0) {
      console.log(`❌ 缺少必需属性: ${missingProps.join(', ')}`);
      return false;
    }
    
    // 检查冲突的属性
    if (config.builds && config.functions) {
      console.log('❌ 检测到配置冲突: builds 和 functions 不能同时使用');
      return false;
    }
    
    console.log('✅ vercel.json 配置正确');
    console.log(`   - 版本: ${config.version}`);
    console.log(`   - 构建命令: ${config.buildCommand}`);
    console.log(`   - 输出目录: ${config.outputDirectory}`);
    
    if (config.functions) {
      console.log('✅ 无服务器函数配置存在');
      Object.keys(config.functions).forEach(func => {
        console.log(`   - ${func}: maxDuration=${config.functions[func].maxDuration}s`);
      });
    }
    
    if (config.rewrites) {
      console.log('✅ 路由重写规则配置正确');
      console.log(`   - 配置了 ${config.rewrites.length} 个重写规则`);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ vercel.json 解析失败:', error.message);
    return false;
  }
}

// 验证package.json文件
function validatePackageJson() {
  console.log('\n📋 验证 package.json 文件:');
  
  const packagePaths = [
    { path: 'package.json', name: '根目录' },
    { path: 'frontend/package.json', name: '前端' },
    { path: 'backend/package.json', name: '后端' }
  ];
  
  let allValid = true;
  
  packagePaths.forEach(({ path: pkgPath, name }) => {
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        console.log(`✅ ${name} package.json 存在`);
        
        if (pkgPath === 'package.json' && pkg.scripts && pkg.scripts['vercel-build']) {
          console.log('✅ 根目录包含 vercel-build 脚本');
        }
        
      } catch (error) {
        console.log(`❌ ${name} package.json 解析失败:`, error.message);
        allValid = false;
      }
    } else {
      console.log(`❌ ${name} package.json 不存在: ${pkgPath}`);
      if (pkgPath === 'package.json') {
        allValid = false;
      }
    }
  });
  
  return allValid;
}

// 验证项目结构
function validateProjectStructure() {
  console.log('\n📋 验证项目结构:');
  
  const requiredDirs = [
    { path: 'frontend', name: '前端目录' },
    { path: 'backend', name: '后端目录' },
    { path: 'frontend/src', name: '前端源码目录' }
  ];
  
  const requiredFiles = [
    { path: 'frontend/index.html', name: '前端入口文件' },
    { path: 'backend/server.js', name: '后端服务器文件' },
    { path: 'frontend/vite.config.js', name: 'Vite配置文件' }
  ];
  
  let allValid = true;
  
  requiredDirs.forEach(({ path: dirPath, name }) => {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      console.log(`✅ ${name} 存在`);
    } else {
      console.log(`❌ ${name} 不存在: ${dirPath}`);
      allValid = false;
    }
  });
  
  requiredFiles.forEach(({ path: filePath, name }) => {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${name} 存在`);
    } else {
      console.log(`❌ ${name} 不存在: ${filePath}`);
      allValid = false;
    }
  });
  
  return allValid;
}

// 显示部署指导
function showDeploymentGuidance() {
  console.log('\n🚀 部署指导:');
  console.log('1. 确保所有修复已推送到GitHub');
  console.log('2. 在Vercel控制台重新部署项目');
  console.log('3. 使用以下配置:');
  console.log('   - Framework Preset: Other');
  console.log('   - Build Command: npm run vercel-build');
  console.log('   - Output Directory: frontend/dist');
  console.log('   - Install Command: npm install');
  console.log('4. 设置必要的环境变量');
  console.log('5. 检查部署日志确认无错误');
}

// 主函数
function main() {
  const vercelValid = validateVercelConfig();
  const packageValid = validatePackageJson();
  const structureValid = validateProjectStructure();
  
  console.log('\n📊 验证结果:');
  console.log(`Vercel配置: ${vercelValid ? '✅ 通过' : '❌ 失败'}`);
  console.log(`Package文件: ${packageValid ? '✅ 通过' : '❌ 失败'}`);
  console.log(`项目结构: ${structureValid ? '✅ 通过' : '❌ 失败'}`);
  
  const allValid = vercelValid && packageValid && structureValid;
  
  if (allValid) {
    console.log('\n🎉 所有验证通过！项目已准备好部署到Vercel。');
  } else {
    console.log('\n⚠️ 发现问题，请修复后重新验证。');
  }
  
  showDeploymentGuidance();
}

if (require.main === module) {
  main();
}