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
- **细狗工程唯一主定点**: `raw.xiaojiucai.pro` (本地: `/Users/hi/Documents/GitHub/rawxiaojiucai`, 远端: `/home/a/dapp/rawxiaojiucai/`)
- **双开门名人堂中央注册表 2.0 (HallOfFameRegistry 2.0)**:
  - **主网合约**: `EQDJQcb-1K6W7LCowAqTXvrYXHfdyVsRban8oQw9RrZntGka` (Tact 1.6 编写，支持 O(1) 链上点查与存证)
  - **董事长官方金库 / 合约Owner (Chairman & Platform Treasury)**: `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j` (Raw: `0:5b3ccf23508e5d7942b46669c196e7482f549404fae9a7a93e052c99ba452cb4`，接收 20% 分润抽水与合约最高权限)
  - **W5 自动化管理员**: `UQCqQVeGQ_90SBai5TjiuA0u-serd-IMg9luyeFeWRngHa8E`
  - **合约预置管理员 3 (imm.kimi 独立收款使用)**: `UQA-bYMHnnF1aJCstnDofa9vzMmnGgPuKe6YOgr7IilEDkZO`
  - **打赏分账标准**: 全栈统一遵循 `ton_tipping_protocol` 技能标准与组件资产
- **俱乐部会员卡主定点**: `club.xiaojiucai.pro` (本地: `/Users/hi/Documents/GitHub/clubxiaojiucai`)
- **俱乐部会员卡 TON 合约**: 
  - **V2 主合约**: `EQAOgV_jpZ6YK0ZypEp4oTgAa4T_QZafNN-Or0RSHs3S0Q3a` (全生命周期运营、AdminMint、暂停开关、动态元数据与防 Gas 抽水；已于 2026-10-06 通过 W5 钱包完成存量 23 枚 NFT 1:1 链上全量空投映射迁移，next_item_index: 23)
  - **V1 历史合约 (已正式退役)**: `EQA3amxHgmiMCBO5ijKij-mHxaJ_dxow-zbNnGEGkVXPlKRm` (历史 23 张存量卡已全部迁移完毕，全线业务已彻底下线弃用)
- **双开门名人堂组件库**: `/Users/hi/Documents/GitHub/rawxiaojiucai/components/club/`
- **用户身材秀嗅探与打卡统计工具**: `/Users/hi/Documents/GitHub/rawxiaojiucai/utils/userClubCard.ts`
- **移动端存手机与桌面引导**: `/Users/hi/Documents/GitHub/rawxiaojiucai/components/PwaInstallPrompt.tsx`
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
7. **双轨打赏分成与 NFT 动态 0% 费率闭环规范 (Dual-Track Tip & 0% Fee Standard)**: 
   - 创作者只要绑定有效收款钱包，即可开启链上打赏通道；
   - **普通创作者**: 粉丝打赏自动执行多跳分账（创作者实收 80%，平台生态服务费 20% 直达平台金库 `UQBbPM8j...`）；
   - **Club Pass NFT 持有者 (VIP)**: 尊享 100% 全额到账（0% 平台服务费）与金色黑曜石流光外观；
   - **纯游客模式 (无钱包)**: 仅作展示，不开放打赏通道；
   - 验权与缓存统一采用 `normalizeTonAddress` 转为小写 Raw Hex (`0:xxx`)，正向 7 天、负向 10 分钟双层冷热缓存及 In-flight 并发去重。标准实现详见 `ton_tipping_protocol`。
8. **移动端战神海报与二维码长按识别扫码标准 (Mobile Poster & 100% QR Code Recognition Standard)**:
   - 2K 海报离屏渲染 DOM 必须置于视口内不可见层 (`left: 0, top: 0, opacity: 0.01, zIndex: -100`)，严禁置于 `-9999px` 导致 WebKit 裁剪黑屏；
   - **取消胶囊，升级 3D 战神微浮雕排版**: 废除 `border-radius: 9999px` 与渐变胶囊背景，消除 html2canvas 导出时的圆角黑边锯齿、文字基线削顶及多语言排版撑爆；采用三层立体深度阴影与金色发光微光；
   - **二维码 100% 扫码识别与长按唤醒铁律**: 严禁给二维码图片加任何圆角（`borderRadius: 0`），保证左上、右上、左下三个核心定位寻象角标（Finder Patterns）几何完整；尺寸放大至 94px 以上，生成参数严格配置 `margin: 3`（3 模块纯白静区）与高容错率 `Q`（25% 容错）；预览弹窗 100% 异步挂载真实 `<img src="..." />` 并显式注入 `WebkitTouchCallout: 'default'`，彻底消除了点击缩略图展示 DOM `<div>` 导致手机端无法长按识别二维码的缺陷；
   - `URL.createObjectURL` 必须在选图替换、提交完成与组件卸载时成对调用 `URL.revokeObjectURL` 释放内存。
