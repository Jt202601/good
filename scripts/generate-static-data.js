// scripts/generate-static-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 配置（与您的前端一致）
const SUPABASE_URL = 'https://rbuwdmkxqjadqxwzgqlx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJidXdkbWt4cWphZHF4d3pncWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzY0MzcsImV4cCI6MjA4NjE1MjQzN30.d_s44YrgWImufccCBTwl4tFSfsWXOZhfA-NkYRtSBUc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateStaticData() {
  console.log('开始从 Supabase 拉取数据...');

  // 1. 获取所有型号
  const { data: models, error: modelsError } = await supabase
    .from('models')
    .select('*');
  if (modelsError) throw modelsError;

  // 2. 构建数据结构：按型号存储故障及物料
  const staticData = {};

  for (const model of models) {
    const { data: faults, error: faultsError } = await supabase
      .from('faults')
      .select(`
        code,
        materials ( seq, name, code, location, usage_rate )
      `)
      .eq('model_id', model.id)
      .order('id', { ascending: true });

    if (faultsError) throw faultsError;

    // 格式化数据（与前端 fetchFaultsByModel 返回格式一致）
    staticData[model.code] = faults.map(fault => ({
      code: fault.code,
      materials: fault.materials.map(mat => ({
        seq: mat.seq,
        name: mat.usage_rate && mat.usage_rate !== '无数据'
          ? `${mat.name}-使用率:${mat.usage_rate}`
          : mat.name,
        code: mat.code,
        location: mat.location
      }))
    }));
  }

  // 3. 写入 public/data.js
  const outputPath = path.join(__dirname, '../public/data.js');
  const content = `// 静态数据文件，由构建脚本自动生成，请勿手动修改\nwindow.__STATIC_DATA = ${JSON.stringify(staticData, null, 2)};`;
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log(`静态数据已生成到 ${outputPath}`);
}

generateStaticData().catch(err => {
  console.error('生成静态数据失败:', err);
  process.exit(1);
});