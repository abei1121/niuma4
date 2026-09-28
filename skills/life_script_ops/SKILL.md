---
name: life_script_ops
description: 人生运势历 (obs.xiaojiucai.pro) 前端构建优化、Rust 鉴权微服务、站内造物主剧本流式推演引擎、动态流日运势真机、官方私有闭环防护与全生命周期运维技能。
triggers:
  - life_script_ops
  - obs_xiaojiucai
  - life_script
  - obs_membership
  - creator_script
  - obs_code_tool
---

# 人生运势历全栈守护与运维技能 (Life Script Ops)

## 概述
《人生运势历》(`obs.xiaojiucai.pro`) 是纯前端静态预压缩与纯 Rust 鉴权与流式推演微服务协同的高性能、低功耗全栈自治工程：
1. **前端工程 (`/home/a/obsxiaojiucai/`)**：React 19 + Vite 6 + TypeScript + TailwindCSS + PWA，集成正统紫微斗数排盘、钦天四化飞星与来因宫立极、真太阳时校准、动态流日四化与吉忌真机引擎、24h 海报分享裂变解锁门槛、造物主人生剧本闭环流式推演、东方宣纸重墨高对比度排版、长图装裱导出与小韭菜俱乐部会员卡 (Club Pass) 鉴权及 Web3 钱包直连。
2. **后端微服务 (`/home/a/obs_membership_rust/`)**：纯 Rust 构建（常驻内存仅 ~14MB），提供 ECDSA P-256 密码学签名防重放验签、三层梯队天命能量治理、`agy` 大模型流式推演管道与官方私有安全闭环守护。
3. **专属客服与运维工具链 (`/home/a/bin/obs_code_tool`)**：本地毫秒级激活码查询、5 秒一键解绑重置（客服专职）、新卡批量入库及全局统计。
4. **Nginx 零拷贝边缘**：Brotli / Gzip 静态双重预压缩直发，`/api/` 路由内聚反代至本地 Rust 服务（`127.0.0.1:8096`），配置专用非缓冲 SSE 直发管道。

---

## 命主核心哲学与法定视觉戒律 (Master's Core Philosophy & Visual Canon)

### 1. 人生剧本哲学 (The Life Script Philosophy)
- **立意灵魂**：人这一生就是一个全新的剧本。紫微斗数命理并非定死宿命，而只是让命主提前看清人生的**「目录大纲」**；剧本的走向、演法与关键抉择，始终牢牢掌握在命主自己手中。
- **法定入口命名**：顶栏核心主按钮**法定唯一定名「查看你的人生剧本」**，严禁擅自更名为其他生硬工具词汇，牢固守护这一立意。

### 2. 排盘严谨玄黑底色铁律 (Strict Obsidian Chart Standard)
- **视觉对比度红线**：首页虽为白玉生宣纸质感，但**十二宫排盘视界（Pro 模式）必须绝对坚守高对比度玄黑底色（`#060606`）**！
- **严谨命理场域**：白底在真机上根本看不清几十颗星曜与复杂飞星光辉。排盘是极端严谨严肃的数术场域，唯有玄黑高对比度才能让用户看清大局与细节，**严禁将排盘界面篡改为浅白底色**。

### 3. 星曜正统繁体铁律 (Orthodox Traditional Chinese Star Canon)
- **正统智慧承载**：星曜名与四化是中华正统命理智慧的最高结晶，盘面上所有星曜（紫微、天機、太陽、武曲、天同、廉貞、文昌、文曲等）及四化（祿、權、科、忌）必须**强制采用正统中文繁体显示**，绝不可篡改或降阶；
- **动态多语言边界**：国际化动态多语言仅作用于外围功能按钮、操作引导、解盘批语与使用说明，星曜本体神髓保持正统繁体不变。

### 4. 彻底禁绝红色与廉价感色系铁律 (Strict Anti-Red & Imperial Bronze Gold Canon)
- **全站严禁粗暴红底红字**：今日运势卡片、详情模态、海报、解锁弹窗等全站模块，**严禁使用任何刺眼/廉价红色（`#D63E34`, `#9E2A2B`, `#FF6B5E`, `#B91C1C`）**。
- **东方玄金与黑曜基调**：统一采用高雅的**黑曜石玄墨（`#141210`, `#1F1D1A`, `#26221E`）与古铜沉金、御用金（`#C5A059`, `#B38E46`, `#7A5B36`）**，配合白玉宣纸（`#FAF7F0`）底色。海报画板专属印鉴与宜忌徽章统一采用仿古铜金印（`#8C6239`），杜绝廉价地摊感。

### 5. 全站彻底拔除谷歌 AI 星星图案铁律 (Strict Anti-Google-AI Canon)
- **绝不给别人发现谷歌影子**：全站任何组件严禁出现 Google / Gemini 风格的四角星星或 `<Sparkles />`、`<Star />` 等默认 AI 视觉痕迹。
- **正统东方玄学图标**：全站统一采用正统玄学风向标图标：**`<Compass />`（罗盘司南）、`<ScrollText />`（天机天书卷轴）、`<Disc />`（浑天仪）**。