9. **TonConnect 移动端多钱包高可用规范 (TonConnect Multi-Wallet Standard)**:
   - 全生态 DApp（Club、细狗、人生运势历）必须在本地静态库中预置主流钱包元数据 (`includeWallets: LOCAL_WALLETS`)，严禁直接依赖易被阻断的 `raw.githubusercontent.com` 远程拉取；
   - 本地钱包元数据必须为所有插件/注入钱包配置完整的 `jsBridgeKey`（如 `bitgetTonWallet`, `binancew3w`, `tonkeeper` 等），严禁遗漏导致无法探测注入环境而强行降级为易断联的远端 SSE 桥接；
   - 币安 Web3 钱包必须配置原生协议 `deepLink: "bnc://app.binance.com/cedefi/ton-connect"`；
   - 严禁在 `walletsListConfiguration` 中使用无效参数（如 `walletsListUrl`），必须使用符合 SDK 类型的 `includeWallets`；
   - 页面必须提供显式解绑/断开通道（如【换钱包】按钮），杜绝因长连接 Session 锁定导致手机端只能拉起单一钱包（如 Tonkeeper）而无法切换 Telegram Wallet / OKX 等其他钱包；
   - 唤起钱包前严禁进行任何串行 RPC 查询阻塞，强制在本地 0ms 组装 BOC 消息载荷，并在 `sendTransaction` 中显式指定 `network: '-239'`，秒级呼起钱包；
   - **客户端双重广播保障 (Dual Broadcast Standard)**: 调起钱包签名拿到 `{ boc }` 后，严禁直接丢弃 BOC，前端必须通过自身高可用 RPC 节点池额外执行一次 `client.sendFile(Buffer.from(boc, 'base64'))`，彻底免疫 Bitget 等第三方多链钱包海外 RPC 丢包、超时未广播的陷阱；
   - **链上出块状态真闭环防假阳性标准 (Anti-False-Positive Confirmation Standard)**: 交易后轮询链上出块状态，必须以发起交易时的真实链上指标（如 `nextIdx` 或 `lt`）作为基准（Baseline）。严禁在轮询结束时无条件执行 `success`！未检测到出块变化时必须明确提示“链上确认超时/未广播”，严禁制造“未扣款却显示成功”的假阳性假象。
10. **TON 未激活未初始化账户打赏与防退回防 0.0000 缺陷标准 (Uninitialized Account Bounce & Anti-0.000 Standard)**:
    - **底层机理**: TON 公链中，未产生过交易且未部署合约的地址链上状态为 `nonexist`。若内部消息带有 `bounce: true`（退回标志），TVM 因目标账户无代码会自动触发 Bounce 退回，转账资金原路返回，仅扣除 Gas 费；
    - **钱包模拟缺陷**: Bitget 等多链钱包在 TonConnect 预览时，底层 SDK 将地址转换为 Raw 并默认设置 `bounce: true`。在 TVM 预执行模拟中，向未激活账户的转账全额退回，净转账额为 0，因此钱包弹窗中金额只显示预估 Gas 费（如 `0.0000几` TON），而已激活合约的创作者（如 `j_zzzi`）则正常显示 2 GRAM；
    - **治理与工程防线**:
      1. TonConnect `messages` 数组严格遵守白名单属性，**严禁添加 `bounce` 或 `network` 额外字段**（否则直接触发 TonConnect SDK index 0 schema 校验拦截崩溃）；
      2. 弹窗打开时探针静默检测收款地址链上状态，若为未激活 (`uninit`/`nonexist`)，前端即时展示警示横幅，解释 Bitget 钱包模拟显示为 `0.0000几` Gas 费的原理，建议使用 Tonkeeper / Telegram 钱包直充或由创作者向该地址转入测试激活。

## 核心操作 SOP

### 1. 细狗全栈健康巡检 (必须实测打靶)
```bash
/home/a/bin/dapp_health_probe.sh
```
探测项覆盖：TON 主网区块高度与延迟、Pinata 专有 IPFS 网关鉴权、XGBot 微服务 HTTP 心跳与内存监控、Nginx 8080/80 站点响应。

