const jwt = require('jsonwebtoken');
const SupabaseUserService = require('../services/supabaseUserService');
const supabaseUserService = new SupabaseUserService();

const auth = async (req, res, next) => {
  try {
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