### 6. 紫微流日三层决策引擎铁律（纯代码确定性算力，零大模型，零废话）
- **100% 本地纯代码算法**：流日运势 100% 由本地确定性纯代码运行（70% 钦天门四化冲照 + 30% 中州派流曜星盘），毫秒级响应，离线 PWA 可用，**严禁调用任何大模型 API**，彻底杜绝大模型算错八字星曜的幻觉。
- **彻底封杀地摊星座废话**：绝不允许出现“平平淡淡，顺其自然”、“平稳安定，适合按部就班”等无营养模版词。
- **动态总标生成**：运势总标由【重叠宫位 × 当天四化 × 战术气象】动态合成（如：`官禄权动 · 聚焦攻坚日`、`财帛生禄 · 稳健蓄利日`）。
- **正统气象定性**：评分必须映射为八字紫微正统气象：
  - 5分：`气象：势如破竹 · 飞龙在天（宜果断突破）`
  - 4分：`气象：顺水推舟 · 渐入佳境（宜借势乘胜）`
  - 3分：`气象：藏器待时 · 潜龙在渊（宜固本整固）`
  - 2分：`气象：逆风行舟 · 步步为营（宜防守复盘）`
  - 1分：`气象：风急浪高 · 深壁固垒（宜避险蓄锐）`
- **人人都看得懂的「三层决策漏斗」闭环**：
  1. **核心气象定海神针**（知进退）；
  2. **军师破局决断**（直接给答案）：今日胜算主攻、一票否决红线、黄历通胜择吉；
  3. **钦天紫微科学推演链**（知其所以然）：天机立极、大白话现实局势拆解、流曜照临。

### 7. 宣纸手书卷 · 书法行楷海报与纯端侧计算铁律 (Calligraphy Ink Scroll & Client-Only Poster Canon)
- **品牌法定定位**：海报全域统一标注**「人生运势历 · 每日决策指引」**，画面绝不出现“小韭菜俱乐部”等局限圈层的自嘲式词汇，建立高阶私人定制命理顾问心智。
- **100% 满版纯净宣纸底色 (Full-Bleed Xuan Paper)**：
  - 彻底淘汰死板 Canvas fillRect 平涂色块与代码线框；
  - 强制采用重磅手工宣纸/棉麻全幅实物肌理（`poster_bg_linen.webp`，179KB WebP 静态资源），四周满版通幅（顶部绝不露背景白墙），自带微米纤维与晨曦漫射树影。
- **物理墨水渗透渲染 (Multiply Blend Mode)**：
  - 强制开启 `ctx.globalCompositeOperation = 'multiply'`，墨汁自然渗透进宣纸凹凸纹理中，光影树影自然穿透文字，彻底根除“数码图层浮在纸上”的突兀感。
- **行楷与手书小楷字体体系 (Orthodox Calligraphy & Handwriting Typography)**：
  - **核心断语主标题**：强制采用**行楷墨宝（`Xingkai SC` / 启功体风骨）**，笔锋苍劲有力，落笔提顿极具文人神韵；
  - **决策主攻与红线**：强制采用**文人手书楷体（`Kaiti SC`）**，宛如古代军师手持狼毫在宣纸手卷上亲笔批注的每日密折；
  - 严禁在海报正文中使用冷硬刻板的电脑宋体或数码黑体。
- **文人墨道色彩铁律（松烟浓墨 · 一朱定乾坤）**：
  - 全篇严禁花花绿绿与数码冷灰，仅保留两种传统色彩：
    - **主墨色（松烟浓墨 `#1A1614`）**：沉着厚重，深深入纸三分，覆盖全篇 90% 文字及二维码；
    - **点睛色（宫廷朱砂 `#8B1E17`）**：温润古雅，仅点睛用于主气候断语、红线标题与专属验印方印；
  - 辅助文字采用稀释润墨（`#4A423C`），与宣纸暖色天然共生。
- **自适应流式排版引擎（100% Anti-overflow Dynamic Layout）**：
  - 彻底废除固定 Y 轴坐标，采用 `cursorY` 动态推移算法；
  - 文字长度梯级缩放（长文自动缩至 `32px`，精炼文 `36px`，行高自然舒展），自适应计算折行与间距，**100% 绝不溢出、绝不与后方元素撞车**；
  - 彻底移除所有割裂版面的机械水平分割线，依靠文字行气自然呼吸分界，仅保留朱丝栏微框。
- **100% 语言纯净度铁律 (Strict Zero-English in Chinese Mode)**：
  - 用户选用中文时，全版面严禁参杂任何英文杂词（如 `DAILY DISPATCH`, `FORTUNE ALMANAC`, `DESTINY` 等），纯正中文呈现。