### 2. 细狗前端全球发布与审核微服务架构 (Cloudflare Pages + J3710 专线)
- **前端托管**: 全量托管于 Cloudflare Pages（全球 Anycast CDN 秒开，99.99% 金融级容灾），Mac 本地执行 `git push origin main` 即可触发云端自动化 15 秒编译上线。
- **发版前质量门禁 (必须 100% 通过方可发布)**:
```bash
# 1. 静态类型与未定义变量检查 (Vite 打包不会拦截未定义变量，必须依靠 tsc 门禁拦截！)
npx tsc --noEmit
# 2. 12 语种 206 键位完整性测试 (确保零缺失、零冗余)
npm run test:i18n
```
- **发布脚本**:
```bash
# 在 Mac mini M2 本地执行
cd /Users/hi/niuma/projects/rawxiaojiucai
./deploy.sh "commit 提交信息"
```
执行链路：
- Mac M2 本地通过 `npx tsc --noEmit` 与 `npm run test:i18n` 严密质检；
- Git 自动提交并推送到 GitHub 远端；
- Cloudflare Pages 自动感知并完成云端零延迟发布；
- **审核通道**: 182 仅需常驻 `dapp_xgbot.service` (8095 端口)，通过 Cloudflare Zero Trust Tunnel 专有主机名 `xgapi.xiaojiucai.pro` 接收 25MB 体态照大图并联动 Telegram 审核。免除 182 前端静态托管与频繁 rsync。

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
   - **严格 9:16 黄金竖屏规格**: 容器采用严格 9:16 纵向比例定点（`width: 720px, height: 1280px`，内嵌至 `WorkoutPosterCard.tsx`），通过 `html2canvas` (scale: 2) 导出 `1440x2560` 2K 视网膜超清竖屏，完全适配微信朋友圈、抖音、小红书、Instagram Stories 与 Telegram 满屏展示。
   - **胶囊与字体微米级对齐规范**: 所有状态胶囊（如「双开门认证战神」、「极致充血 · 巅峰状态」、「部位胶囊」、「做功量等价条」）统一采用明确固定高度（28px/38px/40px/44px）、`leading-none` 与 `rounded-full` 圆角；通过前置发光 CSS 脉冲圆点指示器（绿/琥珀色）替代任何原生 Emoji 图标，彻底剥离行高异常与基线偏移，确保文字与胶囊边框黄金对齐。
   - **彻底剔除 AI 星星与零 Emoji**: 严禁海报出现任何 Emoji、四芒星、Gemini / Sparkles 图标或 AI 模板元素，代之以极简硬件质感发光指示器与精工排版胶囊，保持纯粹硬核战神调性。
   - **多维自律打卡数据呈现**: 必须呈现「本月已练天数（THIS MONTH: X DAYS）」与「连续打卡天数（STREAK: Y DAYS）」及训练容量，结合本地 `xg_workout_history_v1` 实时计算，彻底摒除空洞单调排版，赋予用户强烈的自律成就感；
   - **全链路 12 国语言字典强同步与双向校验 (206 键全量覆盖)**: `src/i18n/locales/*.ts` 必须 100% 覆盖 12 语种（简中、繁中、港粤、英、日、韩、俄、越、西、葡、法、印尼），且通过 `npm run test:i18n` 自动化双向比对测试（206 个键位零缺失、零冗余）；`components/posterI18n.ts` 同步维护完整多语言海报词典；
   - **用户身材秀条目双向智能寻址**: 用户连接钱包（Gram / TON）或提交身材打卡后，系统通过 `userClubCard.ts` 自动与链上审核通过的名人堂数据池（`hall_of_fame_cache`）进行地址标准化比对并持久化；
   - **已入驻战神专属定向码**: 命中已入驻条目时，二维码强制定向至个人卡片 `https://raw.xiaojiucai.pro/?tab=club&cardId=${card.hash}`，扫码行动号召升华为「**掃碼圍觀我的身材SHOW**」，顶部加盖「**双开门认证战神**」荣誉徽章，系统原生分享带专属直达链接；
   - **未入驻转化漏斗**: 未入驻用户默认指向官方入口，二维码旁明确引导：“入驻名人堂解锁专属个人主页码”，深度驱动用户连接钱包与投稿；
   - **受邀围观置顶与平滑定位**: 接收者扫描带有 `cardId` 的链接进站，`DoubleDoorClub.tsx` 与 `ClubMasonryList.tsx` 毫秒级感知并将该卡片置顶至首位，点亮「**专属受邀 · 好友身材秀**」金色流光光环，并平滑自动居中滚动，自媒体跳转与打赏一键直达。
   - **超清渲染与预载**: `html2canvas` 捕获倍率统一设置为 `scale: 2`（1440x2560 视网膜超清），前置等待 `document.fonts.ready`；二维码容错率锁定 `errorCorrectionLevel: 'M'`。
   - **多小文件架构定点**: 海报语言字典独立定点于 `components/posterI18n.ts`，主组件 `WorkoutPoster.tsx`，海报卡片 `WorkoutPosterCard.tsx`，均严格遵守 <250 行规范。
8. **SafeIpfsImage 原生流式加载与多网关竞速降级规范 (Safe IPFS Streaming Standard)**:
   - 严禁使用 `fetch(blob) -> URL.createObjectURL` 将多张高清大图全量读入内存（避免低端设备内存暴涨与 OOM 闪退）；
   - 强制使用原生 `<img loading="lazy" decoding="async" crossOrigin="anonymous">` 流式渲染；
   - 建立 4 级网关降级链路：Pinata 专有网关 -> `dweb.link` -> `cloudflare-ipfs.com` -> `ipfs.io`，配置 4.5 秒看门狗自动竞速降级，并在模块内存中记录快速通道（`preferredGatewayIndex`）；
   - Service Worker 必须升级为 v3 架构，显式捕获并离线缓存跨域图片流（`response.type === 'opaque'`），实现身材照一次下载、永久离线秒开，彻底斩断重复海外流量与网关消耗。

