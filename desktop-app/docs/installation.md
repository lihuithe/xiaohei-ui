# 安装指南 / Installation Guide

## 系统要求 / System Requirements

### 必需软件 / Required Software

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x (推荐使用，项目使用 pnpm)
- **Git**: 最新版本
- **操作系统 / OS**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)

## 安装步骤 / Installation Steps

### 1. 克隆仓库 / Clone the Repository

```bash
git clone https://github.com/your-username/desktop-app.git
cd desktop-app
```

### 2. 安装依赖 / Install Dependencies

```bash
pnpm install
```

### 3. 配置环境变量 / Configure Environment Variables

项目使用 Vite 提供的环境变量。可以在项目根目录创建 `.env` 文件：

```env
# 开发服务器端口 (可选)
VITE_DEV_SERVER_PORT=5173
```

### 4. 启动开发服务器 / Start Development Server

```bash
pnpm dev
```

开发服务器将在 `http://localhost:5173` 启动，Electron 窗口会自动打开。

### 5. 构建生产版本 / Build for Production

```bash
pnpm build
```

### 6. 打包应用 / Package Application

使用 electron-builder 打包应用：

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 常见问题 / Troubleshooting

### 依赖安装失败 / Dependency Installation Failed

尝试清除缓存并重新安装：

```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Electron 下载缓慢 / Slow Electron Download

配置 Electron 镜像源：

```bash
# 设置国内镜像
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
pnpm install
```

---

# Installation Guide

## System Requirements

### Required Software

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x (recommended, project uses pnpm)
- **Git**: Latest version
- **OS**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/desktop-app.git
cd desktop-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Project uses Vite environment variables. You can create a `.env` file in project root:

```env
# Dev server port (optional)
VITE_DEV_SERVER_PORT=5173
```

### 4. Start Development Server

```bash
pnpm dev
```

The dev server will start at `http://localhost:5173`, and the Electron window will open automatically.

### 5. Build for Production

```bash
pnpm build
```

### 6. Package Application

Package using electron-builder:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Troubleshooting

### Dependency Installation Failed

Try cleaning cache and reinstall:

```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Slow Electron Download

Configure Electron mirror:

```bash
# Set Chinese mirror
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
pnpm install
```
