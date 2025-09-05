# 🍌 Peel a Banana - 剥个香蕉

> 剥开图像编辑创意的新维度

## 项目简介

Peel a Banana 是一款基于 Gemini 2.0 Flash AI 的智能图像比例变换工具。通过创新的空白参考图片技术，实现精准的图像比例控制，让您的创意不受画布限制。

## ✨ 核心功能

- **🎨 智能比例变换** - 支持多种预设比例（1:1, 3:4, 4:3, 9:16, 16:9）
- **🖌️ 画布绘制** - 内置画笔、橡皮擦等绘图工具
- **🖼️ 多图合成** - 支持多张图片智能组合
- **🤖 AI 增强** - 使用 Gemini 2.0 Flash 模型进行智能图像生成
- **📐 精准控制** - 基于 Google 官方文档的比例控制技术
- **💾 自动保存** - 所有生成的图片自动保存到本地浏览器

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 本地开发

```bash
# 克隆项目
git clone https://github.com/CY-CHENYUE/peel-a-banana.git
cd peel-a-banana

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入你的 API 密钥

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 开始使用

## 🔑 API 配置

### 获取 API 密钥

1. **Gemini API**
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 创建一个新的 API 密钥
   - 将密钥复制到 `.env.local` 的 `GEMINI_API_KEY`

2. **OpenRouter API**
   - 访问 [OpenRouter](https://openrouter.ai/keys)
   - 注册并创建一个新的 API 密钥
   - 将密钥复制到 `.env.local` 的 `OPENROUTER_API_KEY`

## 📖 使用指南

1. **上传图片** - 拖拽或点击上传您的原始图片
2. **选择比例** - 从预设比例中选择目标尺寸
3. **添加提示词** - 描述您想要的效果
4. **生成图片** - AI 将智能调整图片以适配新比例

## 📦 部署到 Vercel

### 方法一：通过 Vercel 网站部署（推荐新手）

1. **Fork 项目到你的 GitHub**
   - 访问 [项目仓库](https://github.com/CY-CHENYUE/peel-a-banana)
   - 点击右上角的 Fork 按钮

2. **注册 Vercel 账号**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账号登录

3. **导入项目**
   - 在 Vercel 控制台点击 "New Project"
   - 选择 "Import Git Repository"
   - 选择你 Fork 的 peel-a-banana 仓库

4. **配置环境变量**
   在 "Environment Variables" 部分添加以下变量：
   - `GEMINI_API_KEY` - 你的 Gemini API 密钥
   - `GEMINI_BASE_URL` - https://generativelanguage.googleapis.com/v1beta
   - `OPENROUTER_API_KEY` - 你的 OpenRouter API 密钥
   - `OPENROUTER_API_URL` - https://openrouter.ai/api/v1/chat/completions
   - `OPENROUTER_ANALYZE_MODEL` - google/gemini-2.0-flash-exp
   - `OPENROUTER_ANALYZE_TEMPERATURE` - 0.8
   - `OPENROUTER_ANALYZE_MAX_TOKENS` - 8000
   - `OPENROUTER_GENERATE_MODEL` - google/gemini-2.0-flash-exp
   - `OPENROUTER_GENERATE_TEMPERATURE` - 0.9
   - `OPENROUTER_GENERATE_MAX_TOKENS` - 8192

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约 2-3 分钟）
   - 部署成功后会得到一个 URL，如：`https://peel-a-banana.vercel.app`

### 方法二：使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 按照提示操作，设置环境变量
```

### 自定义域名

1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 🔒 安全提示

- **永远不要** 将 `.env.local` 文件提交到 Git 仓库
- **永远不要** 在前端代码中暴露 API 密钥
- 定期更换 API 密钥以确保安全
- 如果密钥泄露，立即在相应平台重新生成新密钥

## 🛠️ 技术栈

- **前端框架**: Next.js 15.5
- **UI 组件**: React 19.1
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **AI 模型**: Gemini 2.0 Flash (via OpenRouter)
- **图像处理**: Konva.js
- **存储**: IndexedDB

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