- **零域名与零微小水印铁律 (Zero Noise & Clean Margin)**：
  - 严禁在海报上放置域名（`obs.xiaojiucai.pro`）或任何肉眼无法辨识的微小水印，保持版面干净庄重。
- **100% 纯端侧本地计算铁律 (Zero-Server Zero-LLM Poster Computing)**：
  - 海报 100% 在用户手机浏览器通过 HTML5 Canvas 2D 硬件加速引擎在 ~50ms 瞬间离线绘制；
  - 0 服务器算力消耗、0 大模型 Token / 绘图 API 开销；
  - 隐私绝对安全，八字排盘与姓名永不上报海报服务器。

### 8. 四化徽章高对比四色与单一后缀规范 (Mutagen Badges & Clean Suffix Canon)
- **正统四化徽章高对比四色**：四化徽章严禁单调黑金，必须使用紫微正统四化经典视觉配色：
  - 禄（化禄）：琥珀金（`text-amber-300 / bg-amber-500/20`，浅色 `text-amber-900 / bg-amber-100`）；
  - 权（化权）：朱砂红（`text-rose-300 / bg-rose-500/20`，浅色 `text-rose-900 / bg-rose-100`）；
  - 科（化科）：霁蓝天青（`text-sky-300 / bg-sky-500/20`，浅色 `text-sky-900 / bg-sky-100`）；
  - 忌（化忌）：墨紫深黛（`text-purple-200 / bg-purple-900/30`，浅色 `text-stone-900 / bg-stone-200`）。
- **单一后缀与主星纯净匹配铁律**：严防字符拼接叠词（彻底杜绝“化禄化禄/化科化科”）。底层计算时强制清洗主星名（`replace(/化[禄祿权權科忌]/g, '')`），确保纯主星名与星盘宫位星曜 100% 精确匹配，保障钦天流日禄入、冲照与坐忌算法零失误。

### 9. 运势详情全员社交裂变闭环 (Universal Fortune Sharing Canon)
- **会员与非会员全覆盖**：无论通过裂变解锁的普通用户，还是持有俱乐部会员卡 (Club Pass) 的终身会员，在进入 `DailyDetailModal` 详情弹窗顶部，右上角均常驻显眼古金圆角胶囊按钮 `[Share2] 分享`。
- **触手可及的裂变引擎**：让所有付费和非付费用户随时可以一键生成霸气总标与核心断语海报，分享至微信、朋友圈或 Telegram，实现人人皆为自媒体传播节点的裂变闭环。

### 10. 使用说明与研创指南高效精炼规范 (Almanac Beginner Guide Canon)
- **移动端大字号高对比度铁律**：
  - 移动端正文不得低于 `15px`（`text-[15px]` / `text-base`），标题 `18px~20px`，确保移动端用户秒读；
  - 严禁使用发虚发灰的弱对比度字色，采用白玉帛底色配合深炭灰（`text-stone-800` / `text-stone-900`）。
- **60% 极速压缩废话原则（Zero Fluff / Zero Word Salad）**：
  - 坚决砍除冗长自嗨营销软文与重复车轱辘话；
  - 直奔核心三层决策漏斗（核心气象 $\rightarrow$ 军师破局断语 $\rightarrow$ 钦天紫微科学推演）与终身免费机制，文字精炼如刀。

---

## 专职执行体与定点资产

- **前端工程唯一根路径**: `/home/a/obsxiaojiucai/`
- **前端主逻辑入口**: `/home/a/obsxiaojiucai/App.tsx`（严格遵守 <= 250 行法则）
- **顶层导航与运势卡片 UI 矩阵**:
  - 极简移动端顶栏: `/home/a/obsxiaojiucai/components/NavbarHeader.tsx`（极简紧凑排布）
  - 专属运势高对比度卡片: `/home/a/obsxiaojiucai/components/FortuneCard.tsx`（「专属运势」命名、宣纸底色、深墨字阶、宜忌徽章、流日干支、Club Pass 徽章与 24h 解锁倒计时）
  - 运势详解深度批命模态: `/home/a/obsxiaojiucai/components/DailyDetailModal.tsx`（流日真机排盘、星曜赋性深批、零模版星）
  - 专属运势古法宣纸海报模态: `/home/a/obsxiaojiucai/components/SharePosterModal.tsx`（古法白玉生宣纸装裱、朱砂专属方印、9:16 长图、24h 运势特权裂变解锁）
  - 使用说明与研创指南: `/home/a/obsxiaojiucai/components/AstrolabeBeginnerView.tsx`（白玉帛底色、全篇原生流畅下滑、正统排盘与科技指南）
  - 十二宫排盘与指南容器: `/home/a/obsxiaojiucai/components/AstrolabeView.tsx`（双视界按需切换、自适应滚动容器）
  - 命盘中宫枢纽中心盘: `/home/a/obsxiaojiucai/components/AstrolabeCenterPanel.tsx`（太极枢纽、生年四化、宫位聚焦与钦天四化飞星动态指引）
  - 中宫时空罗盘总览: `/home/a/obsxiaojiucai/components/AstrolabeCenterOverview.tsx`（大限定位时空轴、流年轮盘步进器与宗师批命入口）
  - 三方四正矢量光芒连线: `/home/a/obsxiaojiucai/components/SanFangSiZhengOverlay.tsx`（纯 SVG 几何连线、淡金三合三角与青蓝对冲轴线）
  - 单宫卡片标准渲染器: `/home/a/obsxiaojiucai/components/PalaceCard.tsx`（12宫名称居中、微毛玻璃、大限起止解耦排版）
  - 客户端下载与 GRAM 登录: `/home/a/obsxiaojiucai/components/DownloadModal.tsx`（iOS PWA / Android APK / GRAM 钱包直连登录、Club Pass 状态联动）
  - 设备绑定与会员卡片: `/home/a/obsxiaojiucai/components/ActivationSection.tsx`（强制 PWA/APK 环境绑定防丢、1机1卡、Club Pass 会员指引）
  - 俱乐部会员卡鉴权模态: `/home/a/obsxiaojiucai/components/PassPromptModal.tsx`（GRAM 钱包直连、链上会员卡核验、获取账号教程导航）
