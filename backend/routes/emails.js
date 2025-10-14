const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// 发送测试邮件（管理员功能）
router.post('/test', adminAuth, [
  body('to').isEmail(),
  body('subject').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, subject, content } = req.body;

    await emailService.sendEmail({
      to,
      subject,
      html: content
    });

    res.json({ message: '测试邮件发送成功' });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ message: '邮件发送失败' });
  }
});

// 获取邮件模板列表（管理员功能）
router.get('/templates', adminAuth, async (req, res) => {
  try {
    const templates = emailService.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 预览邮件模板（管理员功能）
router.post('/templates/:templateName/preview', adminAuth, [
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const { templateName } = req.params;
    const { data = {} } = req.body;

    const html = emailService.renderTemplate(templateName, data);
    
    res.json({ html });
  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({ message: '模板预览失败' });
  }
});

// 手动发送项目提醒邮件（管理员功能）
router.post('/send-reminders', adminAuth, async (req, res) => {
  try {
    const result = await emailService.sendDeadlineReminders();
    
    res.json({
      message: '提醒邮件发送完成',
      sentCount: result.sentCount,
      failedCount: result.failedCount
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    res.status(500).json({ message: '发送提醒邮件失败' });
  }
});

module.exports = router;