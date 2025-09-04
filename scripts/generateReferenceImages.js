const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 定义所有比例和对应的尺寸
const dimensions = {
  '1-1': { width: 1024, height: 1024, label: '1:1' },
  '3-4': { width: 864, height: 1184, label: '3:4' },
  '4-3': { width: 1184, height: 864, label: '4:3' },
  '9-16': { width: 768, height: 1344, label: '9:16' },
  '16-9': { width: 1344, height: 768, label: '16:9' }
};

// 创建输出目录
const outputDir = path.join(__dirname, '..', 'public', 'reference-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成每个比例的白底参考图
Object.entries(dimensions).forEach(([key, { width, height, label }]) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // 填充纯白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // 保存为PNG文件
  const buffer = canvas.toBuffer('image/png');
  const fileName = `reference-${key}.png`;
  const filePath = path.join(outputDir, fileName);
  
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Generated ${fileName} (${label}: ${width}x${height})`);
});

console.log(`\n🎉 All reference images have been generated in ${outputDir}`);