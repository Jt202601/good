// netlify/functions/trigger-build.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 从环境变量读取管理员密码，若未设置则使用默认值（生产环境务必设置）
  const expectedPassword = process.env.ADMIN_PASSWORD || '123456';
  const adminPassword = event.headers['x-admin-password'];

  if (adminPassword !== expectedPassword) {
    return {
      statusCode: 403,
      body: JSON.stringify({ success: false, error: 'Unauthorized' })
    };
  }

  // 替换为您的实际 Build Hook URL（下一步获取）
  const BUILD_HOOK_URL = 'https://api.netlify.com/build_hooks/你的构建钩子ID';

  try {
    const response = await fetch(BUILD_HOOK_URL, { method: 'POST' });
    if (!response.ok) throw new Error(`Build hook failed: ${response.status}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};