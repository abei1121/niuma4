---
name: dapp_keeper
description: TON 链 Web3 RPC 延迟探针、细狗 DApp 构建发布、XGBot 本地微服务及全栈可用性守护中枢。
triggers:
  - dapp_keeper
  - dapp_health
  - ton_probe
  - scrawny_ops
  - xgbot_service
---

# 细狗 DApp、TON Web3 与微服务全栈守护技能 (DApp Keeper)

## 概述
《你是细狗吗》 (Scrawny DApp / raw.xiaojiucai.pro) 纯 TON 架构 Web3 健身社区全生命周期运维与守护中枢：
1. **TON Web3 底座**: 专注 TON (The Open Network) 公链 RPC 延迟探测、主链高度打靶与名人堂智能合约环境守护，彻底剥离 ETH / EVM / L2 冗余依赖。
2. **XGBot 本地微服务**: 守护 `dapp_xgbot.service` (Node.js)，负责 Telegram 投稿审核 Webhook、Pinata IPFS 专有网关上传与 Gemini 毒舌评价。
3. **Nginx 边缘与前端发布**: 管理 Vite 6 模块化增量构建、静态资源 1 年不可变强缓存（immutable）、HTML 入口协商缓存与 Brotli/Gzip 压缩。

## 专职执行体与定点资产
- **细狗工程唯一主定点**: `/home/a/dapp/rawxiaojiucai/`
- **双开门名人堂组件库**: `/home/a/dapp/rawxiaojiucai/components/club/`
- **用户身材秀嗅探与打卡统计工具**: `/home/a/dapp/rawxiaojiucai/utils/userClubCard.ts`
- **移动端存手机与桌面引导**: `/home/a/dapp/rawxiaojiucai/components/PwaInstallPrompt.tsx`
- **全栈健康打靶脚本**: `/home/a/bin/dapp_health_probe.sh`
- **XGBot 本地微服务**: `/etc/systemd/system/dapp_xgbot.service` (监听 `127.0.0.1:8095`, 限制内存 `100M`)
- **Nginx 虚拟主机配置**: `/etc/nginx/sites-available/raw_xiaojiucai_pro`
- **网络代理通道**: 强制通过本地 Hysteria 2 代理 `http://127.0.0.1:10809` 访问海外 TON RPC 与 Pinata

## 业务边界与产品定位规范
1. **核心唯一业务资产**: 聚焦于【双开门名人堂】（`DoubleDoorClub`），服务于博主身材展示、社媒引流（小红书、抖音、IG、TK、YT）与 TON 链上身份沉淀，免去无关社交负担。
2. **动作卡片无计时器**: 动作训练卡片严格按 UI 要求由用户每组 60 次自觉完成，严禁添加倒计时器扰乱用户节奏。
3. **杜绝段位蜕变机制**: 彻底排除段位等级、签到打卡等繁复游戏化机制，保持产品克制轻量。
4. **移动双端防误退保护**: 目标平台为 iOS PWA 与 Android 带壳（Capacitor）。弹窗全面接入 `window.history.pushState` 与 `popstate` 看门狗，拦截 Android 侧滑与物理返回键，确保关闭弹窗而非退出 App。
5. **低端移动硬件零额外负担规范 (Low-End Mobile Zero-Overhead Standard)**: 严禁引入手机振动（navigator.vibrate/haptics）、全局音效或复杂的重度 CSS 动效；严格保障百元机、低端安卓机与老年机长时间连续动作训练无卡顿、无发热、零掉帧。
6. **多层顶层弹窗独立解耦与防竞态规范 (Modal Anti-Race Condition Standard)**: 全局顶层弹窗（如 VipModal、ContactModal 等）必须平级独立挂载于根组件受控状态，严禁通过嵌套触发多次 `window.history.back()` 引起 popstate 事件竞态而导致目标弹窗闪退。

## 核心操作 SOP

### 1. 细狗全栈健康巡检 (必须实测打靶)
```bash
/home/a/bin/dapp_health_probe.sh
```
探测项覆盖：TON 主网区块高度与延迟、Pinata 专有 IPFS 网关鉴权、XGBot 微服务 HTTP 心跳与内存监控、Nginx 8080/80 站点响应。