9. **动作库单源配置与解剖学分类标准 (Exercise Anatomy Standard)**:
   - 动作库唯一定点：`/home/a/dapp/rawxiaojiucai/data/exercises/`（本地 Mac 为 `/Users/hi/niuma/projects/rawxiaojiucai/data/exercises/`），包含胸、背、肩、臂、臀、腿、核心及有氧 8 大模块，标准体量为 **330 动大满贯（整整 300 个无氧经典与高收益变式 + 30 个自重有氧）**。
   - **7 大无氧肌群 300 动作权威分布**：
     - **胸部 (Chest)**: 47 个（增补：吉隆达双杠臂屈伸、地板卧推、六角哑铃挤压推）
     - **背部 (Back)**: 46 个（增补：米道斯地雷架划船、海豹划船、吉尔索俯斜耸肩）
     - **肩部 (Shoulders)**: 45 个（增补：吕小军大平举、埃及式绳索侧平举、Y字俯斜平举）
     - **手臂 (Arms)**: 44 个（增补：蜘蛛弯举、泰特推举、佐特曼弯举）
     - **腿部 (Legs)**: 46 个（增补：西斯深蹲、北欧腘绳肌弯举、哥萨克深蹲）
     - **臀部 (Glutes)**: 40 个（增补：青蛙泵感臀桥、地雷架单腿硬拉、消防栓式侧抬腿）
     - **核心 (Core)**: 32 个（增补：李小龙龙旗、帕洛夫抗旋转推、古典真空腹内缩）
   - **全矩阵 12 语种支持**：每个动作与全站 i18n 体系必须完整适配 12 国语言字典（简中、繁中、港澳粤语、英文、日文、韩文、俄文、越南语、西班牙语、葡萄牙语、法语、印尼语）及准确器材属性（Barbell / Dumbbell / Cable / Machine / Bodyweight / Smith Machine）。
   - **绝对杜绝同义李鬼**：严禁物理设备、使用姿态与受力轨迹 100% 相同的条目因换用同义词而重复建卡（如严禁踢腿与腿屈伸、臂屈伸与三头伸展、下压与压榨、反向飞鸟与后束飞鸟重合）。
   - **严禁解剖学错位**：髋内收（Adduction）必须 100% 归属于大腿内侧肌群（Legs）；髋外展（Abduction）必须 100% 归属于臀中肌/臀小肌（Glutes），严禁交叉倒置。
   - **鼓励解剖学生物力学进阶变体**：单手 vs 双手、宽距 vs 窄距、地雷架圆弧力矩、自重离心抗阻（北欧弯举/西斯深蹲/龙旗）、深层腹横肌真空吸附等具有显著发力孤立差异的高收益动作全面规范入库。
10. **动作教程按地域精准分流与 3 平台自适应网格规范 (Regional 3-Platform Tutorial Standard)**:
    - **4 列 Bento 极简网格定点 (`ExerciseCard.tsx`)**：卡片顶部固定为 `[部位徽章] + [平台1] + [平台2] + [平台3]` 四列黄金网格，单行绝不折行，各语言严格锁定 3 个最高品质平台。
    - **🇨🇳 大陆简体中文版 (`currentLang === Language.ZH_CN`)**：
      - **[部位徽章]**：红色发光微凸胶囊，动态提取训练部位；
      - **抖音 (Douyin)**：品牌青色音符 (`snssdk1128://search?keyword=${encodeURIComponent(query)}`)，关键词为 `${fullExerciseKeyword} 教学`；
      - **小红书 (Xiaohongshu)**：薯红微胶囊书本图标 (`xhsdiscover://search/result?keyword=${encodeURIComponent(query)}`)，关键词为 `${fullExerciseKeyword} 动作教学`，直达高质感博主图文与精细拆解；
      - **Ins (Instagram)**：粉色相机图标，直达国际顶级身材美学标签。
    - **🌍 海外与全语言版 (`en`, `zh_tw`, `zh_hk`, `ja`, `ko`, `ru`, `vi`, `es`, `pt`, `fr`, `id`)**：
      - **[部位徽章]**：对应语种部位名称；
      - **YouTube**：经典红色播放标 (`youtube://results?search_query=${encodeURIComponent(query)}`)；
      - **TikTok**：霓虹粉音符 (`snssdk1233://search?keyword=${encodeURIComponent(query)}`)；
      - **Instagram (Ins)**：粉色相机图标，直达健美动作 Reels 与 Explore 标签。
    - **Instagram 动作标签直达与剪贴板自动复制闭环 (Instagram Tag Deep Link Protocol)**：
      - 由于 Instagram 缺乏通用关键词全文搜索 Scheme，采用智能动作标签推导算法：提取动作标准英文名称并清理为纯净字母标签 `cleanTag`（如 `#benchpress`、`#squat`、`#latpulldown`）；
      - 移动端 App Scheme 采用 `instagram://tag?name=${encodeURIComponent(cleanTag)}`，Web/PC 降级采用 `https://www.instagram.com/explore/tags/${encodeURIComponent(cleanTag)}/`；
      - 触发时自动将动作名安全复制至剪贴板，并弹出轻提示（如「已复制动作名，已为您直达 Ins #tag！」），兼顾即时探索与手动微调。
    - **低质平台绝对物理隔离原则**: 严禁引入快手（调性不符、破坏品牌质感）、B站（15分钟长视频不符合组间60秒即时指引需求）或 Google Video（零社交审美属性）。
