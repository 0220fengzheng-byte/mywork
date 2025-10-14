const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Project = require('../models/Project');
const User = require('../models/User');
const UserNotificationSettings = require('../models/UserNotificationSettings');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initTransporter();
    this.loadTemplates();
  }

  initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    
    // 确保模板目录存在
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    this.templates = {
      welcome: this.getWelcomeTemplate(),
      verification: this.getVerificationTemplate(),
      passwordReset: this.getPasswordResetTemplate(),
      projectAssignment: this.getProjectAssignmentTemplate(),
      statusChange: this.getStatusChangeTemplate(),
      deadlineReminder: this.getDeadlineReminderTemplate()
    };
  }

  getWelcomeTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>欢迎加入项目管理系统</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>欢迎加入项目管理系统</h1>
        </div>
        <div class="content">
            <p>亲爱的 {{name}}，</p>
            <p>欢迎您加入我们的项目管理系统！您的账户已成功创建。</p>
            <p>您可以使用以下信息登录系统：</p>
            <ul>
                <li>邮箱：{{email}}</li>
                <li>登录地址：{{loginUrl}}</li>
            </ul>
            <p>如果您有任何问题，请随时联系我们。</p>
            <p>祝您使用愉快！</p>
        </div>
    </div>
</body>
</html>`;
  }

  getVerificationTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>邮箱验证</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>邮箱验证</h1>
        </div>
        <div class="content">
            <p>您好，</p>
            <p>请点击下面的链接验证您的邮箱地址：</p>
            <p><a href="{{verificationUrl}}" class="button">验证邮箱</a></p>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p>{{verificationUrl}}</p>
            <p>此链接将在24小时后失效。</p>
        </div>
    </div>
</body>
</html>`;
  }

  getPasswordResetTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>密码重置</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>密码重置</h1>
        </div>
        <div class="content">
            <p>您好，</p>
            <p>您请求重置密码。请点击下面的链接重置您的密码：</p>
            <p><a href="{{resetUrl}}" class="button">重置密码</a></p>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p>{{resetUrl}}</p>
            <p>此链接将在1小时后失效。</p>
            <p>如果您没有请求重置密码，请忽略此邮件。</p>
        </div>
    </div>
