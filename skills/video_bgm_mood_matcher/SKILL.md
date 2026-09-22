---
name: video_bgm_mood_matcher
description: 情绪音效与 BGM 智能卡点匹配器。根据赛道分类与内容情绪自动匹配推荐 BGM 风格，支持纯本地自合成轻量氛围音轨（无外网依赖、免版权争议），并自动计算黄金前 3 秒钩子与落槌点的音效触发时间戳。
---

# video_bgm_mood_matcher

## 核心职责
1. **赛道与题材情绪映射**：
   - `xuanxue`: 禅意冥想与 432Hz 能量打底
   - `canyin` / `business`: 轻快搞钱节奏与干脆律动
   - `fapai` / `reveal`: 低频悬疑张力与揭秘起伏
   - `ai_tech`: 现代极简电子律动
2. **免版权零依赖自合成**：
   - 当本地缺省音频时，调用原生 FFmpeg 声学滤镜，实时生成柔和环境打底垫音，绝不喧宾夺主。
3. **音效落槌点（SFX Markers）**：
   - 自动在前 3 秒收口点打上轻转场 Whoosh 标记。
   - 自动在各重要切片落槌点打上低频顿挫 Impact 标记。

## 脚本入口
- 脚本位置：`/Users/hi/niuma/video_workspace/scripts/bgm_mood_matcher.py`
- 运行环境：`/Users/hi/niuma/video_workspace/venv/bin/python3`