11. **训练卡教程与名人堂社媒双轨独立规范 (Tutorial vs Club Social Independence Standard)**:
    - **动作训练卡片**：唯一服务于即时动作标准纠错，严格按 10 规约分流 3 平台；
    - **双开门名人堂 (DoubleDoorClub)**：创作者个人名片与主页链接继续保持 100% 全球化互通（覆盖 TikTok、Instagram、YouTube、抖音、小红书、Telegram 等），绝不受单卡教程语言分流限制。
12. **身材秀视觉纯净与虚假条目拦截规范 (DoubleDoorClub Visual Purity Standard)**:
    - **视觉纯净零冗余**: 身材秀卡片严禁在图片下方堆砌“复制/直达”胶囊按钮。图片右上角已集成紧凑的原生社媒跳转图标与手势复制，下方区域唯一保留宣言纯文本，维持瀑布流视效极致利落与纯粹。
    - **虚假内容双重拦截**: 对非本人、虚假、网图或 AI 伪造的上链条目实行零容忍。前端数据层（`useClubFeed.ts`）与列表渲染层（`ClubMasonryList.tsx`）必须配置严格的黑名单过滤（覆盖 UID、CID、platformId 与特征文本），且在读取 `localStorage` 缓存时同步清空过滤，杜绝虚假上链数据闪现或展示（如 Durov 虚假条目拦截）。
13. **Telegram/Gram 钱包绑定与链上会员卡动态验权规范 (Dynamic On-Chain NFT Verification Standard)**:
    - **三阶段生命周期闭环**:
      1. Gram 钱包登录与身材照提交：用户在 Telegram / Web 端连接 Gram 钱包并提交身材打卡照；管理员后台人工审核通过后，该身材卡片与该 Gram 钱包地址永久物理绑定；
      2. 链上动态验权（Hold-to-Earn / 持有即特权）：前端及链上探针通过 TonCenter NFT API 实时查询该 Gram 钱包地址是否持有官方 Club Pass 会员 NFT。只要持有，全网即刻点亮金色尊贵 VIP 动态流光边框并开启 100% 粉丝打赏直通；
      3. 资产转移即时失活（Revoke-on-Transfer）：一旦该 Gram 钱包地址内的 NFT 被转出或在二级市场售出，系统毫秒级感知失活，全网自动立即剥夺 VIP 徽标并关闭直通打赏通道，无静态身份残留。
    - **12 国语言与 UI 文案强同步**: 讲解说明（Card 3）及顶部 Badge 必须严格依照三阶段生命周期同步更新 12 国全语言文案（中简、中繁、中港、英、日、韩、俄、越、西、葡、法、印尼），徽标固定为「`NFT 动态验权 · 全球打赏` / `持有点亮特权 · 转移即时失活`」。
14. **双通道高转化钱包引导规范 (Dual-Channel Wallet Onboarding Standard)**:
    - **彻底剔除币安 Web3 钱包**: 移除无引流收益与返佣机制的 Binance Web3 Wallet，消除非付费用户流失黑洞；
    - **PM 级双通道架构定点 (`TonTutorialModal.tsx`)**:
      - **通道一（Telegram 0 下载秒开通道）**：TG 内置钱包 `@wallet`，面向 Telegram Mini App 用户，免下载、免切端，一键就绪；
      - **通道二（独立 App 官方首推通道）**：Bitget Wallet，支持 Web2 邮箱 MPC 登录彻底打破助记词心理防线，官方链接 100% 附带命主专属邀请码（`KeNw3s` / `inviteCode=KeNw3s`），实现独立流量变现闭环；
      - **安全与助记词指南**：保留防诈安全卡片，共 3 张精简卡片，纯粹克制，单文件严格控制在 216 行。
15. **顶部 Header 差异化国际化品牌定调 (Differentiated Global Header Standard)**:
    - `MainHeader.tsx` 针对用户语言动态分流：
      - **中文语系 (`zh_cn`, `zh_tw`, `zh_hk`)**：采用中英双行呈现（“你是细狗 / 你是細狗” + “YOU ARE SCRAWNY”）；
      - **其余 9 大国际语种 (`en`, `ja`, `ko`, `ru`, `vi`, `es`, `pt`, `fr`, `id`)**：统一仅展示高品质英文品牌名称（“YOU ARE SCRAWNY”），杜绝海外非中文用户面对汉字产生理解壁垒与违和感，树立国际顶级健身工具调性。
