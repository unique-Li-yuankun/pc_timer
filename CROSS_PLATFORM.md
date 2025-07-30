# PC Timer - 跨平台支持

PC Timer 现在支持 **Windows**、**macOS** 和 **Linux** 三大平台！

## 🖥️ 平台支持

### Windows ✅
- **检测方法**: PowerShell脚本 + Win32 API
- **功能**: 完整支持（进程名、窗口标题、进程路径）
- **要求**: Windows 10/11，PowerShell 5.0+

### macOS ✅  
- **检测方法**: AppleScript + lsappinfo
- **功能**: 完整支持（进程名、窗口标题）
- **要求**: macOS 10.14+，需要辅助功能权限

### Linux ✅
- **检测方法**: xdotool + wmctrl
- **功能**: 基础支持（进程名、窗口标题）
- **要求**: X11环境，需要安装 `xdotool` 或 `wmctrl`

## 🚀 快速开始

### 开发环境运行
```bash
# 所有平台通用
npm install
npm run start:dev
```

### 构建发布版本
```bash
# Windows平台
npm run build:win

# macOS平台 
npm run build:mac

# Linux平台
npm run build:linux

# 构建所有平台（需要在对应平台上运行）
npm run build:all
```

## ⚙️ 平台特定配置

### macOS权限设置
首次运行时需要授予以下权限：
1. **辅助功能权限**: 系统偏好设置 > 安全性与隐私 > 辅助功能
2. **屏幕录制权限**: 系统偏好设置 > 安全性与隐私 > 屏幕录制

### Linux依赖安装
```bash
# Ubuntu/Debian
sudo apt-get install xdotool wmctrl

# CentOS/RHEL
sudo yum install xdotool wmctrl

# Arch Linux
sudo pacman -S xdotool wmctrl
```

## 📦 发布文件

构建完成后会在 `release/` 目录生成：
- **Windows**: `PC Timer Setup.exe` (NSIS安装包)
- **macOS**: `PC Timer.dmg` (DMG镜像文件)
- **Linux**: `PC Timer.AppImage` (便携应用)

## 🔧 技术实现

### 前台应用检测技术
| 平台 | 主要方法 | 备用方法 |
|------|----------|----------|
| Windows | PowerShell + Win32 API | 进程CPU使用率排序 |
| macOS | AppleScript System Events | lsappinfo命令 |
| Linux | xdotool窗口查询 | wmctrl窗口列表 |

### 数据存储
- **跨平台**: SQLite数据库
- **位置**: 用户数据目录（自动检测）
- **兼容**: 所有平台数据格式统一

## 🐛 已知限制

### Windows
- 需要PowerShell执行策略允许
- 某些系统进程可能检测不到

### macOS  
- 需要用户手动授予权限
- Sandboxed应用可能显示为容器名

### Linux
- 仅支持X11环境（不支持Wayland）
- 需要手动安装依赖工具
- 某些桌面环境兼容性可能有限

## 📝 故障排除

### 检测不到应用？
1. 检查控制台日志中的平台检测信息
2. 确认已安装所需的系统工具
3. 验证应用权限设置

### 构建失败？
1. 确保使用对应平台进行构建
2. 检查是否安装了必要的构建工具
3. 查看错误日志获取详细信息

---

🎉 现在你可以在任何平台上享受PC Timer的完整功能了！