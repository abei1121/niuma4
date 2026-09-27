---
name: life_script_ops
description: 人生运势历 (obs.xiaojiucai.pro) 前端构建优化、Rust 鉴权微服务、站内造物主剧本流式推演引擎、动态流日运势真机、通用大模型接入与全生命周期运维技能。
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
2. **后端微服务 (`/home/a/obs_membership_rust/`)**：纯 Rust 构建（常驻内存仅 ~14MB），提供 ECDSA P-256 密码学签名防重放验签、三层梯队天命能量治理、`agy` 大模型流式推演管道与通用 OpenAI 兼容协议接入支持。
3. **专属客服与运维工具链 (`/home/a/bin/obs_code_tool`)**：本地毫秒级激活码查询、5 秒一键解绑重置（客服专职）、新卡批量入库及全局统计。
4. **Nginx 零拷贝边缘**：Brotli / Gzip 静态双重预压缩直发，`/api/` 路由内聚反代至本地 Rust 服务（`127.0.0.1:8096`），配置专用非缓冲 SSE 直发管道。

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
  - 顶栏状态与功能条: `/home/a/obsxiaojiucai/components/CreatorScriptHeader.tsx`（俱乐部会员卡专属 API 生效标示与永久能量）
  - 非会员引导与容灾卡片: `/home/a/obsxiaojiucai/components/CreatorScriptErrorNotice.tsx`（Club Pass 尊享特权与激活码输入引导）
  - 东方宣纸排版渲染器: `/home/a/obsxiaojiucai/components/ScriptRenderer.tsx`
  - 命书宣纸长图装裱模态: `/home/a/obsxiaojiucai/components/CreatorScriptPosterModal.tsx`
  - 会员卡专属自定义 API 配置抽屉: `/home/a/obsxiaojiucai/components/NftCustomApiPanel.tsx`
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

### 2. 动态流日真机与 24h 分享裂变解锁机制
- **流日双轨算法（钦天为主，中州为次）**：
  - **70% 钦天四化体系**：以生年天干四化、来因宫 1.25x 加权以及流日干支四化飞星为核心研判，吉忌互斥，绝不同时亮起；
  - **30% 中州星曜体系**：综合流日命宫及对宫星曜庙旺利陷、流曜（羊陀火铃）照临赋性深批；
  - **万年历日格联动**：日历格子仅互斥呈现当日最核心之吉或忌。
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
- **非会员 (Free)**：
  - 运势详解与万年历：需分享海报获取 24h 特权；
  - 造物主剧本：能量 0 点，点击中州/钦天不发起后台计算，直接呈现清晰引导卡片（绑定激活码或连接俱乐部会员卡）；输入框锁定，严禁使用自定义 API。
- **激活码会员 (Activation Code)**：
  - 能量：单码内含 30 点专属天命能量，扣完即止；
  - 权限：严格执行 **1 机 1 卡** 设备绑定；必须在 iOS PWA 或 Android APK 客户端内绑定；不可配置自定义 API。
- **小韭菜俱乐部会员卡 (Club Pass Holder)**：
  - 能量：每日子时自动回满 10 点专属能量（免除买码烦恼）；
  - 尊享特权：**独家解锁自定义大模型 API 接入特权**，支持免消耗能量无限次叩问推演。

### 7. 通用大模型接入协议规范 (OpenAI-Compatible BYOK)
- **协议标准化**：支持全球通用的 OpenAI 兼容格式（`Base URL` + `API Key` + `Model`）；
- **品牌与模型脱敏**：全站严禁向用户暴露底层具体使用的模型供应商，统一呈现为“自定义大模型 API (OpenAI 协议)”；
- **后端双轨解析**：Rust 后端在同一 SSE 管道中自适应解析通用 OpenAI 的 `choices[0].delta.content` 与原生系统的 `step_update.text_delta`；
- **权限硬核校验**：Rust 后端强制校验请求是否为已验资通过的俱乐部会员卡持仓地址；非会员伪造参数直接返回 `403 Forbidden`。

### 8. 命理算法正统法则（紫微 vs 八字）
- **八字换年依节气**：八字以二十四节气中的「立春」换年；
- **正统紫微依天时历法**：正统紫微斗数严格以「农历正月初一」换年；
- **绝对红线**：严禁在紫微排盘中误用八字节气库的 `solarTermsFourPillars` 作为生年干支！否则农历春节至立春之间出生者（如 1990-01-28）天干错位，直接导致钦天派核心灵魂【来因宫】整整错位一个大宫位；
- **标准实现**：生年天干必须严格从 `chineseDate.yearly[0]` 提取，彻底解耦八字节气。

### 9. 客户端纯算力与零服务端消耗规范 (Zero-Server-Computing)
- **100% 客户端本地计算**：紫微斗数十二宫排盘、星曜赋性、生年四化、大限流年、动态流日运势、真太阳时经纬度校准、农历万年历转换、命盘树结构化提取与宣纸长图装裱，**全部运行于用户本地终端（浏览器/手机 Webview）**；
- **服务端绝对零排盘压力**：后端微服务坚决不做任何排盘算法与万年历计算，零动态 Node SSR 消耗，彻底保护 Intel J3710 弱电宿主机硬件；
- **Nginx 零拷贝边缘**：全站前端静态产物依赖 Nginx 纯静态 Brotli / Gzip level 9 双重预压缩直发；
- **Rust 微服务仅专职两项业务**：仅处理激活码绑定时的 ECDSA 密码学验签（毫秒级）以及会员叩问时的造物主人生剧本 AI 流式中继 (`/api/fortune/stream`)。

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

---

## 核心运维与调试 SOP

### 1. 前端业务构建与原子在轨部署
在 `/home/a/obsxiaojiucai/` 完成修改后，必须执行专属原子部署脚本：
```bash
/home/a/bin/deploy_obs_site.sh
```
执行链路：
- TypeScript 严苛语义与未定义变量前置校验（`npx tsc --noEmit`）；
- Vite 生产构建打包；
- 双重静态预压缩（Brotli level 9 + Gzip level 9）；
- 双哈希平滑过渡与原子热替换；
- Nginx 语法校验与热重载；
- 本地前端探针（HTTP 200）与 API 健康打靶 (`/api/health`)。

### 2. 后端 Rust 流式服务编译与发布
若修改了 `obs_membership_rust`：
```bash
cd /home/a/obs_membership_rust
cargo build --release
systemctl stop obs_membership.service
cp target/release/obs_membership_rust /home/a/bin/obs_membership
systemctl daemon-reload
systemctl start obs_membership.service
curl -s http://127.0.0.1:8096/api/health
```

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
   - **发版前强制 TypeScript 语义检查**：Vite 构建仅做代码转译不报错未定义变量，重构后发布前必须严格执行 `npx tsc --noEmit` 验证通过，确保 0 错误后方可执行 `deploy_obs_site.sh`。
