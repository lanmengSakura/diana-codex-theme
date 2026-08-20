# Contributing

感谢你愿意帮助完善 Diana Codex Theme。本项目优先保护 Codex 的可用性、可恢复性和非商业同人边界。

## 开始之前

1. 使用 Windows 11、Microsoft Store 版 Codex 和 Node.js 22.4+。
2. 运行 `npm ci` 安装锁定依赖。
3. 不要提交真实 Codex 会话截图、个人目录、访问令牌、运行日志或 `.runtime` 状态。
4. 新增或替换角色素材前，先在 `ASSET_LICENSES.md` 记录来源、处理方法和许可边界。

## 开发规则

- 日间与暗夜必须同时考虑，不能用简单反相生成另一套主题。
- 主工作区正文、代码、diff 和审批信息的可读性优先于装饰。
- 装饰元素必须使用 `pointer-events: none`。
- 主题选择器必须位于 `html.codedrobe-host-codex` 作用域下。
- 禁止 `@import`、远程 URL、脚本注入、遥测和全屏截图覆盖。
- 不修改 Codex 安装目录、MSIX、`app.asar` 或签名文件。
- 涉及 DOM 选择器的修改必须在真实 Codex 首页和普通对话页重新验证。

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

- 修改的是视觉、运行时、兼容性还是文档。
- 已验证的 Codex 版本和页面状态。
- 日间与暗夜是否都检查过。
- 如何完整撤销本次修改。
- 新增素材的来源与授权边界。

仓库提供了 [`docs/github-actions-validate.yml`](docs/github-actions-validate.yml) 作为 Windows CI 模板。维护者账号具备 GitHub `workflow` 写入权限后，可将它复制到 `.github/workflows/validate.yml` 启用自动检查。
