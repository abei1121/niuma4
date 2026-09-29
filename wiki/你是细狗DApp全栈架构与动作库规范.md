# 《你是细狗》DApp 全栈架构与动作库规范

> **定位**：纯 TON 架构 Web3 力量健身社区、无氧 300 动作大满贯动作库与双开门名人堂（`raw.xiaojiucai.pro`）权威白皮书。  
> **适用终端**：Telegram Mini App (`@rawscrawny_bot`)、iOS PWA、Android 带壳应用与桌面端。

---

## 一、 产品定位与核心价值观 (Product Identity & Philosophy)

### 1. 硬核工业风与极客调性 (Dark Obsidian, Zero AI Fluff)
* **曜石玄黑底色**：全站坚守硬核黑曜石背景色，强化肌肉视觉冲击力与器械质感，杜绝轻浮花哨与低质配色。
* **零 AI 模板痕迹**：严禁出现任何 Google / Gemini 风格的四角星星（`<Sparkles />`）、AI 魔法棒或泛滥的 Emoji 符号，全面采用健身专属活力火苗（`<Flame />`）与工业级排版胶囊。
* **极度克制的产品边界**：彻底排除升级打怪、段位蜕变、虚拟签到等冗余游戏化负担，只保留纯粹的训练记录、动作索引与真实身材资产沉淀。

### 2. 彻底拒绝虚浮花哨计时器 (Strict Self-Discipline Law)
* **无倒计时器扰动**：所有动作卡片严格按工业标准呈现，每组目标设定为 60 次自觉完成，**严禁添加任何强制倒计时器**。
* **节奏交还训练者**：训练节奏因人因时而异，倒计时只会徒增低端机能耗与打乱呼吸律动。

### 3. 双开门名人堂与自媒体流量闭环 (Double Door Club)
* **专注身材资产与去中心化认同**：聚焦博主肌肉展示、真实自律打卡与社交媒体（小红书、抖音、TikTok、YouTube、Instagram）多向引流。
* **去伪存真**：对网图、非本人、AI 虚假条目实行严格的前后端双重黑名单过滤与物理拦截。

---

## 二、 无氧 300 动作大满贯与解剖学动作库架构 (The 300 Anaerobic Exercises Canon)

### 1. 7 大无氧肌群 300 动作权威矩阵
系统在胸、背、肩、臂、腿、臀、核心 7 大无氧肌群上，历经严格解剖学筛选与生物力学微调，达成 **整整 300 个无氧动作**（另附 30 个自重有氧动作，全库总计 330 动作大满贯）：

| 部位分类 | 英文标识 | 动作总数 | 核心器械覆盖 | 动作库定点文件 |
| :--- | :--- | :---: | :--- | :--- |
| **胸部** | Chest | **47** | 杠铃、哑铃、龙门架绳索、双杠自重、器械 | `data/exercises/chest.ts` |
| **背部** | Back | **46** | 杠铃、哑铃、高位下拉、T杠地雷架、引体自重 | `data/exercises/back.ts` |
| **肩部** | Shoulders | **45** | 哑铃、杠铃推举、绳索飞鸟、俯斜凳、自重倒立 | `data/exercises/shoulders.ts` |
| **手臂** | Arms | **44** | 曲杆、哑铃、绳索下压、牧师凳、俯卧斜凳 | `data/exercises/arms.ts` |
| **腿部** | Legs | **46** | 深蹲架、倒蹬机、哈克机、腿屈伸、自重离心抗阻 | `data/exercises/legs.ts` |
| **臀部** | Glutes | **40** | 专用臀推机、史密斯机、地雷架、绳索外展、自重跪姿 | `data/exercises/glutes.ts` |
| **核心** | Core | **32** | 龙门架抗旋转、平凳抗屈曲、真空吸附自重、健腹轮 | `data/exercises/core.ts` |
| **合计** | **Anaerobic** | **300** | **全矩阵多语言覆盖，杜绝同义李鬼，解剖学零错位** | `data/exercises/index.ts` |

### 2. 21 大解剖学进阶高收益变式条目与生理机制
针对进阶训练者与生物力学优化需求，动作库特设 21 个经典黄金变式：

