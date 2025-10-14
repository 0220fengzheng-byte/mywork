const { supabase, supabaseAdmin } = require('../config/supabase');

class SupabaseNotificationService {
  // 创建通知
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert([notificationData])
        .select(`
          *,
          user:user_id(id, name, email),
          sender:sender_id(id, name, email),
          project:related_project_id(id, name)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
  
  // 获取用户通知列表
  async getUserNotifications(userId, options = {}) {
    try {
      let query = supabaseAdmin
        .from('notifications')
        .select(`
          *,
          sender:sender_id(id, name, email),
          project:related_project_id(id, name)
        `)
        .eq('user_id', userId);
      
      // 过滤条件
      if (options.isRead !== undefined) {
        query = query.eq('is_read', options.isRead);
      }
      
      if (options.type) {
        query = query.eq('type', options.type);
      }
      
      // 分页
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // 排序
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }
  
  // 标记通知为已读
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
  
  // 标记所有通知为已读
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }
  
  // 删除通知
  async deleteNotification(notificationId, userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }
  
  // 获取未读通知数量
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      return count;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }
  
  // 发送项目分配通知
  async sendProjectAssignmentNotification(projectId, assigneeId, senderId) {
    try {
      // 获取项目信息
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('name, priority')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      const notificationData = {
        user_id: assigneeId,
        sender_id: senderId,
        type: 'assignment',
        title: '新项目分配',
        content: `您被分配了新项目：${project.name}`,
        related_project_id: projectId,
        metadata: {
          project_name: project.name,
          priority: project.priority
        }
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Send project assignment notification error:', error);
      throw error;
    }
  }
  
  // 发送状态变更通知
  async sendStatusChangeNotification(projectId, newStatus, senderId) {
    try {
      // 获取项目信息和相关人员
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('name, requester_id, assignee_id')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // 通知相关人员（排除发送者）
      const recipients = [project.requester_id, project.assignee_id]
        .filter(id => id && id !== senderId);
      
      const notifications = recipients.map(userId => ({
        user_id: userId,
        sender_id: senderId,
        type: 'status_change',
        title: '项目状态变更',
        content: `项目"${project.name}"的状态已更新为：${newStatus}`,
        related_project_id: projectId,
        metadata: {
          project_name: project.name,
          new_status: newStatus
        }
      }));
      
      if (notifications.length > 0) {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Send status change notification error:', error);
      throw error;
    }
  }
  
  // 发送截止日期提醒
  async sendDeadlineReminder(projectId, userId) {
    try {
      // 获取项目信息
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('name, deadline')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      const deadlineDate = new Date(project.deadline);
      const formattedDate = deadlineDate.toLocaleDateString('zh-CN');
      
      const notificationData = {
        user_id: userId,
        type: 'deadline_reminder',
        title: '截止日期提醒',
        content: `项目"${project.name}"即将到期，截止日期：${formattedDate}`,
        related_project_id: projectId,
        metadata: {
          project_name: project.name,
          deadline: project.deadline
        }
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Send deadline reminder error:', error);
      throw error;
    }
  }
  
  // 批量发送截止日期提醒
  async sendBatchDeadlineReminders() {
    try {
      // 获取即将到期的项目
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select(`
          id,
          name,
          deadline,
          assignee_id,
          requester_id
        `)
        .lte('deadline', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // 24小时内
        .gte('deadline', new Date().toISOString())
        .neq('status', '已完成')
        .eq('is_archived', false);
      
      if (projectsError) throw projectsError;
      
      const notifications = [];
      
      for (const project of projects) {
        // 检查用户的通知设置
        const recipients = [project.assignee_id, project.requester_id].filter(Boolean);
        
        for (const userId of recipients) {
          const { data: settings } = await supabaseAdmin
            .from('user_notification_settings')
            .select('email_deadline_reminder, site_notifications')
            .eq('user_id', userId)
            .single();
          
          if (settings && settings.site_notifications) {
            notifications.push({
              user_id: userId,
              type: 'deadline_reminder',
              title: '截止日期提醒',
              content: `项目"${project.name}"即将到期，截止日期：${new Date(project.deadline).toLocaleDateString('zh-CN')}`,
              related_project_id: project.id,
              metadata: {
                project_name: project.name,
                deadline: project.deadline
              }
            });
          }
        }
      }
      
      if (notifications.length > 0) {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    } catch (error) {
      console.error('Send batch deadline reminders error:', error);
      throw error;
    }
  }
}

module.exports = SupabaseNotificationService;