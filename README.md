<div align="center">

# Diana Codex Theme

一套为 Codex 制作的嘉然（Diana）非商业同人视觉方案。

日间与暗夜分别设计，保留 Codex 原本的阅读层级，让嘉然、阿草与手绘线稿安静地停留在工作区边角。

[在线演示](https://lanmengsakura.github.io/diana-codex-theme/) · [CodexThemes 视觉参考](https://codexthemes.ai/skins/diana-codex-theme) · [下载发行包](https://github.com/lanmengSakura/diana-codex-theme/releases/latest) · [兼容性记录](docs/compatibility.md) · [安全说明](SECURITY.md)

![Release](https://img.shields.io/github/v/release/lanmengSakura/diana-codex-theme?display_name=tag&color=b84970&label=release)
![Platform](https://img.shields.io/badge/verified-Windows%20Terminal-b85f7c)
![Desktop](https://img.shields.io/badge/Codex-visual%20blueprint-d86e91)
![License](https://img.shields.io/github/license/lanmengSakura/diana-codex-theme?color=7e7178)

</div>

> [!IMPORTANT]
> 从 `v0.2.2` 起，公开版不再提供 CDP 调试端口、后台 watcher、自动挂载任务或 `.codedrobe-theme` 安装包。旧方案虽然只监听本机回环地址，但同机程序可以在没有认证的情况下使用高权限调试接口，因此不符合公开发行的安全边界。
>
> 完整角落立绘目前没有经过验证的官方桌面注入入口。仓库保留全部定稿美术、日夜 CSS 蓝图与安全部署 Skill；用户可以让自己的 Codex 检查当时版本是否出现受支持的主题、插件、Pet 或用户样式入口。没有安全入口时，只应用原生配色，不强行安装立绘。

> [!NOTE]
> 这是非官方、非商业的粉丝项目，与 OpenAI、Codex 及 A-SOUL 官方没有隶属或背书关系。代码采用 MIT License；嘉然、阿草及相关美术素材不包含在 MIT 授权中。本项目中的相关视觉内容均为 A-SOUL 二创内容，请勿用于任何商业化用途。

## 效果预览

<a href="https://lanmengsakura.github.io/diana-codex-theme/?theme=dark&scene=complete&controls=none">
  <img src="preview/qa/readme-dark-1600x900.png" alt="Diana Night 暗夜主题高保真模拟界面" width="100%">
</a>

<p align="center"><sub>Diana Night · 暖黑、莓粉与低亮度粉笔线稿</sub></p>

<a href="https://lanmengsakura.github.io/diana-codex-theme/?theme=light&scene=complete&controls=none">
  <img src="preview/qa/readme-light-1600x900.png" alt="Diana Day 日间主题高保真模拟界面" width="100%">
</a>

<p align="center"><sub>Diana Day · 暖白、浅莓色与彩色细线简笔画</sub></p>

截图由仓库内的 [高保真桌面模拟页](preview/index.html) 生成。任务、路径与环境信息均为虚构内容，不包含作者的真实会话或项目截图。

## 安全使用路线

### 路线一：Codex 原生配色

这是当前最稳妥的桌面路线，不启动后台进程，不修改 Codex 安装文件，也不打开调试端口。

在 Codex 的 **设置 → 外观** 中分别录入以下数值：

| 版本 | 强调色 | 背景色 | 前景色 | 对比度 | UI 字体 | 代码字体 |
|---|---|---|---|---:|---|---|
| Diana Night | `#D86E91` | `#0D0C0F` | `#F3EEF0` | `60` | Microsoft YaHei UI | Cascadia Code |
| Diana Day | `#B84970` | `#FBF8F6` | `#2C2529` | `45` | Microsoft YaHei UI | Cascadia Code |

原生外观可以保留日夜氛围和主要按钮色，但不会出现嘉然立绘、阿草、糖果、星星与角落线稿。OpenAI 官方列出的原生外观范围包括基础主题、强调色、背景色、前景色和 UI／代码字体。

### 路线二：让 Codex 使用视觉 Skill

发行包中的 `diana-codex-theme-skill-0.2.2.zip` 自包含全部定稿素材、日夜 CSS 蓝图与安全规则。解压到用户级 Skill 目录后，可以对 Codex 说：

> 使用 Diana Skill 检查当前版本能否安全部署暗夜主题；禁止开启 CDP、调试端口或后台监听。

Skill 会先查找当前版本正式支持的外观、主题、插件、Pet 或用户样式入口。只有找到不修改签名应用、不开调试端口、可恢复的用户空间入口时，才可以继续部署完整角落美术；否则应停在原生配色。

Windows 用户可将 Skill 放到 `%USERPROFILE%\.agents\skills\diana-codex-theme`；macOS 用户可放到 `$HOME/.agents/skills/diana-codex-theme`。macOS 尚未经过真机部署验证，仍属于实验性路线。

## 从 v0.2.1 或更早版本迁移

如果曾经运行过旧版 `theme:dark`、`theme:light` 或自动挂载命令，请在更新仓库后执行：

```powershell
npm run security:remove-legacy
```

随后完全退出所有 Codex 窗口和进程，再从开始菜单正常打开 Codex，最后检查：

```powershell
npm run security:audit
```

只有输出 `SAFE` 才说明旧 watcher、计划任务、调试端口启动参数和 `9336` 监听都已消失。清理工具不会连接旧调试端口，也不会读取任何会话内容。详细说明见 [v0.2.2 安全迁移](docs/security-migration-v0.2.2.md)。

## Diana Terminal（Windows 已验证）

Windows Terminal 版本使用本地静态 PNG 和原生 Fragment，不运行 watcher、动画、着色器或后台进程，因此可以继续作为正式发行功能。

<img src="terminal/qa/terminal-readme-1600x900.png" alt="Diana PowerShell 高保真模拟截图" width="100%">

<p align="center"><sub>Diana Terminal · 模拟命令与公开路径，不包含作者的真实终端内容</sub></p>

从最新版 Release 下载 `diana-terminal-0.2.2.zip`，解压后任选一种方式：

| 路线 | 双击文件 | 从源码安装 | 对现有终端的影响 |
|---|---|---|---|
| 独立保留 | `install-independent.cmd` | `npm run terminal:install` | 新增 Diana PowerShell / CMD，不修改默认项 |
| 设为默认 | `install-as-default.cmd` | `npm run terminal:default` | 备份设置后，将 Diana PowerShell 设为当前用户默认配置 |

```powershell
# 安装并立即打开独立 Diana PowerShell
npm run terminal:open

# 为指定脚本创建固定使用 Diana 配置的快捷方式
npm run terminal:shortcut -- -CommandPath "D:\Tools\monitor.cmd"

# 完整移除终端主题
npm run terminal:uninstall
```

两条安装路线都不会覆盖或删除原生 PowerShell、CMD 配置。终端主题要求 Windows Terminal `1.24` 或更高版本，详细说明见 [terminal/README.md](terminal/README.md)。

## 在线演示

```powershell
npm run preview:open
```

| 操作 | 功能 |
|---|---|
| <kbd>D</kbd> | 切换日间／暗夜主题 |
| <kbd>Space</kbd> | 播放或暂停时间轴 |
| <kbd>←</kbd> / <kbd>→</kbd> | 切换演示场景 |
| 右上面板按钮 | 展开或收起模拟环境信息 |

演示页是独立的静态模拟界面，不连接本机 Codex，也不会读取本地任务。

## 仓库结构

```text
assets/        嘉然、阿草、线稿和装饰素材
docs/          架构、安全迁移、兼容性与发布说明
preview/       高保真展示页面与日夜截图
skills/        自包含日夜素材、安全部署决策与验证流程
terminal/      Windows Terminal 暗夜主题、安装与移除脚本
tests/         安全边界、素材同步与展示页测试
themes/        Diana Night / Diana Day 配色与 CSS 蓝图
tools/         旧版风险检测、清理与发行打包工具
```

## 开发与验证

```powershell
npm ci
npm run check
npm run release:pack
```

`release:pack` 只生成 Windows Terminal 发行包和自包含视觉 Skill，不生成可执行的桌面注入包。贡献代码前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可与素材

- 代码、脚本与主题配置使用 [MIT License](LICENSE)。
- 嘉然、阿草的名称、形象、原始美术和派生图片不包含在 MIT 授权中，均为 A-SOUL 二创内容，请勿用于任何商业化用途。
- 素材来源、处理方式和再使用边界记录在 [ASSET_LICENSES.md](ASSET_LICENSES.md)。

<div align="center">

今天也要活力满满呀。

</div>