16. **讲解说明单屏无滑动与视觉去 Google 化规范 (AboutModal No-Scroll Standard)**:
    - **彻底废除 Google 元素**: 严禁在讲解弹窗（`AboutModal.tsx`）及海报中出现任何 Google 四角星（`Sparkles`）或 AI 模板元素，全面改用健身专属活力火苗（`Flame`）徽标；
    - **单屏无滑动严苛规范**: 顶部插画/图案高度严格压制（从 240px 缩减至 96px 以内，`h-24`），弹窗容器采用自适应高度（`h-[74vh] max-h-[600px]`），配合紧凑微排版（标题 `text-lg`、正文 `text-[12.5px] sm:text-[13px]`、上下内边距 `py-3` / `p-4`），确保移动端及小屏设备 100% 单屏完整呈现，彻底杜绝下拉滚动条。
17. **首屏 0ms 零遮罩秒开与自媒体原生 Scheme 调度规范 (Zero-Loader 0ms Standard)**:
    - **彻底物理拔除开屏层**: `index.html` 与 `index.tsx` 彻底物理拔除 `#initial-loader` 遮罩、Logo 呼吸动画及所有定时器；首屏直出曜石黑底色与无氧力量训练组件，零遮罩、零延时，实现原生 App 级 0ms 极速直开；
    - **身材秀全平台自媒体原生 Scheme 纯净跳出**: 名人堂身材秀（DoubleDoorClub）卡片右上角全部自媒体链接（TikTok、Instagram、YouTube、抖音、小红书、Telegram）以及入驻申请测试链接，**100% 物理剔除 `<a target="_blank">` 与 Web 网页跳转**；移动端统一调用 `launchCreatorSocialApp`，直接调起对应客户端协议，绝不在移动端打开多余 Web 标签页，彻底消灭切回 DApp 时的白屏网页端；
    - **全域 ErrorBoundary 熔断防护**: `index.tsx` 顶层常驻 `GlobalErrorBoundary`，全域拦截任何未捕获异常，彻底消灭全白死屏并提供一键刷新恢复通道。
18. **移动端存桌面与 Telegram Mini App 双模适配规范 (PWA & Telegram Mini App Dual-Mode Standard)**:
    - **组件唯一定点**: `/Users/hi/Documents/GitHub/rawxiaojiucai/components/PwaInstallPrompt.tsx`，必须平级挂载于 `App.tsx` 根状态，与 `MainHeader.tsx` 右上角下载按钮全局事件（`open-pwa-install`）无缝联动；
    - **Telegram Mini App 原生运行环境**: 通过 `window.Telegram.WebApp.initData`、`TelegramWebviewProxy` 或 `tgWebApp` 严格检测。在 Telegram 小程序内，**100% 物理隐藏“存至桌面”浮标与弹窗**，彻底杜绝多余的安装干扰，维持原生小程序轻量感与无缝体验；
    - **Telegram 内置浏览器 (In-App Browser)**: 动态将右下角桌面引导浮标转化为 `[ ✈️ TG 小程序 ]`，弹窗呈现 Telegram Mini App 专属启动卡片，支持一键无感唤醒 `@rawscrawny_bot` 打开原生小程序；
    - **全环境智能嗅探**: 独立运行模式（PWA Standalone 或 Capacitor 原生壳）100% 静默无感，桌面端默认不骚扰；
    - **防疲劳自然冷却**: 移动端浏览器采用 24 小时自然冷却与会话级关闭记忆，避免重复弹窗打扰用户；
    - **智能唤醒与常驻浮标**: 移动端进入 6 秒或下滑超过 160px 优雅弹出；用户关闭后在右下角常驻精致紧凑的悬浮微标「**存至桌面**」，随时一键呼出；
    - **分端精准指引**:
      - iOS 原生 Safari：提供 Safari 分享 -> 添加到主屏幕 2 步极简图文教程与动态下跳箭头；
      - iOS 非 Safari（Chrome / Firefox 等）：明确 Apple 系统限制并提供【一键复制并在 Safari 打开】；
      - Android 移动端：提供 APK 直链高速下载与网页快捷方式双通道；
      - 社交应用内（微信 / TG 等）：引导在默认浏览器中打开或直跳小程序；
    - **三大硬核亮点胶囊**: 【首屏秒开】·【全屏沉浸】·【离线速练】，坚守零 Emoji、零星星纯粹工业级调性。
19. **多小文件解耦与单文件严格 <250 行规范 (Small File Standard)**:
    - 全系统强制拆分为模块化解耦架构，严禁单文件巨石结构；单代码文件严格控制在 **250 行以内**，单一职责，从源头杜绝修改引发的隐蔽副作用；
    - 创作者社媒调度解耦为 `utils/creatorSocialLauncher.ts`（108行），动作教程调度为 `utils/socialLauncher.ts`（216行），钱包教程弹窗解耦为 `TonTutorialModal.tsx`（216行）；
    - `WorkoutPoster.tsx` (200行)、`WorkoutPosterCard.tsx` (149行)、`PosterMuscleFigure.tsx` (139行)、`posterHelpers.ts` (143行)、`DoubleDoorClub.tsx` (234行)、`PwaInstallPrompt.tsx` (234行)、`FeedItem.tsx` (235行)、`JoinForm.tsx` (234行)、`App.tsx` (242行) 等全工程所有文件必须严格受控于 250 行以内。
