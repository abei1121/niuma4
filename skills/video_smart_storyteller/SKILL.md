---
name: video_smart_storyteller
description: AI 智能叙事剪辑师与爆款故事线编排器。基于 Whisper 词级转写结果，执行语义级口水词与逻辑重言过滤，自动提炼识别最震撼的前 3 秒黄金吸睛钩子，并按 30~60 秒完播率最优原则重组故事线。
---

# video_smart_storyteller

## 核心职责
1. **语义去噪与口水词过滤**：
   - 剔除“然后”、“就是说”、“那个”等高频迟疑与无意义语气助词。
   - 保证语境连贯，大幅提升短视频信息密度与叙事节奏。
2. **黄金前 3 秒钩子自动挖掘**：
   - 基于反问句式、高反差数值（`90%`, `3倍`）与高频爆款触发词，自动挖掘全片最具悬念感的一句话。
3. **最优完播率时长重构**：
   - 自动在 30~60 秒区间内组装高能观点段落，输出精准的重组区间序列（`recommended_intervals`）。

## 脚本入口
- 脚本位置：`/Users/hi/niuma/video_workspace/scripts/smart_storyteller.py`
- 运行环境：`/Users/hi/niuma/video_workspace/venv/bin/python3`
