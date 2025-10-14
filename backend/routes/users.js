const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/avatars';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取个人信息
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新个人信息
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('department').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, phone } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.json({
      message: '个人信息更新成功',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 修改密码
router.put('/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // 获取完整用户信息（包含密码）
    const user = await User.findById(req.user._id);
    
    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    user.refreshTokens = []; // 清除所有刷新令牌，强制重新登录
    await user.save();

    res.json({ message: '密码修改成功，请重新登录' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 删除旧头像文件
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新用户头像
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: '头像上传成功',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取团队成员列表
router.get('/team', auth, async (req, res) => {
  try {
    // 临时使用模拟数据，避免MongoDB连接问题
    const { mockUsers } = require('../utils/mockData');
    
    // 过滤活跃用户并选择需要的字段
    const users = mockUsers
      .filter(user => user.isActive)
      .map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        avatar: user.avatar
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(users);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取通知设置
router.get('/notification-settings', auth, async (req, res) => {
  try {
    let settings = await UserNotificationSettings.findOne({ userId: req.user._id });
    
    if (!settings) {
      // 如果不存在，创建默认设置
      settings = new UserNotificationSettings({ userId: req.user._id });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新通知设置
router.put('/notification-settings', auth, [
  body('emailDeadlineReminder').optional().isBoolean(),
  body('emailStatusChange').optional().isBoolean(),
  body('emailAssignment').optional().isBoolean(),
  body('emailWeeklyReport').optional().isBoolean(),
  body('siteNotifications').optional().isBoolean(),
  body('reminderDaysBefore').optional().isInt({ min: 0, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;

    const settings = await UserNotificationSettings.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: '通知设置更新成功',
      settings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员：获取所有用户
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员：更新用户状态
router.put('/:id/status', adminAuth, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: `用户已${isActive ? '激活' : '禁用'}`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;