### 2. 细狗前端增量编译与跨机原子发布 (Mac M2 极速构建 -> J3710 生产推流)
【J3710 算力零消耗铁律】：J3710 (牛马2号) 是 6W 弱电 CPU，**绝对严禁在 J3710 上直接执行 `npm run build`**！
所有前端构建必须在 Mac mini M2 本地执行标准化发布流水线：
```bash
# 在 Mac mini M2 本地执行
cd /Users/hi/niuma/projects/rawxiaojiucai
./deploy.sh "commit 提交信息"
```
执行链路：
- Mac M2 本地极速构建（`npm run build`，耗时约 3 秒，彻底解放 J3710 算力）；
- 自动双重预压缩：`brotli -q 9` 与 `gzip -9` 生成 `.br` 与 `.gz` 产物；
- Git 自动提交并推送到 GitHub 远端；
- SSH 远程触发 J3710 (`192.168.1.182`) `/home/a/dapp/rawxiaojiucai` 执行 `git pull`；
- `rsync -avz --delete dist/` 零编译原子推流预压缩产物至生产机；
- 远程执行 `sudo nginx -t && sudo systemctl reload nginx` 完成无感平滑上线。

### 3. XGBot 本地微服务排查与维护
```bash
# 查看微服务状态与内存占用 (严禁超 100M)
systemctl status dapp_xgbot.service --no-pager
# 查看实时日志
journalctl -u dapp_xgbot.service -n 50 --no-pager
# 重启微服务
sudo systemctl restart dapp_xgbot.service
# 验证健康接口
curl -s http://127.0.0.1:8095/health
```

### 4. TON 合约与配置定点
- TON 名人堂合约路径: `/home/a/dapp/rawxiaojiucai/mingrentangheyue/`
- Web3 与俱乐部全局常量: `/home/a/dapp/rawxiaojiucai/constants.ts`

## 代码架构与工程标准
1. **纯 TON 架构规范**: 严禁引入任何以太坊、EVM 或 L2 冗余依赖与 RPC 探针，保持 Telegram 原生 Web3 的极致轻量。
2. **多小文件解耦标准 (严格 <250 行)**: 名人堂模块强制采用多小文件解耦架构（组件库集中于 `components/club/`），所有 TS/TSX 文件单一职责且必须严格控制在 250 行以内，杜绝单文件巨兽。
3. **Web3 SDK 懒加载与 Vite 构建分包标准 (Web3 Lazy-Load & Bundle Standard)**:
   - Web3 依赖解耦：将 `@tonconnect/ui-react`（1.2MB+）彻底从入口 `index.tsx` 中剥离，封装为独立的异步懒加载包装组件（`TonConnectWrapper.tsx`），仅在用户主动进入名人堂或 VIP 通行证时异步加载；
   - 首屏预载拦截：在 `vite.config.ts` 中配置 `modulePreload.resolveDependencies`，彻底排除 `ton-connect` 依赖，确保首页训练首包静态 JS 压缩后（Brotli）严格控制在 50KB~60KB 极低水位；
   - 依赖分离：Rollup `manualChunks` 精准隔离 `@ton/core`、`@ton/ton` 与 `@tonconnect`；严禁向 `manualChunks` 中全量注册大图标包（如 `lucide-react`），优先依赖静态 Tree-shaking，防止 J3710 弱电平台构建超时。