20. **移动端 History 栈防死锁与 Popstate 看门狗规范 (History Stack Anti-Desync Standard)**:
    - 针对移动端浏览器与 Android PWA 的侧滑返回手势，根状态 `App.tsx` 挂载 `history.pushState` 时，强制执行单状态守卫：
      ```typescript
      if (!window.history.state?.xgAppModalOpen) {
        window.history.pushState({ xgAppModalOpen: true }, '');
      }
      ```
    - 杜绝多层模态框相互切换时反复压栈导致的历史记录爆炸，防止 Android 物理返回键卡死或关闭弹窗后无法退出的严重体验缺陷。
21. **2K Retina 战神海报与 12 国语言矩阵规范 (2K Retina 12-Language Poster Standard)**:
    - **纯净单语种隔离**: 12 语言矩阵（中简、中繁、中港、英、日、韩、俄、越、西、葡、法、印尼）严格执行 100% 纯净语言隔离。英文环境 100% 全英文，中文环境 100% 全中文，彻底消灭中英文夹杂混排；
    - **超大字号移动端直读**: 彻底消灭移动端小字难读痛点。核心吞铁总做功与连续打卡采用 52px Oswald 巨型数字，战力评级 38px，主战斗标题 30px，状态徽标 16px，二维码 110px 配备琥珀金立体外框，社交媒体手机端开图秒读；
    - **动态多部位感知与解剖图发光**: `getTrainedParts` 自动提取当日训练所有部位（如“腿部 + 臀部” / "LEGS + GLUTES"），解剖图 SVG (`PosterMuscleFigure.tsx`) 精确按部位组合点亮对应肌群（股四头肌/腘绳肌发光赤红，臀大肌发光琥珀金，上肢/胸肌/背肌按需高亮）；
    - **底栏 Web3 品牌宣发**: 严格固定为「`官方链上永久存证 · 无国界0抽水社交打赏`」/ 「`ON-CHAIN PERMANENT PROOF · ZERO-FEE GLOBAL SOCIAL TIPPING`」；
    - **单行不折断与多小文件解耦**: 标题与部位标签强制 `white-space: nowrap` 消除孤字断行。海报模块严格解耦为 `WorkoutPoster.tsx`、`WorkoutPosterCard.tsx`、`PosterMuscleFigure.tsx`、`posterHelpers.ts`、`posterI18n.ts` 五个小文件，全文件均严格控制在 250 行以内。
22. **小韭菜俱乐部会员卡 (XiaoJiucaiClub) V2 升级、跨 DApp 鉴权与 Cloudflare 运维规范**:
    - **V2 核心升级**: 主网合约定点为 `EQAOgV_jpZ6YK0ZypEp4oTgAa4T_QZafNN-Or0RSHs3S0Q3a`，具备管理员免费空投（AdminMint）、紧急暂停（pause）、动态元数据热更、弹性分红与 nativeReserve 深度防 Gas 抽水机制；
    - **双合约优雅回退 (V2 Primary + V1 Fallback)**：全矩阵 DApp（`club.xiaojiucai.pro`、`obs.xiaojiucai.pro`、`raw.xiaojiucai.pro`）统一升级为优先查询 V2，未命中时自动平滑回退查询 V1 (`EQA3amxHgmiMCBO5ijKij-mHxaJ_dxow-zbNnGEGkVXPlKRm`)，确保迁移期 23 张历史老卡权益零中断；
    - **V1 资产快照与空投就绪**：已对 V1 历史 23 张存量 NFT 完成持仓地址快照；V1 合约因未实现提取与代码热更接口导致 0.95 TON 滞留，管理员提现 TON 到账后执行批量 AdminMint 空投脚本补发；
    - **展示基数归零**: 俱乐部进度条由写死的 23 调整为链上动态实时读取（初始回退为 0），真实反映 V2 铸造生态；
    - **Cloudflare Workers Static Assets 全球秒级发布**: 3 大前端均构建于 Cloudflare Workers 与 Static Assets，推送 Git 后自动编译上线，配合 API 触发 Anycast 边缘缓存 Purge 实现全网零缓存延迟。
23. **模态弹窗显式受控条件挂载与 ErrorBoundary 防死锁规范 (Strict Conditional Modal Mounting Standard)**:
    - **崩溃根因与血泪教训**: 以 `TipModal` 崩溃为例，组件内曾因漏写 `import { toNano } from '@ton/core'` 产生 `ReferenceError: toNano is not defined`。若弹窗在父容器（如 `DoubleDoorClub.tsx`）中无条件挂载（即使内部有 `if (!isOpen) return null;`），React 仍会在初次渲染时解析其模块引用与部分顶层逻辑；若外部包裹了 `ModalErrorBoundary`，该边界会在后台静默捕获该异常并将全局错误兜底界面（“打赏通道维护中”）渲染出来，直接死锁全屏，导致任何用户进站或点击任何卡片均被全屏遮罩强行拦截。
    - **法定显式短路挂载范式**: 所有全局弹窗组件（`TipModal`、`ContactOptionsModal`、`ClubLightbox` 等）在挂载点**必须采用显式布尔短路条件渲染**：
      ```tsx
      {showTipModal && (
        <ModalErrorBoundary t={t} onClose={() => setShowTipModal(false)}>
          <TipModal
            isOpen={showTipModal}
            creator={selectedCreator}
            onClose={() => setShowTipModal(false)}
            // ...
          />
        </ModalErrorBoundary>
      )}
      ```
    - **零后台执行**: 弹窗未打开时，彻底禁止挂载其组件树与 ErrorBoundary，确保后台零执行、零副作用、零异常冒泡。