- **造物主人生剧本 UI 矩阵**:
  - 沉浸式推演主模态: `/home/a/obsxiaojiucai/components/CreatorScriptModal.tsx`
  - 顶栏状态与功能条: `/home/a/obsxiaojiucai/components/CreatorScriptHeader.tsx`（俱乐部会员卡专属永久能量与每日重置）
  - 非会员引导与容灾卡片: `/home/a/obsxiaojiucai/components/CreatorScriptErrorNotice.tsx`（Club Pass 尊享特权与激活码输入引导）
  - 东方宣纸排版渲染器: `/home/a/obsxiaojiucai/components/ScriptRenderer.tsx`
  - 命书宣纸长图装裱模态: `/home/a/obsxiaojiucai/components/CreatorScriptPosterModal.tsx`
  - 推演准备与知情确认大厅: `/home/a/obsxiaojiucai/components/CreatorScriptStartGate.tsx`
- **Web3 与网络通信核心**:
  - 异步按需 TonConnect 桥接: `/home/a/obsxiaojiucai/components/AsyncTonConnect.tsx`（<= 250 行，挂起唤起机制，本地 wallets 静态直发）
  - 钱包与会员卡状态 Hook: `/home/a/obsxiaojiucai/hooks/useWeb3Pass.ts`（双向事件总线，历史地址自动预载）
  - 离线/静态钱包清单: `/home/a/obsxiaojiucai/public/wallets-v2.json`
- **排盘与命理算法核心**:
  - 排盘计算器: `/home/a/obsxiaojiucai/utils/astrolabeCalculator.ts`
  - 钦天四化飞星与对冲助手: `/home/a/obsxiaojiucai/utils/flyingStarsHelpers.ts`（飞入、飞出、自化、互冲判定）
  - 动态流日运势引擎: `/home/a/obsxiaojiucai/utils/fortune.ts`（70% 钦天派四化 + 30% 中州派庙旺利陷）
  - 今日运势 24h 权限与分享判定: `/home/a/obsxiaojiucai/utils/dailyFortunePass.ts`
  - 黄历万年历词条库: `/home/a/obsxiaojiucai/utils/almanacTerms.ts`（多语言词条、严格 <= 250 行）
  - 真太阳时算法: `/home/a/obsxiaojiucai/utils/solarTime.ts`
  - 命盘树结构化提取: `/home/a/obsxiaojiucai/utils/astrolabePromptBuilder.ts`
  - 宣纸长图 Canvas 绘制引擎: `/home/a/obsxiaojiucai/utils/creatorPosterDrawer.ts`，`/home/a/obsxiaojiucai/utils/posterDrawer.ts`
  - 站内流式推演与能量通信服务: `/home/a/obsxiaojiucai/utils/fortuneService.ts`
- **设备指纹与客户端验签**:
  - 硬件密钥生成与防重放签名：`/home/a/obsxiaojiucai/utils/deviceCrypto.ts`
  - 本地令牌与会员卡状态校验：`/home/a/obsxiaojiucai/utils/clubPass.ts`
- **一键原子构建部署脚本**: `/home/a/bin/deploy_obs_site.sh`
- **后端 Rust 源码工程**: `/home/a/obs_membership_rust/`
  - 核心入口与路由注册：`/home/a/obs_membership_rust/src/main.rs`
  - ECDSA P-256 密码学：`/home/a/obs_membership_rust/src/crypto.rs`
  - 天命能量与每日重置：`/home/a/obs_membership_rust/src/energy.rs`
  - 大模型流式推演核心：`/home/a/obs_membership_rust/src/fortune.rs`
  - 宗师算法提示词库：`/home/a/obs_membership_rust/src/prompts.rs`
  - 原子持久化存储：`/home/a/obs_membership_rust/src/store.rs`
  - HTTP 请求处理器：`/home/a/obs_membership_rust/src/handlers.rs`
