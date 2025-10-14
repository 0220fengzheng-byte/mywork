const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// 创建Supabase客户端实例
const supabase = createClient(supabaseUrl, supabaseKey);

// 创建具有服务角色权限的客户端（用于管理操作）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 测试连接函数
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection
};