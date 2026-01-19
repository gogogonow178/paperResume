# 极简简历 MiniCV

<p align="center">
  <a href="https://minicv.xyz">
    <img src="https://img.shields.io/badge/🚀_在线体验-minicv.xyz-0071E3?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-orange" alt="Zustand" />
  <img src="https://img.shields.io/github/license/gogogonow178/paperResume" alt="License" />
</p>

<p align="center">
  <strong>🔒 无后端 · 本地存储 · 隐私安全</strong>
</p>

---

## ✨ 特性

- 📝 **所见即所得** - 左侧编辑，右侧实时预览
- 🔒 **隐私安全** - 数据完全存储在浏览器本地，无服务器上传
- 🎨 **极简风格** - 极简设计语言，简洁专业
- 📱 **响应式布局** - 适配不同屏幕尺寸
- 🖱️ **拖拽排序** - 自由调整模块顺序
- 👁️ **模块控制** - 随时隐藏/显示任意模块
- 📄 **PDF 导出** - 一键生成高质量 PDF 简历
- 🖼️ **图片导出** - 支持导出为图片格式
- 💾 **自动保存** - 刷新页面不丢失数据

## 🖥️ 预览

<img width="1470" height="802" alt="image" src="https://github.com/user-attachments/assets/9c55adb6-9eb1-4cf5-9228-de7b6b5b4208" />


## 🚀 快速开始

### 在线使用

直接访问 👉 **[minicv.xyz](https://minicv.xyz)**

### 本地运行

```bash
# 克隆项目
git clone https://github.com/gogogonow178/paperResume.git

# 进入目录
cd paperResume

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [React 19](https://react.dev/) | UI 框架 |
| [Vite 6](https://vite.dev/) | 构建工具 |
| [Tailwind CSS 4](https://tailwindcss.com/) | 样式框架 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 状态管理 |
| [dnd-kit](https://dndkit.com/) | 拖拽排序 |
| [html2canvas](https://html2canvas.hertzen.com/) | 页面截图 |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF 生成 |

## 📁 项目结构

```
paperResume/
├── public/                 # 静态资源
├── src/
│   ├── components/
│   │   ├── Editor/        # 编辑器组件（各模块表单）
│   │   ├── Layout/        # 布局组件
│   │   ├── Preview/       # 预览组件
│   │   └── Toolbar/       # 工具栏组件
│   ├── store/             # Zustand 状态管理
│   ├── utils/             # 工具函数
│   ├── App.jsx            # 根组件
│   ├── main.jsx           # 入口文件
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
└── package.json
```

## 📋 简历模块

- ✅ 基本信息（姓名、照片、联系方式）
- ✅ 教育经历
- ✅ 工作经历
- ✅ 项目经历
- ✅ 专业技能
- ✅ 个人总结
- ✅ 自定义模块

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/gogogonow178">gogogonow178</a>
</p>

<p align="center">
  如果觉得有帮助，请给个 ⭐ Star 支持一下！
</p>
