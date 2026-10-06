---
name: cloudflare_edge_ops
description: Cloudflare 全球 Anycast 边缘托管、Workers Static Assets 自动化发布、Zero Trust Tunnel 动态路由映射与 API 安全防御运维中枢。
triggers:
  - cloudflare_edge_ops
  - cf_deploy
  - cloudflare_tunnel
  - edge_assets
  - cf_waf_ops
---

# Cloudflare 边缘全栈与混合架构运维技能 (Cloudflare Edge Ops)

## 概述
小韭菜矩阵全项目法定统一架构标准：**Cloudflare 边缘静态托管 + 182 宿主机运算后端 (Hybrid Edge-Origin)**：
1. **边缘静态层 (Cloudflare Edge)**：全站前端 (Vite / React 19 / PWA) 部署在 Cloudflare 全球 Anycast 边缘网络（Workers Static Assets），享受全球 0 毫秒缓存直发，抗 DDoS 冲击并彻底免除 182 本地宽带上行消耗。
2. **本地计算层 (182 Host)**：核心算法、私有知识库、Rust 流式推演（8096 端口）、XGBot 审核服务（8095 端口）、爬虫情报生成（80 端口）100% 保留在 182 本地机器运行，物理级保护数据资产安全。
3. **安全连接层 (Cloudflare Tunnel)**：通过 182 本地 `cloudflared` (隧道: `小韭菜`) 出站长连接，零公网开放端口，杜绝 IP 泄露。

## 专属配置资产与凭证
- **凭证存储文件**: `~/.config/cloudflare/credentials.json` (权限 600)
- **Account ID**: `d7958267746d45ba2f4d0be880c6a8c1`
- **Zone ID (`xiaojiucai.pro`)**: `d643c2756b8f521923df5053d49e041b`
- **Tunnel ID (`小韭菜`)**: `66d7b9d8-3ba0-40a3-82ca-b1803a4a8bc4`

## 域名与服务矩阵规范
| 域名 | 部署层 | 架构模式 | 后端通信映射 |
| :--- | :--- | :--- | :--- |
| `xiaojiucai.pro` / `www` | CF Workers Assets (`xiaojiucai-pro`) | 边缘静态 + 动态回源 | `/data/`, `/covers/` 自动反代回 182 (`qb.xiaojiucai.pro`) |
| `raw.xiaojiucai.pro` | CF Workers Assets (`rawxiaojiucai`) | 边缘静态 | 接口直连 `https://xgapi.xiaojiucai.pro/api/xgbot` |
| `obs.xiaojiucai.pro` | CF Workers Assets (`obsxiaojiucai`) | 纯脱敏 UI 壳 | `/api/` 路由同源穿透至 182 (`obsapi.xiaojiucai.pro` 8096) |
| `obsapi.xiaojiucai.pro` | 182 Tunnel (`cloudflared`) | 本地 Rust | 映射至 182 `127.0.0.1:8096` (紫微私有排盘引擎与知识库) |
| `xgapi.xiaojiucai.pro` | 182 Tunnel (`cloudflared`) | 本地 Node.js | 映射至 182 `127.0.0.1:8095` (XGBot 审核微服务) |
| `qb.xiaojiucai.pro` | 182 Tunnel (`cloudflared`) | 本地 Nginx | 映射至 182 `http://localhost:80` (情报动态数据源) |

## 安全防御与网络策略铁律
1. **严禁开启免费版 Bot Fight 模式**：免费版 Bot Fight Mode 会无差别拦截跨域 API 与 Axios POST 请求，必须保持 Disabled 状态。
2. **安全性级别保持 Medium 或 Low**：严禁将全站 Security Level 设为 `I'm Under Attack` 或 `High`，避免前端 API 调用触发 5 秒盾截断。
3. **SSL/TLS 加密模式强制 Full (strict)**：端到端严格加密，严禁使用 Flexible 模式防止产生 `ERR_TOO_MANY_REDIRECTS` 死循环。
4. **API 子域名全功能放行 (Skip Rule)**：所有挂载后端的 API 子域名必须在 WAF 自定义规则中配置第一优先级 `Skip` 规则，跳过托管规则与浏览器检查。
5. **Pages 反代规范**：Cloudflare Pages 的 `_redirects` 中 `200` 状态码仅支持相对路径，严禁用作带 `https://` 的外部跨域反代。
6. **大陆可达性致命红线：彻底关闭 ECH (Encrypted Client Hello) 铁律**：
   - Cloudflare 默认开启 ECH (`ech: on`)，在 DNS HTTPS (Type 65) 记录中下发 `cloudflare-ech.com` 公钥；
   - 国内所有现代浏览器（iOS Safari、Chrome 117+、Edge、Mac Safari）识别到该记录后会强制发起 ECH 加密握手；
   - **国内 GFW 防火墙检测到 ECH 握手会无差别主动阻断/重置 TCP/TLS 连接**（用户直接报错无法访问、`ERR_CONNECTION_CLOSED`、`ERR_SSL_PROTOCOL_ERROR` 或超时转圈）；
   - **法定标准**：Zone 级必须通过 API 强制保持 `ech: off`，消除 Type 65 中的 ECH 配置，确保国内走标准 SNI 极速直通。