- **后端编译产物与常驻服务**:
  - 微服务二进制：`/home/a/bin/obs_membership`
  - 客服管理工具：`/home/a/bin/obs_code_tool`
  - 数据库文件：`/home/a/obs_membership_rust/data/membership_store.json`
  - Systemd 服务配置：`/etc/systemd/system/obs_membership.service` (监听 `127.0.0.1:8096`)
- **Nginx 虚拟主机配置**: `/etc/nginx/sites-available/obs_xiaojiucai_pro`
- **系统总守护挂载**: `/home/a/system_keeper_rust/src/process_guard.rs` (纳入 24 小时保活自愈)

---

## 核心业务与技术架构规范

### 1. 全局会员卡命名规范 (Club Pass Naming Standard)
- **统一法定名称**：
  - **全称**：**「小韭菜俱乐部会员卡」**
  - **简称**：**「俱乐部会员卡」**
  - **英文**：**「Club Pass」**
- **严禁使用陈旧术语**：全站所有代码、UI、弹窗、日志及文案中，严禁出现「NFT会员」、「GRAM NFT」、「TON NFT」、「GRAM尊享」、「VIP 通行证」等老旧称谓；今日运势徽章统一规范为 `Club Pass`。

### 2. 动态流日纯净气象研判与中性法则 (Neutral Flow Day Standard)
- **流日多维气象算法（钦天为主，中州为次）**：
  - **70% 钦天四化体系**：以生年天干四化、来因宫 1.25x 加权以及流日干支四化飞星为核心研判，注重化禄、化权、化科、化忌的气机流转与宫位感应；
  - **30% 中州星曜体系**：综合流日命宫及对宫星曜庙旺利陷、流曜（羊陀火铃）照临赋性深批；
- **彻底废除日历“吉/凶”二元标签与闪电乌云图标（绝对红线）**：
  - **学术红线**：严禁将化禄/权/科粗暴划为“吉”，严禁将化忌/煞星粗暴划为“凶”；化忌代表收敛深耕专注，化禄亦有发散冲破之险。日历格子严禁出现 Sun/CloudLightning 等误导性图标；
  - **纯净极简历法视界**：日历格子只保留公历日期、农历月日、二十四节气与太极旋转选中态，杜绝给用户造成负面心理焦虑；
  - **彻底废除 1~5 档评分条 (`scoreBars`)**：严禁采用类似外卖/游戏评价的低幼化打分条，统一以高阶「今日气机落入本命【某宫】」或哲思气象辞引航。
- **24 小时海报分享裂变门槛 (`dailyFortunePass.ts`)**：
  - 俱乐部会员卡持有者（`Club Pass`）与激活码有效期内用户：直接全免查看今日运势与深度详解；
  - 非会员或激活码能量耗尽用户：必须生成并分享专属宣纸运势海报，分享一次获得 24 小时专属流日解锁特权；过期后恢复锁定状态，形成低成本社交裂变。

### 3. Web3 钱包直连与挂起唤起架构
- **静态资源零故障直发**：`/wallets-v2.json` 必须作为静态 JSON 文件常驻 `public/` 目录，严禁依赖外部网络或因 404 回退给 `index.html` 导致 TonConnect SDK 解析 JSON 崩溃；
- **挂起即开机制 (`__pendingOpenTonModal`)**：用户在下载弹窗或其他位置点击「登录 GRAM 钱包」时，若 Web3 SDK 仍在懒加载过程中，自动挂起并在组件就绪（`web3-ready`）的第一时间瞬时唤起钱包弹窗，杜绝“点击没反应”或弹窗关闭后钱包无响应的问题；
- **状态双向同步**：`useWeb3Pass` 接入 `ton-status-change` 总线，实时响应连接、断开与链上会员卡持仓检测。

### 4. 钦天四化飞星完整排盘体系 (`flyingStarsHelpers.ts`)
- **全方位飞星算法**：
  - **飞入 (Fly-in)**：聚焦宫位天干所化四化（禄权科忌）落入的目标宫位；
  - **飞出 (Fly-out)**：有哪些外宫的天干将四化飞入了当前聚焦宫位；
  - **本宫自化 (Self-transformation)**：宫位天干将四化化入自身宫位；
  - **对冲吉凶 (Opposite Clash)**：尤其化忌冲对宫（如迁移冲命、福德冲财）之大忌提示。
- **中心盘交互**：点击任意宫位即在中宫实时展示钦天飞星流向，提供正统宗师级断盘体验。

### 5. 激活码「1 机 1 卡」与运行环境防丢守卫
- **严禁网页端绑定**：普通浏览器存在用户清理缓存或无痕浏览导致本地签名丢失的重大风险。系统通过 `isStandaloneOrApp()` 探针强制拦截网页端绑定请求；
- **强制 APK / PWA 桌面独立环境绑定**：必须在已添加到主屏幕的 iOS PWA 桌面独立窗口或 Android APK 客户端内完成激活码绑定；
- **严格 1 机 1 卡**：文案统一规范为「绑定激活码」，单一激活码与单台硬件设备唯一强绑定，能量扣完即止。

