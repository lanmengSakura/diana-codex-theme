# Diana Codex Theme

一套面向 Windows Codex 桌面端的嘉然（Diana）非商业同人主题，包含独立设计的日间版与暗夜版。

它不会把工作区变成一张海报：Codex 的原生导航、输入、滚动和正文层级保持不变，嘉然立绘、叙事小人和手绘装饰只停留在边角空白区。

> 非官方项目，与 OpenAI、Codex 及 A-SOUL 官方无隶属或背书关系。

## 主题预览

| Diana Night | Diana Day |
|---|---|
| ![Diana Night 模拟界面](preview/qa/readme-dark-1600x900.png) | ![Diana Day 模拟界面](preview/qa/readme-light-1600x900.png) |

预览图由仓库内的 [`preview/index.html`](preview/index.html) 生成。窗口标题栏、任务侧栏、线程栏、会话正文、文件变更卡、环境面板和输入区均按 Windows Codex 桌面端的实际比例重新搭建；界面中的任务和环境信息仍为虚构内容，不包含作者的真实 Codex 会话或项目截图。

## 设计特点

- 日间与暗夜分别调色，不使用简单反相。
- 主工作区文字颜色和信息层级保持 Codex 原生逻辑。
- 左上、右上和左下使用极细手绘线稿，正文区域保留大面积留白。
- 右下角使用独立的日间与暗夜立绘，并配有手绘星星、糖果和两只阿草。
- 消息位置导轨、按钮悬停、输入框焦点和侧栏强调色使用同一套莓粉视觉语言。
- 所有装饰层均为本地资源且 `pointer-events: none`，不会遮挡点击、输入或滚动。
- 主题可完整恢复，不修改 Codex 安装包、`app.asar`、MSIX 文件或数字签名。

## 环境要求

- Windows 11
- Microsoft Store 版 Codex 桌面端
- Node.js `22.4` 或更高版本
- Windows PowerShell 5.1 或 PowerShell 7

当前主题视觉已经定稿；运行时适配器仍标记为 beta，因为 Codex 桌面端更新可能改变内部页面结构。

## 快速开始

```powershell
git clone https://github.com/lanmengSakura/diana-codex-theme.git
cd diana-codex-theme
npm ci

# 启用暗夜版
npm run theme:dark

# 或启用日间版
npm run theme:light
```

第一次启用需要让 Codex 以本地调试端口重新启动，因此正在运行的 Codex 会被关闭并重新打开。主题启动器只绑定 `127.0.0.1:9336`，不会开放到局域网或公网。

### 日夜切换

主题助手已经运行时，可以直接热切换，不必再次重启 Codex：

```powershell
npm run theme:switch:dark
npm run theme:switch:light
```

如果 Codex 是从普通入口全新启动、尚未带上主题端口，请改用 `npm run theme:dark` 或 `npm run theme:light`。

### 登录后自动挂载

```powershell
# 安装当前用户级自动挂载任务，并立即启动暗夜版
npm run theme:autostart:dark

# 或安装日间版
npm run theme:autostart:light

# 只移除自动挂载任务
npm run theme:autostart:remove
```

自动挂载使用 Windows 任务计划程序的当前用户、受限权限和隐藏窗口模式。后台仅保留一个主题 watcher；重复启用会精确替换旧进程。

### 查看状态与恢复

```powershell
# 查看主题、端口、渲染器目标和 watcher 状态
npm run theme:status

# 恢复原生外观，保留自动挂载设置
npm run theme:restore

# 恢复原生外观并移除自动挂载
npm run theme:uninstall
```

## 模拟展示与宣传母版

```powershell
npm run preview:open
```

展示页是一个固定 `1920 × 1080` 舞台，会自动适配浏览器窗口。它同时承担 README 静帧和后续宣传视频母版：

- `D`：切换日间／暗夜主题
- `Space`：播放或暂停时间轴
- `←` / `→`：切换“提出任务、执行中、完成”场景
- 页面底部控制条：切换主题、场景并拖动时间轴
- 右上面板按钮：展开或收起模拟环境信息
- 左侧任务：切换模拟选中状态，验证主题控件语言

也可以使用查询参数生成稳定画面：

```text
preview/index.html?theme=dark&scene=complete&controls=none
preview/index.html?theme=light&scene=complete&controls=none
preview/index.html?theme=dark&scene=inspect&controls=none&play=1
```

## 工作原理

1. `@codedrobe/core` 负责打包主题并连接本机 Codex 渲染器。
2. 启动器让 Codex 使用仅本机可访问的 CDP 端口运行。
3. 主题运行时只注入作用域 CSS 与仓库内的本地图片。
4. watcher 在页面重载或新窗口出现后重新挂载主题。
5. 恢复命令停止 watcher，并撤销由主题管理的外观修改。

详细安全边界见 [`docs/architecture.md`](docs/architecture.md)，版本验证情况见 [`docs/compatibility.md`](docs/compatibility.md)。

## 仓库结构

```text
assets/        角色、线稿和装饰素材
docs/          架构、兼容性与发布说明
preview/       无依赖模拟界面与宣传时间轴
skills/        可复用的主题制作与验证 Skill
tests/         启动器静态测试
themes/        Diana Night / Diana Day 主题源码
tools/         启用、切换、自动挂载、状态和恢复工具
```

## 开发与验证

```powershell
# 测试、主题校验并生成两个发行包
npm run check

# 只生成 dist/*.codedrobe-theme
npm run theme:pack
```

贡献前请先阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)。主题 CSS 必须保持 Codex host scope，禁止远程图片、远程 CSS、脚本注入和全屏截图覆盖。

## 许可与素材边界

代码、脚本和主题配置使用 [MIT License](LICENSE)。

嘉然与阿草的名称、形象、原始美术及其派生图片不包含在 MIT 授权中，仅作为非商业同人创作使用。素材来源、处理方式和再使用边界见 [`ASSET_LICENSES.md`](ASSET_LICENSES.md)。重新分发或二次修改前，请自行确认并遵守适用的官方二创规则。