24. **发版前质量门禁与本地双工程同步规范 (Pre-Deploy Quality Gate & Dual-Repo Standard)**:
    - **Vite 盲区与 TypeScript 语法门禁**: Vite 构建（`npm run build`）依赖 esbuild，只执行极速语法转译，绝不进行深度类型与未定义变量校验，缺少 `import` 也会照常打包通过。**发版前必须在 Mac 本地强制执行 `npx tsc --noEmit`，确保 0 错误（0 errors）**，严防未声明变量流向生产。
    - **12 国语言 206 键位自动化完整性门禁**: 必须执行 `npm run test:i18n`，确保 12 国语言字典（中简、中繁、中港、英、日、韩、俄、越、西、葡、法、印尼）206 个键位零缺失、零冗余、双向对齐通过。
    - **本地双工作区物理同步铁律**: 本地代码定点存在于 `/Users/hi/Documents/GitHub/rawxiaojiucai` 与 `/Users/hi/niuma/projects/rawxiaojiucai`。修改或部署后必须确保两处工作区 git 同步，严禁单向修改导致分支漂移或覆盖。
    - **单文件严格 `<= 250 行` 绝对红线**: 全系统所有 TS/TSX 组件与工具模块严格受控于 250 行以内，从物理结构上消除巨石文件隐蔽副作用。
25. **海报多端视口居中与绝对坐标定位规范 (Poster Centering & CSS Transform Alignment Standard)**:
    - **预览偏移根因**: 在固定小视口（如 340x604）缩放预览大画布（720x1280）时，外层容器严禁使用 `flex items-center justify-center` 搭配子元素 `transform: scale(0.472222); transformOrigin: top left`。Flexbox 会在 CSS 变换前将 720x1280 子元素相对小容器居中布局（top-left 被推移至 `(-190px, -338px)`）；而 `transform` 从该负坐标原点缩放，导致整个海报画面向左上方大范围偏移，在 `overflow: hidden` 视口中惨遭截断，用户只能看到右下角。
    - **法定正确定位范式**: 外层声明具体像素尺寸（如 `w-[340px] h-[604px]`）并设为 `position: relative`；内层 720x1280 画布强制采用 `position: absolute; top: 0; left: 0; width: 720px; height: 1280px; transform: scale(0.472222); transformOrigin: top left;`，将左上角严格锚定在 `(0, 0)`，杜绝 Flex 居中预推移。
    - **html2canvas 对身材背景图的渲染缺陷根治**: `html2canvas` 无法正确解析 `<img style="object-fit: cover" />`，会导致用户上传的超大实拍身材照无法居中铺满、只截取原图左上角。必须采用“双层渲染模式”：底层提供 `background-image` + `background-size: cover; background-position: center;`（供 `html2canvas` 完美铺满截取），上层 `<img />` 加注 `data-html2canvas-ignore="true"`（供真机 DOM 硬件加速渲染），并在 `html2canvas` 导出选项中显式注入 `x: 0, y: 0, scrollX: 0, scrollY: 0` 锁定视口零偏移。

26. **PWA 异步静默热重载与实拍照前端降采样规范 (PWA Background Revalidation & Client Photo Compression Standard)**:
    - **PWA 800ms Abort 陷阱防范**: 严禁在 Service Worker 导航请求中使用带有超时 abort 的请求覆盖缓存；必须采用无阻断后台网络 fetch，前台在弱网（>600ms）下立即呈现本地缓存壳，后台请求绝不断流，静默完成后写回 Cache Storage；
    - **发版自动递增 CACHE_NAME**: 发布脚本 `deploy.sh` 必须自动将 `CACHE_NAME` 注入当前构建时间戳或 commit hash，迫使客户端 Service Worker 触发更新周期与旧缓存废弃；
    - **实拍图客户端微压缩规范**: 用户上传海报实拍照片时，严禁使用原生 `FileReader.readAsDataURL` 直接将 10MB~20MB 原图塞入 React 状态与 DOM，必须先调用 `browser-image-compression` 压缩至 1440px / 350KB 以内，杜绝 iOS Safari 288MB 显存崩溃与 WebContent 进程闪退。

## 详细知识库定点
- 参考规范文档: `/Users/hi/niuma/wiki/你是细狗DApp全栈架构与动作库规范.md`
- 俱乐部白皮书: `/Users/hi/niuma/wiki/小韭菜俱乐部会员卡全栈架构与产品白皮书.md`


