# Contributing

感谢你愿意帮助完善 Diana Codex Theme。本项目优先保护 Codex 的可用性、可恢复性和非商业同人边界。

## 开始之前

1. 使用 Node.js 22.4+；Windows Terminal 真机验证需使用 Windows 11。
2. 运行 `npm ci` 准备验证环境。
3. 不要提交真实 Codex 会话截图、个人目录、访问令牌或运行日志。
4. 新增或替换角色素材前，先在 `ASSET_LICENSES.md` 记录来源、处理方法和许可边界。

## 开发规则

- 日间与暗夜必须同时考虑，不能用简单反相生成另一套主题。
- 主工作区正文、代码、diff 和审批信息的可读性优先于装饰。
- 装饰元素必须使用 `pointer-events: none`。
- 视觉蓝图选择器必须位于 `html.diana-theme-host` 作用域下。
- 禁止 `@import`、远程 URL、脚本注入、遥测和全屏截图覆盖。
- 不修改 Codex 安装目录、MSIX、`app.asar` 或签名文件。
- 禁止为主题开启 CDP、调试端口、后台 watcher、计划任务或登录启动项。
- 涉及适配器的修改必须先证明使用的是当前版本正式支持、可恢复的用户空间入口。

## 提交前检查

```powershell
npm run check
```

如果修改了展示页面，还需要检查以下静帧：

- `preview/qa/readme-dark-1600x900.png`
- `preview/qa/readme-light-1600x900.png`
- `preview/qa/promo-dark-1920x1080.png`
- `preview/qa/promo-light-1920x1080.png`

展示页只能使用虚构内容或仓库自身的公开文件名，不得出现真实任务、聊天记录和本地用户信息。

## Pull Request 说明

请写明：

- 修改的是视觉、部署蓝图、兼容性还是文档。
- 已验证的 Codex 版本和页面状态。
- 日间与暗夜是否都检查过。
- 如何完整撤销本次修改。
- 新增素材的来源与授权边界。

仓库提供了 [`docs/github-actions-validate.yml`](docs/github-actions-validate.yml) 作为 Windows CI 模板。维护者账号具备 GitHub `workflow` 写入权限后，可将它复制到 `.github/workflows/validate.yml` 启用自动检查。
