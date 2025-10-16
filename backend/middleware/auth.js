const jwt = require('jsonwebtoken');
const SupabaseUserService = require('../services/supabaseUserService');
const supabaseUserService = new SupabaseUserService();

const auth = async (req, res, next) => {
  try {
    // 在开发环境下跳过认证，使用默认用户
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        _id: '550e8400-e29b-41d4-a716-446655440000',
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '开发用户',
        email: 'dev@example.com',
        department: '开发部门',
        role: 'admin',
        is_active: true,
        avatar: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await supabaseUserService.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // 移除敏感信息并设置用户信息
    const { password_hash, ...userInfo } = user;
    req.user = { ...userInfo, _id: user.id }; // 保持兼容性，添加_id字段
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin authentication.' });
  }
};

module.exports = { auth, adminAuth };