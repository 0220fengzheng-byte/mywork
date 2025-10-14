const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取通知列表
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('isRead').optional().isBoolean(),
  query('type').optional().isIn(['deadline_reminder', 'status_change', 'assignment', 'project_created', 'project_updated'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      isRead,
      type
    } = req.query;

    const query = { userId: req.user._id };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name avatar')
      .populate('relatedProjectId', 'name status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 标记通知为已读
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({
      message: '通知已标记为已读',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量标记通知为已读
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: '所有通知已标记为已读' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除通知
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({ message: '通知删除成功' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量删除已读通知
router.delete('/read/batch', auth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user._id,
      isRead: true
    });

    res.json({
      message: `已删除 ${result.deletedCount} 条已读通知`
    });
  } catch (error) {
    console.error('Batch delete notifications error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取未读通知数量
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;