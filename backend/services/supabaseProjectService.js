const { supabase, supabaseAdmin } = require('../config/supabase');

class SupabaseProjectService {
  // 创建项目
  async createProject(projectData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert([projectData])
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email),
          creator:created_by(id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }
  
  // 获取项目列表
  async getProjects(filters = {}) {
    try {
      let query = supabaseAdmin
        .from('projects')
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email),
          creator:created_by(id, name, email)
        `)
        .eq('is_archived', false);
      
      // 应用过滤器
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.requesterId) {
        query = query.eq('requester_id', filters.requesterId);
      }
      
      if (filters.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }
      
      // 排序
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }
  
  // 根据ID获取项目
  async getProjectById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email),
          creator:created_by(id, name, email),
          time_entries:project_time_entries(
            id,
            hours,
            description,
            date,
            user:user_id(id, name, email)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Get project by ID error:', error);
      throw error;
    }
  }
  
  // 更新项目
  async updateProject(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email),
          creator:created_by(id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }
  
  // 删除项目（软删除）
  async deleteProject(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .update({ is_archived: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }
  
  // 分配项目
  async assignProject(id, assigneeId, updatedBy) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .update({ 
          assignee_id: assigneeId,
          updated_by: updatedBy
        })
        .eq('id', id)
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email),
          creator:created_by(id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Assign project error:', error);
      throw error;
    }
  }
  
  // 添加工时记录
  async addTimeEntry(projectId, timeEntryData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_time_entries')
        .insert([{
          project_id: projectId,
          ...timeEntryData
        }])
        .select(`
          *,
          user:user_id(id, name, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add time entry error:', error);
      throw error;
    }
  }
  
  // 获取项目工时记录
  async getTimeEntries(projectId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_time_entries')
        .select(`
          *,
          user:user_id(id, name, email)
        `)
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get time entries error:', error);
      throw error;
    }
  }
  
  // 获取项目统计信息
  async getProjectStats() {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_stats')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get project stats error:', error);
      throw error;
    }
  }
  
  // 获取即将到期的项目
  async getUpcomingDeadlines(days = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email)
        `)
        .lte('deadline', futureDate.toISOString())
        .gte('deadline', new Date().toISOString())
        .neq('status', '已完成')
        .eq('is_archived', false)
        .order('deadline');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get upcoming deadlines error:', error);
      throw error;
    }
  }
  
  // 获取逾期项目
  async getOverdueProjects() {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          requester:requester_id(id, name, email),
          assignee:assignee_id(id, name, email)
        `)
        .lt('deadline', new Date().toISOString())
        .neq('status', '已完成')
        .eq('is_archived', false)
        .order('deadline');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get overdue projects error:', error);
      throw error;
    }
  }
}

module.exports = SupabaseProjectService;