### 6. 三层梯队天命能量与鉴权治理规范
- **全命盘全局推演**：单次消耗 **6 点天命能量**；推演前在准备大厅显式展示扣费规则与当前余额，需用户主动确认，严禁静默扣费；
- **后续导师答疑追问**：单次消耗 **1 点天命能量**；
- **历史档案终身免费**：已生成用户全盘剧本自动本地哈希存档，二次进入零能量消耗，支持永久免费回看与长图装裱导出；
- **非会员 (Free)**：
  - 运势详解与万年历：需分享海报获取 24h 特权；
  - 造物主剧本：能量 0 点，进入推演大厅呈现清晰引导卡片（绑定激活码或连接俱乐部会员卡）；
- **激活码会员 (Activation Code)**：
  - 能量：单码内含 30 点专属天命能量，扣完即止；
  - 权限：严格执行 **1 机 1 卡** 设备绑定；必须在 iOS PWA 或 Android APK 客户端内绑定；
- **小韭菜俱乐部会员卡 (Club Pass Holder)**：
  - 能量：每日子时自动重置回满 10 点专属能量（免除买码烦恼）；
  - 尊享特权：每日专享 10 点免费天命能量，支持每日全盘推演与多次深度追问。

### 7. 商业机密绝对隔离与封闭防护规范 (Zero-BYOK Policy)
- **彻底废除用户自定义 API (BYOK)**：全站完全移除一切自定义 API 输入入口与宣传文案，物理阻断用户利用自建抓包站或中转平台后台窥探窃取宗师提示词（中州派/钦天派独家法门）；
- **官方私密闭环调度**：全盘推演与追问全部由服务端私密引擎直接调度，通信链路 100% 封闭，对外只下发渲染结果，提示词绝不出内网；
- **防泄密绝杀红线**：提示词内嵌绝杀防泄密守卫，坚决拦截一切越狱套话行为。

### 8. 命理算法正统法则（紫微 vs 八字）
- **八字换年依节气**：八字以二十四节气中的「立春」换年；
- **正统紫微依天时历法**：正统紫微斗数严格以「农历正月初一」换年；
- **绝对红线**：严禁在紫微排盘中误用八字节气库的 `solarTermsFourPillars` 作为生年干支！否则农历春节至立春之间出生者（如 1990-01-28）天干错位，直接导致钦天派核心灵魂【来因宫】整整错位一个大宫位；
- **标准实现**：生年天干必须严格从 `chineseDate.yearly[0]` 提取，彻底解耦八字节气。

### 9. 客户端纯算力与 J3710 弱电硬件零消耗铁律 (Zero-Server-Computing & J3710 CPU Protection)
- **保护 Intel J3710 弱电宿主机硬件（核心红线）**：J3710 (牛马2号) 是功耗仅 6W 的弱电嵌入式 CPU，专职生产宿主与静态直发，**绝对严禁在 J3710 上执行日常重型编译（如 Vite 打包、Rust 深度优化编译）**，绝不可让 J3710 核心过热降频或引发生产假死！
- **Mac mini M2 独揽所有编译与研发算力**：前端构建（`npm run build`）、TypeScript 静态分析（`npx tsc --noEmit`）、Brotli/Gzip 双重高强度预压缩、文档 Wiki 迭代与技能管理，**100% 必须在 Mac mini M2 本地完成**，生产机只接收纯静态与预编译产物；
- **100% 客户端本地命理计算**：紫微斗数十二宫排盘、星曜赋性、生年四化、大限流年、动态流日运势、真太阳时经纬度校准、农历万年历转换、命盘树结构化提取与宣纸长图装裱，**全部运行于用户本地终端（浏览器/手机 Webview）**；
- **服务端绝对零排盘压力**：后端微服务坚决不做任何排盘算法与万年历计算，零动态 Node SSR 消耗；
- **Nginx 零拷贝边缘**：全站前端静态产物依赖 Nginx 纯静态 Brotli / Gzip level 9 双重预压缩直发；
- **Rust 微服务仅专职两项轻量业务**：仅处理激活码绑定时的 ECDSA 密码学验签（毫秒级）以及会员叩问时的造物主人生剧本 AI 流式中继 (`/api/fortune/stream`)，常驻内存压制在 10MB 以内。

### 10. 「专属运势」品牌定位与古法宣纸海报规范
- **命名法定红线**：
  - 功能按钮、卡片标题统一法定为**「专属运势」**（Personal Exclusive Fortune），副标标示**「命盘专属」**；
  - 严禁使用「生成命笺」、「今日运势日签海报」等生僻、老土或工具化词汇；