1. **胸部 (Chest +3)**：
   - **吉隆达双杠臂屈伸 (Gironda Dips)**：宽握肘外展、含胸乌龟背，自重极致孤立胸肌下外沿撕裂拉伸。
   - **地板卧推 (Floor Press)**：大臂触地截断肌腱牵张反射，纯向心发力爆破推胸中段粘滞点。
   - **六角哑铃挤压推 (Hex Press)**：双铃死命对压内夹推起，胸肌中缝产生极限向心充血。
2. **背部 (Back +3)**：
   - **米道斯地雷架划船 (Meadows Row)**：地雷架过手单臂外展弧线力矩，上背与大圆肌爆发轰炸，下背腰椎零剪切。
   - **海豹划船 (Seal Row)**：高平凳俯卧悬空划船，100% 杜绝蹬地借力与下背代偿，纯粹孤立中背与背阔肌。
   - **吉尔索俯斜耸肩 (Kelso Shrug)**：直臂上斜俯卧纯靠肩胛骨后缩下沉，精准孤立中下斜方肌与菱形肌。
3. **肩部 (Shoulders +3)**：
   - **吕小军大平举 (Lu Raises)**：360度大圆弧直抵头顶，激惹中束并极大强化肩胛上回旋与肩峰灵活性。
   - **埃及式绳索侧平举 (Egyptian Lateral Raise)**：斜倾身体使拉力方向与侧束肌纤维完美平行，全行程零死点受力。
   - **Y字俯斜平举 (Incline Y-Raise)**：45度俯斜手臂呈30度Y字展臂，精准唤醒下斜方肌，矫正圆肩驼背神器。
4. **手臂 (Arms +3)**：
   - **蜘蛛弯举 (Spider Curl)**：上斜凳反面胸趴垂直悬空弯举，完全阻断晃动借力，二头肌短头顶峰极度痉挛。
   - **泰特推举 (Tate Press)**：平凳双铃胸前合拢外展屈肘伸展，力量举大师私藏的三头肌外侧头杀手锏。
   - **佐特曼弯举 (Zottman Curl)**：向心反握顶峰转腕180度正握超慢速离心下放，二头肌与前臂肱桡肌一箭双雕。
5. **腿部 (Legs +3)**：
   - **西斯深蹲 (Sissy Squat)**：膝关节前顶、躯干后仰成直线，自重极限拉长股直肌产生核爆级股四头肌泵感。
   - **北欧腘绳肌弯举 (Nordic Curl)**：固定脚踝膝关节离心下俯，后侧链力量之王，强化膝盖抗伤病黄金法则。
   - **哥萨克深蹲 (Cossack Squat)**：超宽站距全幅度单腿侧蹲，对侧腿伸直脚尖朝天，兼顾单腿力量与内收肌柔韧。
6. **臀部 (Glutes +3)**：
   - **青蛙泵感臀桥 (Frog Pumps)**：脚底相对膝外展呈青蛙腿，彻底关停大腿四头肌与腘绳肌代偿，专治臀肌失忆。
   - **地雷架单腿硬拉 (Landmine Single-Leg RDL)**：单臂持地雷架弧线轨迹大幅提高单腿稳定性，深层拉伸臀大肌与臀中肌。
   - **消防栓式侧抬腿 (Fire Hydrant)**：四足跪姿向侧上方90度抬腿，精准孤立臀中肌与上臀边缘，填平假胯宽凹陷。
7. **核心 (Core +3)**：
   - **李小龙龙旗 (Dragon Flag)**：仅以上背为唯一支点全身笔直升降，李小龙标志性绝技，核心抗屈曲终极试炼。
   - **帕洛夫抗旋转推 (Pallof Press)**：侧对绳索向胸前平推，身体静止抵抗侧向扭转，骨盆腰椎零剪切力的防伤深层核心动作。
   - **古典真空腹内缩 (Stomach Vacuum)**：排空肺部强力抽吸肚脐贴向脊柱，直接激活深层腹横肌，打造古典健美极致窄腰。

### 3. 全球化 8 语种字典无缝覆盖
每个动作必须完整配置 8 国语言字典：
- 简体中文 (`Language.ZH_CN`)
- 繁体中文 (`Language.ZH_TW`)
- 英文 (`Language.EN`)
- 日文 (`Language.JA`)
- 韩文 (`Language.KO`)
- 俄文 (`Language.RU`)
- 港澳粤语 (`Language.ZH_HK`)
- 越南语 (`Language.VI`)

