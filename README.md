# Canvas Blitz Lab - AI图像生成工具

一个基于 Google Nano-Banana 模型的智能图像生成应用，支持文本提示生图、参考图片生图、Portrait肖像生成和画板绘制功能。

## 项目进度

### ✅ 已完成功能
- **基础图像生成**：支持文本提示词生成图像
- **参考图片功能**：上传参考图片进行图像生成
- **画板功能**：内置绘图工具，支持导出为参考图
- **Portrait肖像生成**：专业的AI肖像生成功能
  - 支持8种精美风格（Mono、Studio、Faceless、Urban、Vintage、Indoor、Film、Business）
  - 玻璃拟态风格卡片，背景图片清晰透亮
  - 支持参考图片上传，生成个性化肖像
  - 点击图片可全屏预览放大
  - 一键直接下载，无需跳转页面
  - 独立的Portrait页面，与General功能完全分离
  - 优化的GENERATE按钮，更大更醒目
  - 兜底渐变背景，避免图片加载失败时显示纯黑
- **对话界面**：类似聊天的交互体验
- **响应式设计**：适配不同屏幕尺寸
- **图片下载**：支持生成图片的下载功能

### 🔧 最近修复
- **参考图功能完善**：✅ 完全修复了参考图片上传和处理功能
  - 解决了 MulterError: Field value too long 错误
  - 优化了 base64 图片数据处理
  - 确保与 Replicate nano-banana 模型的完美兼容
  - 功能已经非常完善，无需再次修改
- **错误处理优化**：改进了 Replicate API 调用的错误处理
- **调试信息增强**：添加了详细的日志记录和格式验证

### 🚀 技术特性
- 集成 Google Nano-Banana (Gemini 2.5 Flash Image) 模型
- 支持多种图片格式和 Base64 编码
- 实时预览和即时反馈
- 现代化 UI/UX 设计
- **Portrait功能技术亮点**：
  - 玻璃拟态（Glassmorphism）设计风格
  - 轻模糊效果（backdrop-blur-[1.5px]）
  - 低透明度遮罩（bg-black/20）
  - 兜底渐变背景机制
  - 响应式风格卡片网格布局
  - 静态资源优化（Vite public目录）
  - 完整的移动端适配和响应式设计

## Git 版本查看

### 查看提交历史
```bash
# 查看最近的提交记录
git log --oneline -10

# 查看详细的提交信息
git log --graph --pretty=format:'%h -%d %s (%cr) <%an>' --abbrev-commit

# 查看特定文件的修改历史
git log --follow -- <文件路径>
```

### 查看当前版本信息
```bash
# 查看当前分支和最新提交
git status
git show --stat

# 查看所有分支
git branch -a

# 查看远程仓库信息
git remote -v
```

### 查看文件变更
```bash
# 查看工作区变更
git diff

# 查看暂存区变更
git diff --cached

# 查看两个提交之间的差异
git diff <commit1> <commit2>
```

## Project info

**URL**: https://lovable.dev/projects/9f19ca15-b100-4825-bd92-e8df663b1cde

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9f19ca15-b100-4825-bd92-e8df663b1cde) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 如何使用这个应用？

### 如何使用这个应用？

### 基础图像生成
1. 在底部输入框中输入描述性的提示词
2. 点击 "生成" 按钮
3. 等待 AI 生成图像
4. 生成的图像会显示在对话界面中

### Portrait肖像生成
1. 点击顶部导航栏的 "Portrait" 进入肖像生成页面
2. 上传参考图片（可选）：点击上传区域选择或拖拽图片
3. 选择喜欢的肖像风格：
   - **Mono**：黑白单色风格
   - **Studio**：专业摄影棚风格
   - **Faceless**：无脸艺术风格
   - **Urban**：都市街头风格
   - **Vintage**：复古怀旧风格
   - **Indoor**：室内环境风格
   - **Film**：电影胶片风格
   - **Business**：商务正装风格
4. 点击大号的 "GENERATE" 按钮等待AI生成
5. 点击生成的肖像图片可全屏预览
6. 点击下载按钮直接保存肖像到本地

### 参考图片生成
1. 点击输入框旁的图片图标上传参考图片
2. 输入描述性的提示词
3. 点击 "生成" 按钮
4. AI 会基于参考图片和提示词生成新图像

### 画板功能
1. 点击画板图标打开绘图工具
2. 使用各种绘图工具创作
3. 点击 "导出为参考图" 将画作用作参考
4. 输入提示词并生成基于画作的图像

### 图片下载
- 点击生成图像右下角的下载按钮即可保存图片

## What technologies are used for this project?

This project is built with:

### 前端技术栈
- **Vite** - 快速构建工具
- **TypeScript** - 类型安全的 JavaScript
- **React** - 用户界面库
- **shadcn-ui** - 现代化 UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Tldraw** - 画板绘图功能
- **Lucide React** - 图标库

### 后端技术栈
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **Multer** - 文件上传中间件
- **Replicate API** - AI 模型调用服务
- **Google Nano-Banana** - 图像生成模型

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 处理工具
- **Concurrently** - 并行运行多个命令

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9f19ca15-b100-4825-bd92-e8df663b1cde) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