- **视觉风格彻底根除纯黑**：
  - 海报底色 100% 坚守**古法白玉生宣纸质感**（`#FAF5EB` / `#ECE2CE` 柔和渐变底纹），彻底淘汰压抑纯黑；
  - 配色严守东方美学：朱砂红（`#9E2A2B` / `#D43833`）专属方印、深玄重墨（`#1F1D1A`）核心诗偈、泥金边框（`#C5A059`）；
  - 布局采用 **9:16** 社交媒体裂变高转化长图（900x1600），顶部朱砂方印「專屬」，中段流日四化与传统干支，底部专属流日运势指引与小韭菜俱乐部认证印鉴；
- **万年历宜忌正统典籍还原**：
  - 严禁自作聪明替换为「商务谈判」、「投资理财」、「大额支出」等现代企业化生硬用语；
  - 100% 忠实提取并呈现《钦定协纪辨方书》万年历正统黄历宜忌词条（如「祭祀」、「出行」、「纳采」、「开市」、「安床」、「破屋」等），保持古朴庄重。

### 11. 动态活盘与三方四正动态呼吸闪光规范 (Dynamic Astrolabe & San Fang Si Zheng Glow)
- **十二宫名称居中与大限解耦排版**：
  - 12 宫名称（如【命宫】）及其身宫/来因徽章必须位于宫位正中心（`top-1/2 left-1/2`）并搭配毛玻璃微底板；
  - 底部左翼专属呈现大限年龄起止（`23-32`）与博士星，底部右翼专属呈现长生十二神与小限年龄，底部中央完全留空，彻底根治移动端对大限日期的物理遮挡；
- **三方四正纯净动态呼吸闪光 (零杂乱虚线)**：
  - 彻底摒弃生硬的 SVG 虚线几何连线与卡片 `border-dashed` 虚线边框；
  - 当任意宫位被点击聚焦时，三方四正四位一体通过优雅的呼吸微光动态闪烁呈现（本宫泥金、对宫天青、三合暖金，闲杂宫位自然淡化），干净高级且不遮挡任何排盘文字；
- **时空轮盘与穿透式自动定位 (`AstrolabeCenterOverview.tsx`)**：
  - 中宫提供全盘大限时空轴（`5-14岁 命宫`、`15-24岁 兄弟`...）与流年轮盘步进器（`<`、`2026 丙午`、`>` 及前后五年快选）；
  - 点击任意大限或流年，系统自动换算时间并在客户端瞬时重算 `horoscope`，**排盘焦点自动定位聚焦至对应运限命宫**，中心盘即时呈现运限四化与叠宫，三方四正微光闪烁随之联动跃迁。

### 12. 今日运势卡片 (FortuneCard) 文人雅墨色阶规范 (Xuan Paper Aesthetic Standard)
- **色阶纯净无脏色**：
  - 底色：统一采用古法温润白玉生宣纸质感（`#FCFAF5` / `#F8F4EA`）；
  - 文字：纯正深墨（`#1F1D1A` / `#2D2824`）与内敛墨色（`#4A4036`）；
  - 严禁出现墨黑绿底配琥珀亮黄（`#1F2421` + `text-amber-200`）、灰褐色字（`#2D1B1B`）及芥末黄打分条等杂乱脏色；
- **宜忌金石印泥对比平衡**：
  - **「宜」**：文人金石朱砂印（`#9E2A2B` 底色 + 纯白字 + `#2D2824` 墨字列表）；
  - **「忌」**：雅致玄墨古印（`#38332E` 底色 + 宣纸色字 + `#4A4036` 沉稳字列表）；
  - 两者视觉重量均等平稳，烘托文人书卷气，杜绝视觉倾斜。

---

## 核心运维与调试 SOP

### 1. 前端业务构建与跨机联动部署 (Mac M2 极速构建 -> J3710 生产推流)
在 Mac mini M2 工程目录 `/Users/hi/niuma/projects/obsxiaojiucai/` 完成研发修改后，执行根目录标准化发布脚本：
```bash
./deploy.sh "commit 提交信息"
```
执行链路：
- 自动暂存未提交修改，执行 `git pull --rebase origin main`；
- Mac mini M2 本地极速构建（`npm run build`，耗时约 3.3 秒，彻底解放 J3710 算力）；
- **双重预压缩**：自动对产物执行 `brotli -q 9` 与 `gzip -9`，生成 `.br` 与 `.gz` 静态预压缩产物；
- 源码提交并推送到 GitHub 远端；
- SSH 远程触发 J3710 (`192.168.1.182`) `/home/a/obsxiaojiucai` 执行 `git pull`；
- `rsync -avz --delete dist/` 零编译原子推流预压缩产物至生产机；
- 远程执行 `sudo nginx -t && sudo systemctl reload nginx` 完成无感热上线。

若在 J3710 本地离线环境维护，亦可调用本地脚本：`/home/a/bin/deploy_obs_site.sh`。

