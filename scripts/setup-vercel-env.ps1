# Vercel环境变量批量设置脚本
# 使用方法：
# 1. 安装Vercel CLI: npm install -g vercel
# 2. 登录Vercel: vercel login
# 3. 修改下面的环境变量值
# 4. 运行脚本: .\scripts\setup-vercel-env.ps1

Write-Host "🎯 Vercel环境变量批量设置工具" -ForegroundColor Green
Write-Host ""

# 检查Vercel CLI是否安装
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI已安装: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 请先安装Vercel CLI: npm install -g vercel" -ForegroundColor Red
    exit 1
}

# 检查是否已登录
try {
    $user = vercel whoami
    Write-Host "✅ 已登录Vercel用户: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ 请先登录Vercel: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 请修改下面的环境变量值，然后运行脚本:" -ForegroundColor Yellow
Write-Host ""

# 环境变量配置 - 请修改这些值
$envVars = @{
    "PORT" = "5000"
    "NODE_ENV" = "production"
    "SUPABASE_URL" = "你的Supabase项目URL"
    "SUPABASE_ANON_KEY" = "你的Supabase匿名密钥"
    "SUPABASE_SERVICE_ROLE_KEY" = "你的Supabase服务角色密钥"
    "JWT_SECRET" = "你的JWT密钥"
    "EMAIL_HOST" = "smtp.mxhichina.com"
    "EMAIL_PORT" = "465"
    "EMAIL_USER" = "你的企业邮箱地址"
    "EMAIL_PASS" = "你的邮箱密码"
    "EMAIL_FROM_NAME" = "项目管理系统"
    "FRONTEND_URL" = "你的Vercel前端域名"
}

# 检查是否有未配置的值
$hasDefaultValues = $false
foreach ($key in $envVars.Keys) {
    if ($envVars[$key] -like "*你的*" -or $envVars[$key] -like "*your*") {
        Write-Host "⚠️  $key 还未配置实际值: $($envVars[$key])" -ForegroundColor Yellow
        $hasDefaultValues = $true
    }
}

if ($hasDefaultValues) {
    Write-Host ""
    Write-Host "❌ 请先修改脚本中的环境变量值，然后重新运行" -ForegroundColor Red
    Write-Host "📝 需要修改的文件: scripts\setup-vercel-env.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "🚀 开始设置环境变量..." -ForegroundColor Green
Write-Host ""

# 设置环境变量
$successCount = 0
$totalCount = $envVars.Count

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "设置 $key..." -NoNewline
    
    try {
        # 使用echo传递值给vercel env add命令
        $result = echo $value | vercel env add $key production 2>&1
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host " ❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 设置完成: $successCount/$totalCount 个环境变量设置成功" -ForegroundColor Green

if ($successCount -eq $totalCount) {
    Write-Host "🎉 所有环境变量设置成功！现在可以部署项目了。" -ForegroundColor Green
    Write-Host "💡 运行 'vercel --prod' 来部署到生产环境" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  部分环境变量设置失败，请检查错误信息" -ForegroundColor Yellow
}