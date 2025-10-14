const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const { mockUsers } = require('../utils/mockData');

const router = express.Router();

// 模拟数据库操作
let users = [...mockUsers];
let refreshTokens = new Set();

// 登录
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return res.status(401).json({ message: '账户已被禁用' });
    }

    // 生成tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    refreshTokens.add(refreshToken);

    // 返回用户信息（不包含密码）
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.json({
      message: '登录成功',
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 注册
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: errors.array() 
      });
    }

    const { email, password, name, department, phone } = req.body;

    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: Date.now().toString(), // 简单的ID生成
      email,
      password: hashedPassword,
      name,
      role: 'user',
      department: department || '',
      phone: phone || '',
      isActive: true,
      isEmailVerified: true, // 简化验证流程
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // 生成tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    refreshTokens.add(refreshToken);

    // 返回用户信息（不包含密码）
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      phone: newUser.phone,
      avatar: newUser.avatar,
      isEmailVerified: newUser.isEmailVerified
    };

    res.status(201).json({
      message: '注册成功',
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 刷新token
router.post('/refresh', [
  body('refreshToken').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '刷新token不能为空',
        errors: errors.array() 
      });
    }

    const { refreshToken } = req.body;

    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({ message: '无效的刷新token' });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = users.find(u => u._id === decoded.userId);
      
      if (!user || !user.isActive) {
        refreshTokens.delete(refreshToken);
        return res.status(401).json({ message: '用户不存在或已被禁用' });
      }

      // 生成新的tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
      
      // 移除旧的refresh token，添加新的
      refreshTokens.delete(refreshToken);
      refreshTokens.add(newRefreshToken);

      res.json({
        token: accessToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      refreshTokens.delete(refreshToken);
      return res.status(401).json({ message: '无效的刷新token' });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 登出
router.post('/logout', auth, async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 验证token
router.get('/verify-token', auth, async (req, res) => {
  try {
    const user = users.find(u => u._id === req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: '用户不存在或已被禁用' });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.json({
      valid: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 忘记密码
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '邮箱格式不正确',
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const user = users.find(u => u.email === email);

    // 无论用户是否存在都返回成功，避免邮箱枚举攻击
    res.json({ 
      message: '如果该邮箱已注册，您将收到密码重置邮件' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 重置密码
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '输入验证失败',
        errors: errors.array() 
      });
    }

    // 简化实现，实际应该验证重置token
    res.json({ message: '密码重置成功' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 验证邮箱
router.post('/verify-email', [
  body('token').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '验证token不能为空',
        errors: errors.array() 
      });
    }

    // 简化实现
    res.json({ message: '邮箱验证成功' });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 导出用户数据供其他路由使用
router.getUserById = (id) => {
  return users.find(u => u._id === id);
};

router.getAllUsers = () => {
  return users.map(user => ({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt
  }));
};

module.exports = router;