4. **J3710 硬件能效预算规范**: `dapp_xgbot.service` 严格限制 `MemoryMax=100M` 熔断线，严禁在服务端运行重型计算或常驻无用服务。
5. **客户端边缘常驻与零服务端消耗规范**: 前端静态资产全面依赖客户端浏览器与 Service Worker 强缓存，服务端仅负责预压缩静态直发（Brotli/Gzip static）与接口反代。构建产物必须预先生成 `.br` 与 `.gz` 文件。
6. **强制本地代理通道**: TON RPC 与 Pinata API 请求必须走 `http://127.0.0.1:10809` 代理通道。
7. **打卡海报与身材秀专属二维码闭环规范 (Workout Proof & Club QR Standard)**:
   - **彻底剔除 AI 星星与零 Emoji**: 严禁海报出现任何 Emoji、四芒星、Gemini / Sparkles 图标或 AI 模板元素，代之以极简红点指示器或排版胶囊，保持硬核调性与零 AI 痕迹。
   - **多维自律打卡数据呈现**: 必须呈现「本月已练天数（THIS MONTH: X DAYS）」与「连续打卡天数（STREAK: Y DAYS）」及训练容量，结合本地 `xg_workout_history_v1` 实时计算，彻底摒除空洞单调排版，赋予用户强烈的自律成就感；
   - **全链路 8 国语言字典强同步**: `components/posterI18n.ts` 必须 100% 覆盖 8 语种对应字段（`monthTrained`、`streakTitle`、`totalTrained`、`daysUnit`、`verifiedAthleteBadge`、`myClubCardAction` 等）；
   - **用户身材秀条目双向智能寻址**: 用户连接钱包（Gram / TON）或提交身材打卡后，系统通过 `userClubCard.ts` 自动与链上审核通过的名人堂数据池（`hall_of_fame_cache`）进行地址标准化比对并持久化；
   - **已入驻战神专属定向码**: 命中已入驻条目时，二维码强制定向至个人卡片 `https://raw.xiaojiucai.pro/?tab=club&cardId=${card.hash}`，扫码行动号召升华为「**掃碼圍觀我的身材SHOW**」，顶部加盖「**双开门认证战神**」荣誉徽章，系统原生分享带专属直达链接；
   - **未入驻转化漏斗**: 未入驻用户默认指向官方入口，二维码旁明确引导：“入驻名人堂解锁专属个人主页码”，深度驱动用户连接钱包与投稿；
   - **受邀围观置顶与平滑定位**: 接收者扫描带有 `cardId` 的链接进站，`DoubleDoorClub.tsx` 与 `ClubMasonryList.tsx` 毫秒级感知并将该卡片置顶至首位，点亮「**专属受邀 · 好友身材秀**」金色流光光环，并平滑自动居中滚动，自媒体跳转与打赏一键直达。
   - **超清渲染与预载**: `html2canvas` 捕获倍率统一设置为 `scale: 3`（960px 宽度），前置等待 `document.fonts.ready`；二维码容错率锁定 `errorCorrectionLevel: 'M'`。
   - **多小文件架构定点**: 海报语言字典独立定点于 `components/posterI18n.ts`，主组件 `WorkoutPoster.tsx`，均严格遵守 <250 行规范。
8. **SafeIpfsImage 原生流式加载与多网关竞速降级规范 (Safe IPFS Streaming Standard)**:
   - 严禁使用 `fetch(blob) -> URL.createObjectURL` 将多张高清大图全量读入内存（避免低端设备内存暴涨与 OOM 闪退）；
   - 强制使用原生 `<img loading="lazy" decoding="async" crossOrigin="anonymous">` 流式渲染；
   - 建立 4 级网关降级链路：Pinata 专有网关 -> `dweb.link` -> `cloudflare-ipfs.com` -> `ipfs.io`，配置 4.5 秒看门狗自动竞速降级，并在模块内存中记录快速通道（`preferredGatewayIndex`）；
   - Service Worker 必须升级为 v3 架构，显式捕获并离线缓存跨域图片流（`response.type === 'opaque'`），实现身材照一次下载、永久离线秒开，彻底斩断重复海外流量与网关消耗。

9. **动作库单源配置与解剖学分类标准 (Exercise Anatomy Standard)**:
   - 动作库唯一定点：`/home/a/dapp/rawxiaojiucai/data/exercises/`，包含胸、背、肩、臂、臀、腿、核心及有氧 8 大模块，标准体量为 309 动大满贯（279 无氧 + 30 自重有氧）。
   - 绝对杜绝同义李鬼：严禁物理设备、使用姿态与受力轨迹 100% 相同的条目因换用同义词而重复建卡（如严禁踢腿与腿屈伸、臂屈伸与三头伸展、下压与压榨、反向飞鸟与后束飞鸟重合）。
   - 严禁解剖学错位：髋内收（Adduction）必须 100% 归属于大腿内侧肌群（Legs）；髋外展（Abduction）必须 100% 归属于臀中肌/臀小肌（Glutes），严禁交叉倒置。
   - 鼓励“无限可能”：单手 vs 双手、宽距 vs 窄距、不同把手配件（直杆/V柄/绳索）、不同站距角度等具有真实微观发力差异的变体动作全面鼓励并完整保留。
