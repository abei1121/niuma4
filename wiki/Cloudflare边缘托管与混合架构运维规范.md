# Cloudflare 边缘托管与混合架构运维规范 (Cloudflare Edge & Hybrid Ops)

## 概述
小韭菜矩阵全项目法定统一架构标准：**Cloudflare 边缘静态托管 + 182 宿主机运算后端 (Hybrid Edge-Origin)**。
彻底解耦前端静态资产与后端私有数据，最大化发挥 Cloudflare 全球 Anycast CDN 优势与 182 本地私有闭环安全性。

---

## 核心架构原则

### 1. 边缘静态层 (Cloudflare Edge)
全站前端工程（Vite / React 19 / TypeScript / PWA）100% 部署在 Cloudflare 全球 Anycast 边缘网络（Workers Static Assets）：
- 全球 0 毫秒缓存直发（`cf-cache-status: HIT`）；
- 免除 182 本地宽带上行消耗与 DDoS 冲击；
- 前端源码中绝不包含任何私有知识库典籍或核心大模型提示词。

### 2. 本地计算层 (182 Host)
核心算法、私有知识库、Rust 流式推演与情报生成 100% 保留在 182 本地机器运行：
- **人生运势历**：纯 Rust 微服务（`127.0.0.1:8096`），独占内存挂载 203KB 绝密 64 格局典籍库 (`knowledge_vault.json`)；
- **你是细狗**：Node.js XGBot 微服务（`127.0.0.1:8095`），负责体态与任务审核；
- **小韭菜官网**：情报爬虫引擎 (`intel_engine_rust`)，生成每日快讯与专刊数据（`/data/daily_digest.json`）。

### 3. 安全连接层 (Cloudflare Tunnel)
182 宿主机常驻 `cloudflared` 守护进程，向 Cloudflare 建立加密出站长连接：
- 零公网端口暴露，彻底杜绝 IP 泄露与端口扫描；
- 每个业务项目分配独立后端二级域名，严格物理隔离。

---

## 域名与服务矩阵规范

| 业务项目 | 前端访问入口 | 前端部署层 | 后端专属隧道通道 | 182 宿主机端口与资产 | 状态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **小韭菜官网 / 情报** | `xiaojiucai.pro` / `www` | CF Workers Assets (`xiaojiucai-pro`) | `qb.xiaojiucai.pro` | `http://localhost:80` (情报动态数据源) | HTTP 200 全通 |
| **你是细狗吗** | `raw.xiaojiucai.pro` | CF Workers Assets (`rawxiaojiucai`) | `xgapi.xiaojiucai.pro` | `http://127.0.0.1:8095` (XGBot 审核服务) | HTTP 200/204 全通 |
| **人生运势历** | `obs.xiaojiucai.pro` | CF Workers Assets (`obsxiaojiucai`) | `obsapi.xiaojiucai.pro` | `http://127.0.0.1:8096` (Rust 私有排盘与知识库) | HTTP 200 全通 |

---

## 双机职能分工规范 (M2 vs 182 Division of Labor)

### 1. Mac mini M2 (牛马4号)：全矩阵 DApp 研发与编译中心
- **研发与构建主责**：独揽《人生运势历》、《你是细狗》及未来所有新 DApp 的代码研发、严格 TypeScript 语法校验（`npx tsc --noEmit`）、Vite 打包与 Cloudflare Workers 边缘直推；
- **保护 J3710 弱电硬件**：绝不让 J3710 弱电宿主机承担重型 Node 依赖安装与 Vite 编译，保障生产环境不降频、不假死。

### 2. 182 J3710 (牛马2号)：官网情报采集与本地私有微服务中枢
- **官网更新主责**：官网 (`xiaojiucai.pro`) 的全球情报爬虫 (`intel_engine_rust`)、每日动态数据生成 (`/data/daily_digest.json`)、专刊封面生成与社媒发文，**100% 依然由 182 机器自治更新维护**；
- **私有微服务守护**：常驻运行 `obs_membership.service`、`dapp_xgbot.service`、`nginx.service` 与 `cloudflared.service`，内存受控于 70MB 以内。

---

## 未来纯 Web3 DApp 极简边缘标准 (Pure Serverless DApp Canon)

针对未来无需后端的纯 Web3 / TON / TG Mini App 项目：
1. **零后端与零维护**：彻底不依赖 182 宿主机与隧道映射，前端通过 TON Connect / RPC 节点直连链上智能合约；
2. **边缘直发**：统一采用 Cloudflare Workers Static Assets 托管，享受全球 Anycast 0ms 静态秒开与免费无限抗 DDoS 冲击；
3. **极速发布**：统一配置本地 `deploy.sh` 极速直推 + GitHub 仓库自动归档，发版时间受控于 3 秒内。

---

## 自动化流水线规范

1. **本地极速发布（日常主力）**：
   - 执行根目录 `./deploy.sh`，3 秒内完成「本地打包 + Git 远端备份 + 182 冷备 + Cloudflare 全球边缘热重载」。
2. **云端 CI/CD（异地兜底）**：
   - GitHub 仓库配置 `.github/workflows/deploy.yml`；
   - 任何向 `main` 分支的 push 操作均由 GitHub Actions 自动化沙箱构建并调用 Cloudflare API 部署至边缘。
