---
name: video_b_roll_visualizer
description: 智能 B-Roll 视觉空镜与实体插屏匹配器。自动提取口播台词中的具象实体与核心视觉关键词，检索素材库或自动生成轻量级视觉插屏卡片，并在剪映草稿工程对应时间戳上注入画中画（PIP）与插屏轨道。
---

# video_b_roll_visualizer

## 核心职责
1. **视觉实体语义检测**：
   - 自动扫描字幕序列，定位“成本”、“房产”、“加盟”、“代码”、“八字排盘”等高视觉表现力的实体。
   - 过滤过密插屏，确保每段插屏间隔至少 6 秒，保持口播节奏平稳。
2. **轻量化视觉卡片与 B-Roll 映射**：
   - 自动在剪映画中画（PIP）轨道对应起止秒数上创建覆盖图层。
   - 支持本地素材库视频切片与高质感科技实体卡片双模注入。

## 脚本入口
- 脚本位置：`/Users/hi/niuma/video_workspace/scripts/b_roll_visualizer.py`
- 运行环境：`/Users/hi/niuma/video_workspace/venv/bin/python3`
