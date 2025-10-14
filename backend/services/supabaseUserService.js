const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class SupabaseUserService {
  // 创建用户
  async createUser(userData) {
    try {
      const { email, password, name, department, phone, role = 'member' } = userData;
      
      // 加密密码
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          password: hashedPassword,
          name,
          department,
          phone,
          role,
          is_active: true,
          is_email_verified: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // 创建默认通知设置
      await this.createDefaultNotificationSettings(data.id);
      
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }
  
  // 根据邮箱查找用户
  async findByEmail(email) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Find user by email error:', error);
      throw error;
    }
  }
  
  // 根据ID查找用户
  async findById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Find user by ID error:', error);
      throw error;
    }
  }
  
  // 更新用户信息
  async updateUser(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  
  // 验证密码
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // 更新最后登录时间
  async updateLastLogin(id) {
    try {
      await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }
  
  // 获取活跃用户列表
  async getActiveUsers() {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, department, role, avatar')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get active users error:', error);
      throw error;
    }
  }
  
  // 创建默认通知设置
  async createDefaultNotificationSettings(userId) {
    try {
      const { error } = await supabaseAdmin
        .from('user_notification_settings')
        .insert([{
          user_id: userId,
          email_deadline_reminder: true,
          email_status_change: true,
          email_assignment: true,
          email_weekly_report: false,
          site_notifications: true,
          reminder_days_before: 1
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Create default notification settings error:', error);
      throw error;
    }
  }
  
  // 获取用户通知设置
  async getNotificationSettings(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // 如果不存在设置，创建默认设置
      if (!data) {
        await this.createDefaultNotificationSettings(userId);
        return await this.getNotificationSettings(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  }
  
  // 更新用户通知设置
  async updateNotificationSettings(userId, settings) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_notification_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  }
  
  // 添加刷新令牌
  async addRefreshToken(userId, token) {
    try {
      const { error } = await supabaseAdmin
        .from('user_refresh_tokens')
        .insert([{
          user_id: userId,
          token
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Add refresh token error:', error);
      throw error;
    }
  }
  
  // 验证刷新令牌
  async validateRefreshToken(token) {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_refresh_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      // 检查是否过期
      if (new Date(data.expires_at) < new Date()) {
        await this.removeRefreshToken(token);
        return null;
      }
      
      return data.user_id;
    } catch (error) {
      console.error('Validate refresh token error:', error);
      throw error;
    }
  }
  
  // 移除刷新令牌
  async removeRefreshToken(token) {
    try {
      await supabaseAdmin
        .from('user_refresh_tokens')
        .delete()
        .eq('token', token);
    } catch (error) {
      console.error('Remove refresh token error:', error);
      throw error;
    }
  }

  // 清除用户的所有刷新令牌
  async clearAllRefreshTokens(userId) {
    try {
      const { error } = await supabaseAdmin
        .from('user_refresh_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing all refresh tokens:', error);
      throw error;
    }
  }
}

module.exports = SupabaseUserService;