### 4. 动态部位关键词自媒体精准教学跳出铁律 (Body Part Search Prefix Law)
* **痛点**：若仅用动作名称搜索，易搜索出同名歌曲、影视角色或模糊视频。
* **前置部位关键词铁律**：无论是调起原生 App Scheme 还是静默写入系统剪贴板，动作名称前**必须动态强制前置部位国际化名称**：
  - 中文抖音搜索：`"${bodyPartName} ${cleanZhName} 教程"`（如：`胸部 杠铃平板卧推 教程`、`背部 米道斯地雷架划船 教程`）
  - 英文 YouTube 搜索：`"${bodyPartName} ${enName} tutorial"`（如：`Chest Barbell Bench Press tutorial`）
  - TikTok 搜索：`"${bodyPartName} ${enName} form"`（如：`Chest Barbell Bench Press form`）
* **移动端零白屏跳出规范**：在 iOS / Android / PWA / 带壳 APK 环境下，YouTube 100% 采用系统原生 Scheme（`youtube://` / `vnd.youtube://`），**严禁在移动端弹窗使用 `window.open` 或弹出多余 Web 标签页**，杜绝用户切回 DApp 时面对空白卡死页面。

---

## 三、 Telegram Mini App 深度集成与全环境体验 (Telegram Mini App & PWA Architecture)

### 1. Telegram Mini App 环境物理静默规范
* **环境嗅探依据**：通过 `window.Telegram.WebApp.initData`、`window.TelegramWebviewProxy` 或 URL 中的 `tgWebApp` 字段精确识别。
* **物理隐藏存桌面**：在 Telegram Mini App 原生运行环境内，**100% 物理隐藏“存至桌面”悬浮按钮与弹窗**，彻底杜绝多余的安装引导干扰，保持原生小程序的轻量无感。

### 2. Telegram 内置浏览器 (In-App Browser) 智能转化
* **动态浮标切换**：当检测到用户在 Telegram 内置浏览器中打开 Web 页面时，右下角悬浮按钮自动转化为精致的 **`[ ✈️ TG 小程序 ]`**。
* **一键唤醒**：点击直接呼出 Telegram 小程序专属卡片，提供【一键开启 Telegram 小程序】快捷按钮，直达 `@rawscrawny_bot`，引导用户无缝流转至官方小程序。

### 3. 多端分流适配全景
* **iOS 原生 Safari**：提供极简 2 步图文引导（底部分享 -> 添加到主屏幕）。
* **iOS 第三方浏览器 (Chrome / Edge / Firefox)**：由于苹果系统权限限制无法直接添加，提供【一键复制并在 Safari 打开】快捷按钮。
* **Android 移动端**：提供标准 PWA 快捷方式引导与官方高速 APK 直链双通道。
* **独立运行模式 (Standalone / Capacitor 原生壳)**：100% 静默无感，桌面端默认不骚扰。

---

## 四、 纯 TON Web3 底座与动态会员验权 (Pure TON & Club Pass Dynamic Verification)

### 1. 彻底剥离 EVM / L2 冗余
* 专精于 TON (The Open Network) 公链生态，彻底剥离 ETH / EVM / L2 冗余依赖与 RPC 探针，保持 Telegram 原生 Web3 的极致轻量。

### 2. 三阶段生命周期闭环
1. **Gram 钱包登录与身材打卡提交**：用户连接 Gram / TON 钱包并提交打卡照；管理员后台人工审核通过后，该身材卡片与该 Gram 钱包地址永久物理绑定。
2. **链上动态验权 (Hold-to-Earn)**：前端及探针通过 TonCenter NFT API 实时查询该钱包地址是否持有官方 Club Pass 会员 NFT。只要持有，全网即刻点亮金色尊贵 VIP 动态流光边框并开启 100% 粉丝打赏直通通道。
3. **资产转移即时失活 (Revoke-on-Transfer)**：一旦会员 NFT 被转出或在二级市场售出，系统毫秒级感知失活，全网自动立即剥夺 VIP 徽标并关闭直通打赏通道，无静态身份残留。

