# v0.2.2 安全迁移

## 为什么移除旧桌面运行时

`v0.1.0` 至 `v0.2.1` 为了把角落立绘和 CSS 挂载到 Codex，使用了 Chrome DevTools Protocol。端口只绑定在本机回环地址，不会直接暴露到局域网或互联网，但 CDP 本身没有为同机进程提供认证：另一个本地程序可以发现目标、检查页面并执行调试命令。

这不是已经发生数据外传的证据。审计没有发现主题 watcher 连接外部地址，也没有发现遥测代码；问题在于公开版主动扩大了已登录 Codex 界面的本机攻击面。

## v0.2.2 做了什么

- 删除桌面 CDP 启动器与运行时。
- 删除 watcher、自启动计划任务安装器与自动恢复逻辑。
- 删除 CodeDrobe 运行时依赖与 `.codedrobe-theme` 打包流程。
- 发布包只保留 Windows Terminal 静态主题和视觉 Skill。
- 完整嘉然、阿草、糖果、星星和线稿素材继续保留。
- 增加不连接 CDP 的旧版检测与清理工具。

## 清理步骤

在最新版仓库目录运行：

```powershell
npm run security:remove-legacy
```

该命令会停止旧 Diana watcher、移除 `Diana Codex Theme` 计划任务，并清除两份 Diana 运行状态记录。它不会主动关闭正在使用的 Codex，因此还需要：

1. 完全退出所有 Codex 窗口和进程。
2. 从正常的开始菜单入口重新打开 Codex。
3. 运行 `npm run security:audit`。

预期输出：

```text
Diana security audit: SAFE
```

如果仍显示 `codexDebugPortCount` 或 `legacyPortListening`，说明旧 Codex 进程尚未完全退出。不要只关闭窗口，需确认任务管理器中相关旧进程已经结束。

## 之后如何使用桌面视觉

优先在 Codex **设置 → 外观** 中应用仓库提供的日夜颜色。完整角落美术交给 Diana Skill 按当前版本现场检查；只有出现正式支持、可恢复且不依赖调试端口的入口时才部署，没有安全入口就保留美术蓝图。

