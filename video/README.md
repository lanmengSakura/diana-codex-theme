# 宣传视频素材

这里保存宣传片的可编辑文本与生成脚本，不提交最终 MP4、WAV 或临时渲染帧。

- `narration-zh-CN.txt`：中文旁白母稿。
- `subtitles-zh-CN.srt`：按照成片时间轴整理的中文字幕。
- `generate-bgm.mjs`：生成不引用现有歌曲旋律的原创主题感背景音乐。
- `hopeful-dreamer-source.md`：非商业二创成片可选配乐的来源、署名和不再分发边界。

默认导出继续使用仓库内的原创配乐生成器。维护者也可以通过
`tools/render-narrated-video.ps1 -BgmPath <本地音频>` 使用自己有权使用的本地音轨；
此类录音不会作为仓库素材提交或随主题包再分发。
