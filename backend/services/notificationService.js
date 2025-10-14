const Notification = require('../models/Notification');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const emailService = require('./emailService');

class NotificationService {
  async createNotification({
    userId,
    senderId,
    type,
    title,
    content,
    relatedProjectId,
    metadata = {}
  }) {
    try {
      const notification = new Notification({
        userId,
        senderId,
        type,
        title,
        content,
        relatedProjectId,
        metadata
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  async sendProjectAssignmentNotification(project, assignee, requester) {
    try {
      // 创建站内通知
      await this.createNotification({
        userId: assignee._id,
        senderId: requester._id,
        type: 'project_assignment',
        title: '新项目分配',
        content: `您被分配了新项目：${project.name}`,
        relatedProjectId: project._id,
        metadata: {
          projectName: project.name,
          priority: project.priority,
          deadline: project.deadline
        }
      });

      // 发送邮件通知
      try {
        await emailService.sendProjectAssignmentEmail(project, assignee, requester);
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }
    } catch (error) {
      console.error('Send project assignment notification error:', error);
      throw error;
    }
  }

  async sendStatusChangeNotification(project, user, oldStatus, changedBy) {
    try {
      // 创建站内通知
      await this.createNotification({
        userId: user._id,
        senderId: changedBy._id,
        type: 'status_change',
        title: '项目状态变更',
        content: `项目"${project.name}"状态从"${oldStatus}"变更为"${project.status}"`,
        relatedProjectId: project._id,
        metadata: {
          projectName: project.name,
          oldStatus,
          newStatus: project.status
        }
      });

      // 发送邮件通知
      try {
        await emailService.sendStatusChangeEmail(project, user, oldStatus, changedBy);
      } catch (emailError) {
        console.error('Failed to send status change email:', emailError);
      }
    } catch (error) {
      console.error('Send status change notification error:', error);
      throw error;
    }
  }

  async sendDeadlineReminderNotification(project, user) {
    try {
      const settings = await UserNotificationSettings.findOne({ userId: user._id });
      if (!settings || !settings.siteDeadlineReminder) {
        return;
      }

      await this.createNotification({
        userId: user._id,
        type: 'deadline_reminder',
        title: '项目截止日期提醒',
        content: `项目"${project.name}"即将到达截止日期`,
        relatedProjectId: project._id,
        metadata: {
          projectName: project.name,
          deadline: project.deadline
        }
      });
    } catch (error) {
      console.error('Send deadline reminder notification error:', error);
      throw error;
    }
  }

  async sendCommentNotification(project, comment, commenter, targetUser) {
    try {
      await this.createNotification({
        userId: targetUser._id,
        senderId: commenter._id,
        type: 'comment',
        title: '新评论',
        content: `${commenter.name}在项目"${project.name}"中添加了评论`,
        relatedProjectId: project._id,
        metadata: {
          projectName: project.name,
          commenterName: commenter.name,
          comment: comment.substring(0, 100) // 截取前100个字符
        }
      });
    } catch (error) {
      console.error('Send comment notification error:', error);
      throw error;
    }
  }

  async sendSystemNotification(userId, title, content, metadata = {}) {
    try {
      await this.createNotification({
        userId,
        type: 'system',
        title,
        content,
        metadata
      });
    } catch (error) {
      console.error('Send system notification error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return result;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });

      return notification;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  async deleteReadNotifications(userId) {
    try {
      const result = await Notification.deleteMany({
        userId,
        isRead: true
      });

      return result;
    } catch (error) {
      console.error('Delete read notifications error:', error);
      throw error;
    }
  }

  async getNotifications(userId, { page = 1, limit = 20, type, isRead } = {}) {
    try {
      const query = { userId };
      
      if (type) {
        query.type = type;
      }
      
      if (typeof isRead === 'boolean') {
        query.isRead = isRead;
      }

      const notifications = await Notification.find(query)
        .populate('senderId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false
      });

      return count;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  async getUserNotificationSettings(userId) {
    try {
      let settings = await UserNotificationSettings.findOne({ userId });
      
      if (!settings) {
        // 创建默认设置
        settings = new UserNotificationSettings({
          userId,
          emailDeadlineReminder: true,
          emailStatusChange: true,
          emailAssignment: true,
          emailWeeklyReport: true,
          siteDeadlineReminder: true,
          siteStatusChange: true,
          siteAssignment: true,
          reminderDaysBefore: 3
        });
        await settings.save();
      }

      return settings;
    } catch (error) {
      console.error('Get user notification settings error:', error);
      throw error;
    }
  }

  async updateUserNotificationSettings(userId, updates) {
    try {
      const settings = await UserNotificationSettings.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Update user notification settings error:', error);
      throw error;
    }
  }

  // 批量发送截止日期提醒
  async sendBatchDeadlineReminders() {
    try {
      const Project = require('../models/Project');
      const User = require('../models/User');
      const moment = require('moment');

      const users = await User.find({ isActive: true });
      let notificationCount = 0;

      for (const user of users) {
        const settings = await this.getUserNotificationSettings(user._id);
        
        if (!settings.siteDeadlineReminder) {
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

        for (const project of projects) {
          await this.sendDeadlineReminderNotification(project, user);
          notificationCount++;
        }
      }

      return { notificationCount };
    } catch (error) {
      console.error('Send batch deadline reminders error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();