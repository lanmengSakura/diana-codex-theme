# Diana Terminal（暗夜版）

这是为 Windows Terminal 制作的暗夜主题，包含 `Diana PowerShell` 和 `Diana CMD` 两个可选配置。用户可以将它们独立保留，也可以主动把 Diana PowerShell 设为当前用户的默认配置。

`Diana CMD` 是 Windows Terminal 内启动 `cmd.exe` 的配置，不是传统 `conhost.exe` 窗口。完整背景需要从 Windows Terminal 下拉菜单或 Diana 开始菜单快捷方式进入。

![Diana PowerShell 高保真模拟截图](qa/terminal-readme-1600x900.png)

## 安装

要求 Windows Terminal `1.24` 或更高版本。

### 使用发行压缩包

从 [最新 Release](https://github.com/lanmengSakura/diana-codex-theme/releases/latest) 下载 `diana-terminal-0.2.4.zip`，解压后任选一种：

| 路线 | 双击文件 | 结果 |
|---|---|---|
| 独立保留 | `install-independent.cmd` | 新增两个 Diana 配置与开始菜单快捷方式，原默认项不变 |
| 设为默认 | `install-as-default.cmd` | 完成同样安装，并将 Diana PowerShell 设为当前用户默认配置 |

### 从完整仓库安装

独立保留：

```powershell
npm run terminal:install
```

安装后，从 Windows Terminal 的配置下拉菜单选择 `Diana PowerShell` 或 `Diana CMD`。也可以直接安装并打开：

```powershell
npm run terminal:open
```

安装器还会在当前用户的开始菜单中创建两个快捷方式。以后直接按 <kbd>Windows</kbd> 键，搜索 `Diana PowerShell` 或 `Diana CMD` 即可打开，使用方式与普通应用一致。

如果希望直接打开 Windows Terminal 时默认进入 `Diana PowerShell`：

```powershell
npm run terminal:default
```

此命令会先备份当前 `settings.json`，再只修改 `defaultProfile`。原默认配置记录在主题状态文件中；卸载主题时，如果默认项仍然是 Diana，安装器会将它恢复。它不会删除原生 PowerShell/CMD，不会修改系统终端代理注册表，也不会把设置应用到其他 Windows 用户。

## 为指定脚本创建 Diana 入口

Windows 把普通 CMD／PowerShell 交给默认终端时，不保证自动选中 Diana 配置。要让某个 `.cmd`、`.bat` 或 `.ps1` 稳定带上完整背景，请为它创建专用快捷方式：

```powershell
# 发行压缩包
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\new-diana-terminal-shortcut.ps1 `
  -CommandPath "D:\Tools\monitor.cmd"

# 完整仓库
npm run terminal:shortcut -- -CommandPath "D:\Tools\monitor.cmd"
```

默认会把快捷方式放进开始菜单的 `Diana Terminal` 文件夹。需要放在脚本旁边时，补充 `-ShortcutPath "D:\Tools\打开监测（Diana）.lnk"`。工具只创建 `.lnk`，不会改原脚本、注册表或系统终端代理；`.cmd`／`.bat` 使用 `Diana CMD`，`.ps1` 使用 `Diana PowerShell`。

## 移除

```powershell
npm run terminal:uninstall
```

发行压缩包用户也可以双击 `uninstall.cmd`。

## 安全边界与落盘位置

Terminal 主题和旧版 Codex 桌面 CDP 注入不是同一种实现。它只使用 Windows Terminal 原生 Fragment 和本地图片：

| 内容 | 路径 |
|---|---|
| Fragment 与背景图 | `%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\DianaCodexTheme` |
| 开始菜单快捷方式 | `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Diana Terminal` |
| 默认项恢复状态 | Fragment 目录中的 `diana-terminal.state`，仅“设为默认”路线生成 |
| Windows Terminal 设置备份 | `settings.json.diana-时间.bak`，仅“设为默认”路线生成 |

安装脚本不会启动 watcher、HTTP/TCP/WebSocket 监听器或计划任务，不访问网络，不替换任何终端可执行文件，也不会给 CMD/PowerShell 增加远程调试参数。`Diana PowerShell` 与 `Diana CMD` 共用同一张静态本地 PNG；区别仅是前者启动 `pwsh.exe -NoLogo`，后者启动 `cmd.exe`。

主题只向当前用户的 Windows Terminal Fragment 目录复制一个 JSON 和一张本地 PNG。终端专用背景让左侧信息密集区完全透明；右上复用桌面暗夜版的星星、弧线与草莓线稿，右下按同一比例缩入嘉然立绘、两颗手绘星、糖果、棒棒糖和两只阿草。没有 Acrylic、像素着色器、动画、远程资源或常驻进程。

需要重新生成终端专用背景时运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File terminal/build-terminal-background.ps1
```
