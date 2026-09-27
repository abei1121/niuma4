---
name: video_b_roll_visualizer
description: 智能 B-Roll 视觉空镜与实体插屏匹配器。自动提取口播台词中的具象实体与核心视觉关键词，检索素材库或自动生成轻量级视觉插屏卡片，并在剪映草稿工程对应时间戳上注入画中画（PIP）与插屏轨道。
---

# video_b_roll_visualizer

## 核心职责
1. **视觉实体语义检测**：
   - 自动扫描字幕序列，定位“成本”、“房产”、“加盟”、“代码”、“八字排盘”等高视觉表现力的实体。
   - 过滤过密插屏，确保每段插屏间隔至少 6 秒，保持口播节奏平稳。
2. **多赛道实体高光卡片渲染**：
   - 支持房产（建面/总价/单价/地段）、金融、数码等多赛道暗黑磨砂玻璃质感（Glassmorphism）高质感 Keynote 实体卡片自动生成（STHeiti 字体、高对比度排版）。
   - 本地素材库视频切片与高质感实体卡片双模注入。
3. **屏幕空间三层安全区规范**：
   - B-Roll 画中画插屏强制放置在视觉黄金上层 (`y = 0.48`, `scale = 0.92`)，避开底栏字幕与居中出镜人脸，严禁使用默认 `y = 0.0` 遮挡人脸。
4. **APFS 零拷贝直连与沙盒隔离**：
   - 卡片与视频素材生成后，必须使用 `os.link` 镜像硬链接至剪映草稿工程 `draft_dir/Resources/`，消除 `##_draftpath_placeholder_...##`，严防 macOS 沙盒隔离权限报错（EPERM）。
5. **pyJianYingDraft 多轨命名规约**：
   - 添加至剪映工程必须显式指定 `track="画中画插屏轨"`，规避同类型多轨引发的 NameError。

## 脚本入口
- 脚本位置：`/Users/hi/niuma/video_workspace/scripts/b_roll_visualizer.py`
- 运行环境：`/Users/hi/niuma/video_workspace/venv/bin/python3`