10. **三大平台教程分流与移动端原生 Scheme 跳出规范 (Tri-Platform Tutorial & Native Scheme Standard)**:
    - 针对国内用户 (`Language.ZH_CN`)：唯一主攻**抖音（Douyin）**。中文动作名称必须对接抖音顶级健身博主标准词条；搜索词严格构造为 `"${cleanZhName} 教程"`，通过 `snssdk1128://search?keyword=...` 极速调起，未安装则静默写入剪贴板。
    - 针对海外用户（外国语言环境）：双核心锁定 **YouTube 与 TikTok**。
      - 英文名称必须严格遵循国际健美通用标准术语（如 `Svend Press`、`Smith Machine Bulgarian Split Squat`、`Dip Machine`、`Cable Rear Delt Crossover`）；
      - **移动端原生 Scheme 纯净跳出（严禁弹 Web 网页与白屏）**：针对移动端（iOS / Android / PWA / 带壳 APK），YouTube 100% 采用系统原生 App Scheme（iOS 为 `youtube://results?search_query=${encodeURIComponent(query)}`，Android 为 `vnd.youtube://results?search_query=...`）；
      - **绝对禁止在移动端调用 `window.open` 或弹出多余 Web 标签页**，杜绝用户切回 DApp 时面对空白/超时的 YouTube 网页端；剪贴板复制采用后台非阻塞异步 Promise，绝不消耗用户手势激活凭据；
      - TikTok 搜索词：`${enName} form`，通过 `snssdk1233://search?keyword=...` 极速调起；
      - 桌面端（PC/Mac 浏览器）保留新标签页打开 Web 搜索，Telegram 环境走官方 `openLink`；
      - 前端卡片自适应：非中文简体环境下，自动隐藏中国版抖音按钮，自适应展示宽大版 3 列网格（`[部位] [YouTube] [TikTok]`），提升海外握持操作手感。
11. **动作卡片纯净规范 (Exercise Card Pure-Tutorial Standard)**:
    - 动作训练卡片严格锁定“极速教程交付”，**绝对严禁引入 Instagram（IG）**（IG 缺乏长尾动作教程聚合能力且有强制登录墙阻断），严防破坏 3/4 列黄金防误触网格；
    - Instagram、小红书等社媒矩阵唯一归口绑定于【双开门名人堂 (DoubleDoorClub)】，专注博主身材展示、个人主页引流与 TON 打赏沉淀。
12. **身材秀视觉纯净与虚假条目拦截规范 (DoubleDoorClub Visual Purity Standard)**:
    - **视觉纯净零冗余**: 身材秀卡片严禁在图片下方堆砌“复制/直达”胶囊按钮。图片右上角已集成紧凑的原生社媒跳转图标与手势复制，下方区域唯一保留宣言纯文本，维持瀑布流视效极致利落与纯粹。
    - **虚假内容双重拦截**: 对非本人、虚假、网图或 AI 伪造的上链条目实行零容忍。前端数据层（`useClubFeed.ts`）与列表渲染层（`ClubMasonryList.tsx`）必须配置严格的黑名单过滤（覆盖 UID、CID、platformId 与特征文本），且在读取 `localStorage` 缓存时同步清空过滤，杜绝虚假上链数据闪现或展示（如 Durov 虚假条目拦截）。
13. **Telegram/Gram 钱包绑定与链上会员卡动态验权规范 (Dynamic On-Chain NFT Verification Standard)**:
    - **三阶段生命周期闭环**:
      1. Gram 钱包登录与身材照提交：用户在 Telegram / Web 端连接 Gram 钱包并提交身材打卡照；管理员后台人工审核通过后，该身材卡片与该 Gram 钱包地址永久物理绑定；
      2. 链上动态验权（Hold-to-Earn / 持有即特权）：前端及链上探针通过 TonCenter NFT API 实时查询该 Gram 钱包地址是否持有官方 Club Pass 会员 NFT。只要持有，全网即刻点亮金色尊贵 VIP 动态流光边框并开启 100% 粉丝打赏直通；
      3. 资产转移即时失活（Revoke-on-Transfer）：一旦该 Gram 钱包地址内的 NFT 被转出或在二级市场售出，系统毫秒级感知失活，全网自动立即剥夺 VIP 徽标并关闭直通打赏通道，无静态身份残留。
    - **8 国语言与 UI 文案强同步**: 讲解说明（Card 3）及顶部 Badge 必须严格依照三阶段生命周期同步更新全语言文案（中简、中繁、中港、英、日、韩、俄、越），徽标固定为「`NFT 动态验权 · 全球打赏` / `持有点亮特权 · 转移即时失活`」。