### 2. 后端 Rust 流式服务发布规范 (J3710 生产微服务守护)
【J3710 算力零消耗核心红线】：J3710 是 6W 弱电嵌入式 CPU，**严禁将其作为日常开发和频繁编译机**！微服务源码高度精简且架构稳定，日常开发中严禁在 J3710 上无故触发重型编译消耗生产 CPU；仅在完成 Mac 语法核验且必须发布修复版本时，方可按如下极简流水线热更新：
```bash
ssh a@192.168.1.182
source ~/.cargo/env
export https_proxy=http://127.0.0.1:10809 http_proxy=http://127.0.0.1:10809 all_proxy=socks5://127.0.0.1:10808
cd /home/a/obs_membership_rust
cargo build --release
cp target/release/obs_membership_rust /home/a/bin/obs_membership_new
mv -f /home/a/bin/obs_membership_new /home/a/bin/obs_membership
echo a | sudo -S systemctl restart obs_membership
curl -s http://127.0.0.1:8096/api/health
```
- **工具链就绪**：User `a` 本地已配置完整 Rust 1.98.1 工具链，常驻内存仅 ~9.9MB（严格受控于 15MB 硬件红线内）。
- **进程看门狗自愈**：`system_keeper_rust` 对 `obs_membership` 进行 24 小时保活，若检测到进程退出自动拉起。

### 3. 客服日常运维（查码、解绑重置与新码入库）
```bash
# 查询激活码状态与已绑设备
/home/a/bin/obs_code_tool check <ACTIVATION_CODE>

# 5 秒一键解绑重置
/home/a/bin/obs_code_tool reset <ACTIVATION_CODE>

# 批量导入新批次激活码
/home/a/bin/obs_code_tool import <FILE_PATH> [批次备注]

# 查看总库统计
/home/a/bin/obs_code_tool stats
```

---

## 工程研发与防御规范

1. **后端 100% 坚守 Rust 与小文件法则 (Small File Standard)**：
   - 鉴权与推演服务严禁使用 Node.js、Python 等重型解释型运行时；
   - 针对 J3710 弱电硬件，常驻内存必须严格压制在 15MB 以内；
   - **小文件法则**：所有前端及后端源代码文件严格控制在 **250 行以内**，单一职责，杜绝修改引发的隐蔽副作用。
2. **视觉与意识形态绝对红线**：
   - **零 Emoji**：代码、UI 文案、词条字典、日志与推送中严禁任何 Emoji 表情符；
   - **零星星**：全站严禁四角星、五角星等 AI 模板化图符；
   - **政治安全绝对红线**：严禁出现政治敏感词汇，底层物理拦截丢弃。
3. **前端纯静态预压缩与零 Node SSR**：
   - 前端坚持 React + Vite + TailwindCSS 纯静态预压缩架构；
   - 依赖 Nginx 零拷贝高效直发，服务端零动态 Node 算力消耗；
   - 所有静态资产发布时必须附带 `.br` 与 `.gz` 预压缩文件。
4. **全站防白屏与前端健壮性规范 (Anti-Blank Screen Standard)**：
   - **顶层 Error Boundary 强制守卫**：必须在 `index.tsx` 顶层使用 `GlobalErrorBoundary` 包裹 `<App />`，杜绝任何未捕获异常引发 React 卸载导致全白屏；
   - **HTML 内联脚本 100% 纯原生 JavaScript**：`index.html` 顶层内联 `<script>` 直接由浏览器解析，严禁混入任何 TypeScript 语法；
   - **发版前强制 TypeScript 语义检查**：Vite 构建仅做代码转译不报错未定义变量，重构后发布前必须严格执行 `npx tsc --noEmit` 验证通过，确保 0 错误后方可执行 `deploy.sh`。
5. **正统数术算法防御规范 (Canon Defense Standard)**：
   - **繁简统一字典强映射**：星曜名与四化映射（`SI_HUA_MAP` 与 `st`）必须 100% 覆盖繁体字根（`廉贞->廉貞`、`破军->破軍`、`左辅->左輔`），严禁因简繁异构导致钦天四化漏算；宜忌列表清洗空项与 `无/無`。
   - **立极换年与八字节气绝对解耦**：正统紫微斗数严格依农历正月初一换年，生年干支与来因宫立极兜底必须使用 `lunarFourPillars`，绝不可混用立春换年的 `solarTermsFourPillars`。
   - **宗师提示词道统繁体**：四化标识强制统一为 `['祿', '權', '科', '忌']`，杜绝简体字混入提示词上下文。
   - **真太阳时方向判定**：经度字段统一根据正负值显式标注 `°E` / `°W`，杜绝西经被硬编码为东经。
   - **海报流式排版双防线**：长文自适应行高推移配合单词边界分词器，底部印鉴兜底 Y 坐标动态计算 `Math.max(1180, cursorY + 28)`，100% 防溢出防撞车。
   - **全盘推演与追问严格计费隔离**：后端严格判定 `!q.trim().is_empty()`，空 question 必须走 6 点全盘推演逻辑并加载宗师提示词，杜绝空串偷跑 1 点追问计费。