### 3. 创作者扫码专属受邀置顶
* 已入驻名人堂的创作者专属打卡海报生成专属二维码：`https://raw.xiaojiucai.pro/?tab=club&cardId=${card.hash}`。
* 好友或粉丝扫码进站后，系统毫秒级感知并将该卡片置顶至首位，点亮「**专属受邀 · 好友身材秀**」金色流光光环，并平滑居中滚动，实现自媒体跳转与打赏一键直达。

---

## 五、 前端性能极限与 J3710 硬件零开销铁律 (Performance & Zero-Compute Law)

### 1. J3710 弱电硬件绝对零计算铁律
* **硬件防护**：生产服务器 Intel J3710 功耗仅 6W，**绝对严禁在 J3710 上执行任何 `npm run build`、`cargo build` 或重型计算**！
* **Mac mini M2 独揽 100% 编译算力**：所有静态检查、Vite 构建与预压缩 100% 必须在本地 Mac mini M2 完成。

### 2. 全量双重预压缩 (Brotli/Gzip) 零拷贝直发
* 本地构建完成后，自动对 `dist/` 内所有 `.js`、`.css`、`.html`、`.webmanifest` 产物并行执行 `brotli -q 9` 与 `gzip -9` 生成 `.br` 与 `.gz` 静态文件。
* rsync 原子推流至生产服务器后，Nginx 通过 `brotli_static on;` 与 `gzip_static on;` 实现纯内核零拷贝直接发送，彻底消除 Nginx 动态压缩的 CPU 开销。

### 3. Web3 SDK 异步懒加载分包
* 将庞大的 `@tonconnect/ui-react`（1.2MB+）彻底从首页入口剥离，封装为异步懒加载组件 `TonConnectWrapper.tsx`。
* `vite.config.ts` 拦截 `modulePreload`，确保首页首包 Brotli 压缩后严格控制在 **50KB~60KB** 极低水位，实现 **0ms 秒开**。

### 4. Safe IPFS 原生流式加载与 4 级网关降级
* 严禁使用 `fetch(blob) -> URL.createObjectURL` 将多张高清大图全量读入内存（避免低端设备 OOM 闪退）。
* 强制使用原生 `<img loading="lazy" decoding="async" crossOrigin="anonymous">` 流式渲染。
* 配置 4 级网关竞速降级：`Pinata 专有网关 -> dweb.link -> cloudflare-ipfs.com -> ipfs.io`，看门狗 4.5 秒自动降级。
* Service Worker 升级为 v3 架构，显式捕获并离线缓存跨域图片流（`opaque response`），实现身材照一次下载、永久离线秒开。

### 5. 全域小文件解耦架构 (严格单文件 <250 行)
* 全工程所有 TS/TSX 源代码文件强制解耦并严格控制在 **250 行以内**，单一职责，杜绝修改引发的隐蔽副作用。
* `index.tsx` 顶层常驻 `GlobalErrorBoundary`，全域拦截任何未捕获异常，彻底消灭全白死屏。

---

## 六、 自动化流水线与生产运维 SOP (DevOps SOP)

### 1. 唯一标准化本地发布命令
在 Mac mini M2 本地直接执行部署脚本：
```bash
cd /Users/hi/niuma/projects/rawxiaojiucai
./deploy.sh "feat: commit 提交信息"
```
流水线自动执行：
1. 本地代码 Rebase 拉取；
2. Mac M2 本地 Vite 极速构建打包与 Brotli / Gzip 预压缩（~4 秒）；
3. Git 自动提交并推送到 GitHub 远端；
4. `rsync -avz --delete dist/` 零编译原子同步至 J3710 生产目录 `/home/a/dapp/rawxiaojiucai/dist/`；
5. SSH 远程平滑重载 Nginx（`sudo nginx -t && sudo systemctl reload nginx`）。

### 2. XGBot 本地微服务运维
```bash
# 查看 XGBot 微服务运行状态 (严格限制 MemoryMax=100M)
ssh a@192.168.1.182 "systemctl status dapp_xgbot.service --no-pager"

# 查看最近日志
ssh a@192.168.1.182 "journalctl -u dapp_xgbot.service -n 50 --no-pager"

# 重启微服务
ssh a@192.168.1.182 "sudo systemctl restart dapp_xgbot.service"
```
