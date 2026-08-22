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
> 完整角落立绘目前没有经过验证的官方桌面注入入口。仓库保留全部定稿美术、日夜 CSS 蓝图与部署 Skill；普通安装默认以完整视觉为目标，由用户自己的 Codex先检查正式入口。若只能使用本机 CDP，Codex 会在执行期间说明风险并等待确认，再针对当前机器生成本地实验适配器；仓库仍不分发预制监听器。

> [!NOTE]
> 这是非官方、非商业的粉丝项目，与 OpenAI、Codex 及 A-SOUL 官方没有隶属或背书关系。代码采用 MIT License；嘉然、阿草及相关美术素材不包含在 MIT 授权中。本项目中的相关视觉内容均为 A-SOUL 二创内容，请勿用于任何商业化用途。

## 安装

推荐安装方式：从仓库下载最新版主题包，直接拖进 Codex，然后说一句：

> 帮我安装并挂载这套 Diana Codex 主题。

桌面主题包为最新版 Release 中的 `diana-codex-theme-skill-0.2.3.zip`。安装位置、日夜配色和当前版本可用的美术入口均由 Codex 根据实际环境处理，不需要手动复制 Skill 或填写配置。

主题包内含全部定稿素材、日夜 CSS 蓝图与部署规则。这句普通安装指令默认要求完整挂载，包括角落立绘、阿草、星星、糖果和叙事线稿。Codex 会优先使用正式主题、插件、Pet 或用户样式入口；若当前版本只能通过实验性 CDP 完成，它必须先通知用户同机访问风险以及准备创建的端口、进程、文件、日志和恢复方法，等待确认后再继续。

公开包不会下载或恢复旧 watcher，也不会把适配器写进 Codex 安装包。实验适配器由用户自己的 Codex根据当前系统和 Codex 版本生成在用户可写目录中。用户不接受 CDP 风险时，才降级为原生配色并保留完整美术素材。

### 启动后自动挂载

Codex 自身保存的配色与字体会在下次启动时继续生效，不需要额外程序。完整角落立绘目前没有官方自动加载接口；首次完整挂载应先以手动、临时方式完成启用、停用、完全退出、正常重开和恢复验证。验证通过后，如果更看重启动后的完整视觉效果，可以再让自己的 Codex制作本地自动挂载方案：

> 帮我把这套 Diana Codex 主题设置为启动后自动挂载。如果需要本地监听，请先说明实现方式、访问范围、安全风险和卸载方法，等我确认后再执行。

这类方案通常需要开启本机 CDP 调试端口，并运行后台 watcher 或登录启动项，在 Codex 创建新页面后重新注入立绘与线稿。它确实更方便，但会带来这些隐患：

- CDP 即使只监听 `127.0.0.1`，同一台电脑上的其他程序仍可能连接它，读取页面文字、执行脚本或截图。
- watcher 需要持续接触 Codex 页面结构，会增加常驻资源占用，也可能在 Codex 更新后失效或误操作新界面。
- 计划任务或登录启动项会形成持久化残留；卸载不完整时，监听器可能继续运行。
- 自动挂载器如果通过强制结束 Codex 来恢复主题，可能中断正在执行的任务并造成界面状态不同步。

选择便利方案前，应让 Codex 列出将创建的进程、端口、启动项、日志和删除方法。至少应限制为本机回环地址，不记录消息正文、任务标题或截图，不连接外部服务器，不强制关闭正在工作的 Codex，并提供一次操作即可移除的恢复方式。这些措施只能降低风险，不能让 CDP 注入获得与原生外观相同的安全边界。

> [!CAUTION]
> 公开发行包不包含监听器和自动注入脚本。普通安装默认追求完整视觉，但并不静默授权 CDP 或自动启动；两者都必须在执行期间告知风险并分别获得确认。不接受上述风险时，保留 Codex 原生配色即可。

## v0.2.2 → v0.2.3 安全与完整挂载说明

### 旧版问题是什么

`v0.2.1` 及更早的完整桌面皮肤为了把立绘和角落线稿放进 Codex 工作区，会用 `--remote-debugging-port=9336` 启动 Codex，再由常驻 watcher 通过 Chrome DevTools Protocol（CDP）修改渲染页面。端口虽然只绑定到本机回环地址，不会直接暴露给局域网或互联网，但它没有独立认证：同一台电脑上的其他程序可能连接这个高权限调试接口，读取页面内容或操作渲染器。

这不是素材本身的问题，也不是普通 CSS 配色的问题；风险来自“为了注入 CSS 而持续开放桌面应用调试接口”这一运行方式。问题不在于完整皮肤不能做，而在于公开发行包不应替所有用户默认安装一个长期存在、没有独立认证的高权限入口。

### v0.2.2 移除了什么

- 删除桌面 CDP 运行器、watcher、自动挂载脚本与开机计划任务安装脚本。
- 删除 `@codedrobe/core` 运行依赖和 `.codedrobe-theme` 可执行主题包。
- 发布流程会拒绝重新打包上述文件，并自动清理旧的 `.codedrobe-theme` 产物。
- GitHub 历史 Release 中的旧桌面注入附件已经撤回；历史源码标签仅用于审计，不建议安装。
- 保留 `security:audit` 和 `security:remove-legacy`，只用于检查、清理旧版残留，不会连接 CDP，也不会读取 Codex 会话。