14. **讲解说明单屏无滑动与视觉去 Google 化规范 (AboutModal No-Scroll Standard)**:
    - **彻底废除 Google 元素**: 严禁在讲解弹窗（`AboutModal.tsx`）及海报中出现任何 Google 四角星（`Sparkles`）或 AI 模板元素，全面改用健身专属活力火苗（`Flame`）徽标；
    - **单屏无滑动严苛规范**: 顶部插画/图案高度严格压制（从 240px 缩减至 96px 以内，`h-24`），弹窗容器采用自适应高度（`h-[74vh] max-h-[600px]`），配合紧凑微排版（标题 `text-lg`、正文 `text-[12.5px] sm:text-[13px]`、上下内边距 `py-3` / `p-4`），确保移动端及小屏设备 100% 单屏完整呈现，彻底杜绝下拉滚动条。
15. **首屏 0ms 零遮罩秒开与自媒体原生 Scheme 调度规范 (Zero-Loader 0ms Standard)**:
    - **彻底物理拔除开屏层**: `index.html` 与 `index.tsx` 彻底物理拔除 `#initial-loader` 遮罩、Logo 呼吸动画及所有定时器；首屏直出曜石黑底色与无氧力量训练组件，零遮罩、零延时，实现原生 App 级 0ms 极速直开；
    - **身材秀全平台自媒体原生 Scheme 纯净跳出**: 名人堂身材秀（DoubleDoorClub）卡片右上角全部自媒体链接（TikTok、Instagram、YouTube、抖音、小红书、Telegram）以及入驻申请测试链接，**100% 物理剔除 `<a target="_blank">` 与 Web 网页跳转**；移动端统一调用 `launchCreatorSocialApp`，直接调起对应客户端协议，绝不在移动端打开多余 Web 标签页，彻底消灭切回 DApp 时的白屏网页端；
    - **全域 ErrorBoundary 熔断防护**: `index.tsx` 顶层常驻 `GlobalErrorBoundary`，全域拦截任何未捕获异常，彻底消灭全白死屏并提供一键刷新恢复通道。
16. **移动端添加至主屏幕与桌面安装引导规范 (PwaInstallPrompt Standard)**:
    - **组件唯一定点**: `/home/a/dapp/rawxiaojiucai/components/PwaInstallPrompt.tsx`，必须平级挂载于 `App.tsx` 根状态，与 `MainHeader.tsx` 右上角下载按钮全局事件（`open-pwa-install`）无缝联动；
    - **全环境智能嗅探**: 独立运行模式（PWA Standalone 或 Capacitor 原生壳）100% 静默无感，桌面端默认不骚扰；
    - **防疲劳自然冷却**: 移动端浏览器采用 24 小时自然冷却与会话级关闭记忆，避免重复弹窗打扰用户；
    - **智能唤醒与常驻浮标**: 移动端进入 6 秒或下滑超过 160px 优雅弹出；用户关闭后在右下角常驻精致紧凑的悬浮微标「**存至桌面**」，随时一键呼出；
    - **分端精准指引**:
      - iOS 原生 Safari：提供 Safari 分享 -> 添加到主屏幕 2 步极简图文教程与动态下跳箭头；
      - iOS 非 Safari（Chrome / Firefox 等）：明确 Apple 系统限制并提供【一键复制并在 Safari 打开】；
      - Android 移动端：提供 APK 直链高速下载与网页快捷方式双通道；
      - 社交应用内（微信 / TG 等）：引导在默认浏览器中打开；
    - **三大硬核亮点胶囊**: 【首屏秒开】·【全屏沉浸】·【离线速练】，坚守零 Emoji、零星星纯粹工业级调性。
17. **多小文件解耦与单文件严格 <250 行规范 (Small File Standard)**:
    - 全系统强制拆分为模块化解耦架构，严禁单文件巨石结构；单代码文件严格控制在 **250 行以内**，单一职责，从源头杜绝修改引发的隐蔽副作用；
    - `WorkoutPoster.tsx` (234行)、`DoubleDoorClub.tsx` (234行)、`PwaInstallPrompt.tsx` (234行)、`FeedItem.tsx` (235行)、`JoinForm.tsx` (234行)、`App.tsx` (242行) 等全工程所有文件必须严格受控于 250 行以内。

## 详细知识库定点
- 参考规范文档: `/home/a/wiki/skills/dapp_keeper.md`