</body>
</html>`;
  }

  getProjectAssignmentTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>项目分配通知</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .project-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #17a2b8; }
        .button { display: inline-block; padding: 10px 20px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>项目分配通知</h1>
        </div>
        <div class="content">
            <p>亲爱的 {{assigneeName}}，</p>
            <p>您被分配了一个新项目：</p>
            <div class="project-info">
                <h3>{{projectName}}</h3>
                <p><strong>描述：</strong>{{projectDescription}}</p>
                <p><strong>优先级：</strong>{{priority}}</p>
                <p><strong>截止日期：</strong>{{deadline}}</p>
                <p><strong>提需人：</strong>{{requesterName}}</p>
            </div>
            <p><a href="{{projectUrl}}" class="button">查看项目详情</a></p>
            <p>请及时查看项目详情并开始工作。</p>
        </div>
    </div>
</body>
</html>`;
  }

  getStatusChangeTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>项目状态变更通知</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #212529; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-change { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .button { display: inline-block; padding: 10px 20px; background: #ffc107; color: #212529; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>项目状态变更通知</h1>
        </div>
        <div class="content">
            <p>您好，</p>
            <p>项目状态已发生变更：</p>
            <div class="status-change">
                <h3>{{projectName}}</h3>
                <p><strong>原状态：</strong>{{oldStatus}}</p>
                <p><strong>新状态：</strong>{{newStatus}}</p>
                <p><strong>变更人：</strong>{{changedBy}}</p>
                <p><strong>变更时间：</strong>{{changeTime}}</p>
            </div>
            <p><a href="{{projectUrl}}" class="button">查看项目详情</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  getDeadlineReminderTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>项目截止日期提醒</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fd7e14; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .reminder { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #fd7e14; }
        .urgent { border-left-color: #dc3545; }
        .button { display: inline-block; padding: 10px 20px; background: #fd7e14; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>项目截止日期提醒</h1>
        </div>
        <div class="content">
            <p>亲爱的 {{userName}}，</p>
            <p>以下项目即将到达截止日期，请注意：</p>
            {{#projects}}
            <div class="reminder {{#isUrgent}}urgent{{/isUrgent}}">
                <h3>{{name}}</h3>
                <p><strong>截止日期：</strong>{{deadline}}</p>
                <p><strong>剩余时间：</strong>{{timeLeft}}</p>
                <p><strong>当前状态：</strong>{{status}}</p>
            </div>
            {{/projects}}
            <p><a href="{{dashboardUrl}}" class="button">查看所有项目</a></p>
            <p>请及时完成相关工作，避免延期。</p>
        </div>
    </div>
</body>
</html>`;
  }

  renderTemplate(templateName, data) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let html = template;
    
    // 简单的模板替换
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });

    return html;
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    const html = this.renderTemplate('welcome', {
      name,
      email,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    return this.sendEmail({
      to: email,
      subject: '欢迎加入项目管理系统',
      html
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = this.renderTemplate('verification', {
      verificationUrl
    });

    return this.sendEmail({
      to: email,
      subject: '邮箱验证',
      html
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = this.renderTemplate('passwordReset', {
      resetUrl
    });

    return this.sendEmail({
      to: email,
      subject: '密码重置',
      html
    });
  }

  async sendProjectAssignmentEmail(project, assignee, requester) {
    const settings = await UserNotificationSettings.findOne({ userId: assignee._id });
    if (!settings || !settings.emailAssignment) {
      return;
    }

    const html = this.renderTemplate('projectAssignment', {
      assigneeName: assignee.name,
      projectName: project.name,
      projectDescription: project.description,
      priority: project.priority,
      deadline: project.deadline ? moment(project.deadline).format('YYYY-MM-DD HH:mm') : '未设置',
      requesterName: requester.name,
      projectUrl: `${process.env.FRONTEND_URL}/projects/${project._id}`
    });

    return this.sendEmail({
      to: assignee.email,
      subject: `项目分配通知：${project.name}`,
      html
    });
  }

  async sendStatusChangeEmail(project, user, oldStatus, changedBy) {
    const settings = await UserNotificationSettings.findOne({ userId: user._id });
    if (!settings || !settings.emailStatusChange) {
      return;
    }

    const html = this.renderTemplate('statusChange', {
      projectName: project.name,
      oldStatus,
      newStatus: project.status,
      changedBy: changedBy.name,
      changeTime: moment().format('YYYY-MM-DD HH:mm'),
      projectUrl: `${process.env.FRONTEND_URL}/projects/${project._id}`
    });

    return this.sendEmail({
      to: user.email,
      subject: `项目状态变更：${project.name}`,
      html
    });
  }

  async sendDeadlineReminders() {
    try {
      const users = await User.find({ isActive: true });
      let sentCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          const settings = await UserNotificationSettings.findOne({ userId: user._id });
          if (!settings || !settings.emailDeadlineReminder) {
            continue;
          }

          const reminderDate = moment().add(settings.reminderDaysBefore, 'days').toDate();
          
          const projects = await Project.find({
            $or: [
              { assigneeId: user._id },
              { requesterId: user._id }
            ],
            deadline: {
              $gte: new Date(),
              $lte: reminderDate
            },
            status: { $nin: ['已完成', '取消'] },
            isArchived: false
          });

          if (projects.length === 0) {
            continue;
          }

          const projectsData = projects.map(project => ({
            name: project.name,
            deadline: moment(project.deadline).format('YYYY-MM-DD HH:mm'),
            timeLeft: moment(project.deadline).fromNow(),
            status: project.status,
            isUrgent: moment(project.deadline).diff(moment(), 'days') <= 1
          }));

          const html = this.renderTemplate('deadlineReminder', {
            userName: user.name,
            projects: projectsData,
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
          });

          await this.sendEmail({
            to: user.email,
            subject: '项目截止日期提醒',
            html
          });

          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
          failedCount++;
        }
      }

      return { sentCount, failedCount };
    } catch (error) {
      console.error('Send deadline reminders error:', error);
      throw error;
    }
  }

  getTemplates() {
    return Object.keys(this.templates);
  }
}

module.exports = new EmailService();