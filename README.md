# 🍌 Peel a Banana - 剥个香蕉

> 剥开图像编辑创意的新维度

## 项目简介

Peel a Banana 是一款基于 Gemini 2.5 Flash AI 的智能图像比例变换工具。通过创新的空白参考图片技术，实现精准的图像比例控制，让您的创意不受画布限制。

## ✨ 核心功能

- **🎨 智能比例变换** - 支持多种预设比例（1:1, 3:4, 4:3, 9:16, 16:9）
- **🖌️ 画布绘制** - 内置画笔、橡皮擦等绘图工具
- **🖼️ 多图合成** - 支持多张图片智能组合
- **🤖 AI 增强** - 使用 Gemini 2.5 Flash 模型进行智能图像生成
- **📐 精准控制** - 基于 Google 官方文档的比例控制技术

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 克隆项目
git clone [repository-url]
cd peel-a-banana

# 安装依赖
npm install

# 配置环境变量
# 在 .env.local 中设置：
# OPENROUTER_API_KEY=your-api-key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 开始使用

## 📖 使用指南

1. **上传图片** - 拖拽或点击上传您的原始图片
2. **选择比例** - 从预设比例中选择目标尺寸
3. **添加提示词** - 描述您想要的效果
4. **生成图片** - AI 将智能调整图片以适配新比例

## 🛠️ 技术栈

- **前端框架**: Next.js 15.5
- **UI 组件**: React 19.1
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **AI 模型**: Gemini 2.5 Flash (via OpenRouter)
- **图像处理**: Canvas API

## 📝 开发计划

- [ ] 支持更多自定义比例
- [ ] 批量处理功能
- [ ] 历史记录管理
- [ ] 导出多种格式
- [ ] 实时预览优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

Made with 🍌 by Peel a Banana Team