### v0.2.3 恢复了什么

`v0.2.3` 没有把旧运行器重新放回发行包，而是把完整视觉部署交给用户自己的 Codex：

- 普通指令“帮我安装并挂载这套 Diana Codex 主题”默认以完整效果为目标，不再默认停在配色层。
- Codex 会先检查当前版本是否提供正式主题、插件、Pet、扩展或用户样式入口；存在正式入口时优先使用。
- 只能使用 CDP 时，Codex 会在执行期间说明同机访问风险，并列出端口、进程、文件、日志、资源占用、停止和卸载方法。
- 用户确认后，Codex 才针对当前系统与 Codex 版本在用户可写目录生成本机实验适配器，不下载或复用旧 watcher。
- 首次完整挂载保持手动、临时运行；自动挂载需要在完整恢复验证后再次单独确认。

这样保留了完整立绘与装饰的实际入口，也避免把一套固定端口、固定 watcher 和计划任务无差别地装到所有用户电脑上。

### 公开包仍然保留什么

- Diana Night / Diana Day 的原生配色数值。
- 嘉然立绘、阿草、星星、糖果、草莓和简笔线稿等全部定稿美术资源。
- 日夜 CSS 视觉蓝图，供正式接口或用户确认后的本机实验适配器复用。
- 静态在线演示与高保真模拟截图。
- 经过验证的 Windows Terminal 主题；它与旧桌面注入运行器没有依赖关系。

### 当前能力边界

| 功能 | v0.2.3 公开版状态 | 是否需要后台进程或监听端口 |
|---|---|---|
| Codex 日夜原生配色 | 可直接使用 | 否 |
| Codex UI／代码字体 | 可直接使用 | 否 |
| Codex 角落立绘和线稿 | 默认完整挂载；正式入口优先，否则由用户 Codex 提出本机实验方案 | 正式入口不需要；CDP 方案需告知风险并确认 |
| 在线演示页面 | 可直接打开 | 否，页面为静态文件 |
| Diana PowerShell / CMD | Windows Terminal 1.24+ 已验证 | 否 |

[OpenAI 当前公开的原生外观范围](https://learn.chatgpt.com/docs/reference/settings#appearance)是基础主题、强调色、背景色、前景色、对比度以及 UI／代码字体，并支持主题导入和复制；没有角落贴图字段。因此仓库不再分发未认证调试端口运行器，但 Diana Skill 会把完整美术与部署决策交给用户自己的 Codex：先寻找正式入口，没有正式入口时再通知风险并询问是否继续本机实验挂载。

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

如果清理前仍能看到角落立绘，说明旧运行器可能仍在当前 Codex 进程中生效。清理和完全退出 Codex 后，立绘消失属于预期结果；它没有被删除，仍保存在 Skill 和 `assets/` 中。

## Diana Terminal（Windows 已验证）

Windows Terminal 版本使用本地静态 PNG 和原生 Fragment，不运行 watcher、动画、着色器或后台进程，因此可以继续作为正式发行功能。

这里的 `Diana CMD` 指 **Windows Terminal 中以 `cmd.exe` 为命令行的 Diana 配置**，不是传统 `conhost.exe` 黑框窗口。传统 CMD 本身没有这套背景图能力；请从 Windows Terminal 的下拉菜单或开始菜单中的 `Diana CMD` 快捷方式打开。

<img src="terminal/qa/terminal-readme-1600x900.png" alt="Diana PowerShell 高保真模拟截图" width="100%">

<p align="center"><sub>Diana Terminal · 模拟命令与公开路径，不包含作者的真实终端内容</sub></p>

从最新版 Release 下载 `diana-terminal-0.2.3.zip`，解压后任选一种方式：

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

### Terminal 会写入哪些位置

| 内容 | 当前用户路径 | 用途 |
|---|---|---|
| 配置 Fragment | `%LOCALAPPDATA%\Microsoft\Windows Terminal\Fragments\DianaCodexTheme\diana-terminal.json` | 注册 Diana PowerShell / CMD 和配色 |
| 本地背景图 | 同目录下的 `diana-terminal-bg-v2.png` | 由 Windows Terminal 直接读取 |
| 开始菜单快捷方式 | `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Diana Terminal` | 独立打开两个 Diana 配置 |
| 默认项恢复状态 | Fragment 目录下的 `diana-terminal.state` | 仅在选择“设为默认”时记录原默认配置 |
| 设置备份 | Windows Terminal `settings.json.diana-时间.bak` | 仅在选择“设为默认”时生成 |

安装器不写系统服务、不注册计划任务、不访问网络、不开放端口，也不替换 `cmd.exe`、`powershell.exe`、`pwsh.exe` 或 Windows Terminal 可执行文件。卸载时只移除上述主题文件与快捷方式；如果默认项仍是 Diana，才恢复此前记录的默认配置。

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
