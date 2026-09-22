---
name: video_caption_styler
description: 爆款短视频动态花字与核心词强调器。智能扫描转写字幕，提取关键数值、警告词与爆款高频情绪词，生成具备醒目对比样式的 ASS 竖屏花字字幕，并适配剪映专业草稿。
---

# video_caption_styler

## 核心职责
1. **关键词情感与数值挖掘**：
   - 自动提取数值、百分比（如 `90%`, `3万`）
   - 自动识别警告/避坑词（如 `千万别`, `致命`, `陷阱`, `底层逻辑`）
   - 自动标注搞钱/干货高光词（如 `暴利`, `翻倍`, `顶级`, `逆袭`）
2. **多层级视觉样式生成**：
   - `Default` 基础样式：纯白文字 + 粗黑描边
   - `Highlight` 高光样式：高饱和柠檬黄 + 阴影浮雕，吸引视觉焦点
   - `Alert` 警示样式：警示绯红 + 粗描边，强化风险与痛点
3. **剪映草稿深度对齐**：
   - 输出适合 `pyJianYingDraft` 的样式字典，直接注入剪映工程文本轨。

## 脚本入口
- 脚本位置：`/Users/hi/niuma/video_workspace/scripts/caption_styler.py`
- 运行环境：`/Users/hi/niuma/video_workspace/venv/bin/python3`
