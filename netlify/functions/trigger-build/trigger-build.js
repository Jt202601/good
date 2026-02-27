// netlify/functions/trigger-build/trigger-build.js
exports.handler = async (event) => {
  try {
    const expectedPassword = process.env.ADMIN_PASSWORD || '123456';
    const adminPassword = event.headers['x-admin-password'];

    if (adminPassword !== expectedPassword) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, error: 'Unauthorized' })
      };
    }

    const BUILD_HOOK_URL = 'https://api.netlify.com/build_hooks/69a1ac5abe82e780917b7a9a';

    const response = await fetch(BUILD_HOOK_URL, { method: 'POST' });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Build hook failed: ${response.status} - ${errorText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('trigger-build error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      })
    };
  }
};