7. **后量子密钥交换与 HTTP/3 (UDP 443) 规避规范**：
   - `pq_keyex` (Post-Quantum Key Exchange)：默认开启 Kyber 会导致 ClientHello 突破 MTU 发生分片，部分国内运营商网关会直接丢弃分片包。必须强制保持 `pq_keyex: off`；
   - `http3` (QUIC / UDP 443)：国内运营商对 UDP 443 存在严重 QoS 限速或丢包（丢包率常达 50%~80%），导致浏览器尝试 HTTP/3 时挂死数秒。必须保持 `http3: off`，强制走极速高抗阻的 TCP HTTP/2。
8. **首屏关键链路零重型依赖预载规范 (Bundle Preload Hygiene Standard)**：
   - Web3 核心包（`@ton/core`、`@tonconnect/ui-react`，约 700KB）与地图组件（`leaflet`，约 150KB）必须严格按需动态懒加载（`lazy()`），严禁直接混入首屏入口依赖图；
   - `vite.config.ts` 必须配置 `build.modulePreload.resolveDependencies` 拦截这些模块预载，确保首页首屏纯 JS 压缩后保持在超低水位，防止国内弱网环境被堵塞。

## 核心操作 SOP

### 1. 发布 Workers Static Assets 前端
在具备 Node 22 环境的本地构建目录中执行：
```bash
CF_TOKEN=$(jq -r .api_token ~/.config/cloudflare/credentials.json)
CF_ACC=$(jq -r .account_id ~/.config/cloudflare/credentials.json)
CLOUDFLARE_API_TOKEN="$CF_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CF_ACC" \
npx wrangler deploy
```

### 2. 绑定自定义域名
```bash
CF_TOKEN=$(jq -r .api_token ~/.config/cloudflare/credentials.json)
CF_ACC=$(jq -r .account_id ~/.config/cloudflare/credentials.json)
CF_ZONE=$(jq -r .zone_id ~/.config/cloudflare/credentials.json)
curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/${CF_ACC}/workers/domains" \
  -H "Authorization: Bearer ${CF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"environment":"production","hostname":"TARGET_HOSTNAME","service":"SERVICE_NAME","zone_id":"'${CF_ZONE}'"}'
```

### 3. 热更新 182 隧道 Ingress 规则
调用 `PUT /accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations` 更新规则数组，182 的 `cloudflared` 守护进程将秒级热重载，无需重启服务器。

### 4. 未来纯 Web3 DApp 极简边缘标准 (Pure Serverless DApp Canon)
针对未来无需后端的纯 Web3 / TON / TG Mini App 矩阵项目：
1. **零后端与零维护**：彻底不依赖 182 宿主机与隧道映射，前端通过 TON Connect / RPC 节点直连链上智能合约与公开 API。
2. **边缘直发**：统一采用 Cloudflare Workers Static Assets 托管，享受全球 Anycast 0ms 静态秒开与免费无限抗 DDoS 冲击。
3. **极速发布**：统一配置本地 `deploy.sh` 极速直推 + GitHub 仓库自动归档，发版时间受控于 3 秒内。

### 5. 双机职能分工规范 (M2 vs 182 Division of Labor)
1. **Mac mini M2 (牛马4号)**：
   - 独揽全矩阵 DApp（《人生运势历》`obs`、《你是细狗》`raw`、以及未来所有纯 Web3 DApp）的代码研发、TypeScript 严格校验、Vite 构建打包与 Cloudflare Workers 边缘直推；
   - 保护 J3710 弱电宿主机，绝不让 J3710 执行重型前端编译。
2. **182 J3710 (牛马2号)**：
   - 专职官网情报采集与动态更新：官网 (`xiaojiucai.pro`) 的全球情报爬虫 (`intel_engine_rust`)、每日动态数据生成 (`/data/daily_digest.json`)、专刊封面更新与社媒发文，**100% 依然由 182 机器自治更新维护**；
   - 常驻运行私有 Rust 算法微服务（`127.0.0.1:8096` 挂载 `knowledge_vault.json`）与审核微服务（`127.0.0.1:8095`），通过 Cloudflare Tunnel 专职接收边缘穿透调用。
