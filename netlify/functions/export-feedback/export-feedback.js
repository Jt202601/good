// netlify/functions/export-feedback/export-feedback.js
const { createClient } = require('@supabase/supabase-js');

// Supabase 配置（与前端一致）
const SUPABASE_URL = 'https://rbuwdmkxqjadqxwzgqlx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJidXdkbWt4cWphZHF4d3pncWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzY0MzcsImV4cCI6MjA4NjE1MjQzN30.d_s44YrgWImufccCBTwl4tFSfsWXOZhfA-NkYRtSBUc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  try {
    // 验证管理员密码
    const expectedPassword = process.env.ADMIN_PASSWORD || '123456';
    const adminPassword = event.headers['x-admin-password'];

    if (adminPassword !== expectedPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, error: 'Unauthorized' })
      };
    }

    // 从 Supabase 获取所有反馈数据
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('export-feedback error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};