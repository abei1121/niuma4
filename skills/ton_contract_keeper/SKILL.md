---
name: ton_contract_keeper
description: TON 智能合约全生命周期工程中枢、Tact 编译、W5 无感自动化运维、双开门名人堂中央注册表 2.0 (HallOfFameRegistry) 链上存证与金库守护技能。
triggers:
  - ton_contract_keeper
  - ton_contract_ops
  - hof_contract
  - ton_tact_ops
  - w5_contract_ops
  - mingrentang_contract
---

# TON 智能合约与 W5 无感自动化运维中枢 (TON Contract Keeper)

## 概述
《你是细狗吗》社区与双开门名人堂中央注册表（HallOfFameRegistry 2.0）的 TON 智能合约生命周期、Tact 编译、W5 无感私钥调度与金库守护中枢：
1. **Tact 智能合约架构**: 采用 Tact 1.6 编写，支持 O(1) 毫秒级成员点查、全量数据链上 `emit` 广播存证、RBAC 团队矩阵权限控制与金库租金防抽水死锁机制。
2. **W5 无感自动化调度 (Headless Operations)**: 授权专用 W5 钱包作为合约内置 Admin，利用私钥在后台秒级签名转账，免除移动端弹窗与扫码交互，实现 TG 审核通过后全自动上链。
3. **去中心化 RPC 多节点集群并发广播**: 聚合 Orbs 去中心化网关（4410、4411）与 Toncenter，彻底解决单节点 429 限频、超时与 Lite-server 丢包问题。

---

## 专职定点资产与链上参数

- **工程唯一主定点**: `/Users/hi/Documents/GitHub/rawxiaojiucai`
- **合约源码定点**: [`mingrentangheyue/main.tact`](file:///Users/hi/Documents/GitHub/rawxiaojiucai/mingrentangheyue/main.tact)
- **编译配置文件**: [`mingrentangheyue/tact.config.json`](file:///Users/hi/Documents/GitHub/rawxiaojiucai/mingrentangheyue/tact.config.json)
- **TypeScript 包装器**: [`contracts/tact_HallOfFameRegistry.ts`](file:///Users/hi/Documents/GitHub/rawxiaojiucai/contracts/tact_HallOfFameRegistry.ts)
- **主网目标合约地址 (Bounceable)**: `EQDJQcb-1K6W7LCowAqTXvrYXHfdyVsRban8oQw9RrZntGka`
- **主网目标合约地址 (Non-bounceable)**: `UQDJQcb-1K6W7LCowAqTXvrYXHfdyVsRban8oQw9RrZntDTf`
- **董事长官方金库 / 合约Owner (Chairman & Platform Treasury)**: `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j` (Raw: `0:5b3ccf23508e5d7942b46669c196e7482f549404fae9a7a93e052c99ba452cb4`)
- **W5 自动化管理员钱包**: `UQCqQVeGQ_90SBai5TjiuA0u-serd-IMg9luyeFeWRngHa8E`
- **4 位原班官方管理员白名单 (100% 对齐 NFT 与名人堂主网合约)**:
  - `UQAZ1NmBj0uIiCYSawHyKGXfMpaZyh-hpsMngfgTY1zZhE5n` (Admin 1)
  - `UQAaJVdzHt0kcPep4LA5JKTnz5FOYV2zxRqfIG_SpWpX0WUv` (Admin 2)
  - `UQA-bYMHnnF1aJCstnDofa9vzMmnGgPuKe6YOgr7IilEDkZO` (Admin 3，已分配创作者 @imm.kimi 独立收款使用)
  - `UQBi4TPc-ewDv6G2X1jzx4dpzeozZp6umQt1N4aFmlUx4dbF` (Admin 4)
- **统一打赏协议标准**: 参见 `ton_tipping_protocol` 技能定点规范
- **高可用 RPC 集群节点**:
  - `https://ton.access.orbs.network/4410c0ff5Bd3F8B62C092Ab4D238bEE463E64410/1/mainnet/toncenter-api-v2/jsonRPC`
  - `https://ton.access.orbs.network/4411c0ff5Bd3F8B62C092Ab4D238bEE463E64411/1/mainnet/toncenter-api-v2/jsonRPC`
  - `https://toncenter.com/api/v2/jsonRPC`

---

## 核心操作 SOP

### 1. 链上状态与管理员矩阵一键点查
```bash
cd /Users/hi/Documents/GitHub/rawxiaojiucai
npx tsx scripts/ops_query.ts
```
**输出验证项**:
- 合约状态（`active`）与金库当前余额。
- 链上已存证创作者总人数（`total_members`）。
- 董事长与 5 位管理员（含 W5）激活状态。

---

### 2. 创作者通过后一键存证上链 (SetMember)
TG Bot 审核同意或人工录入新创作者时执行：
```bash
cd /Users/hi/Documents/GitHub/rawxiaojiucai
npx tsx scripts/ops_member.ts set \
  --uid "7850498117062361219981964103308333186649004720441534998302804327091466669248" \
  --cid "Qmajb2gTgozUXbhLATKWjgcrfz9q9CnFBxXD77moUex5Fr" \
  --platform 1 \
  --handle "kun_526" \
  --text "眼睛男子已上線" \
  --status 1
```
- 平台编号对照：0:TK, 1:IG, 2:YT, 3:抖音, 4:小红书, 5:TG, 6:X, 7:FB, 8:VK, 9:TH, 10:LINE, 11:SNAP。
- 如有绑定钱包，追加 `--wallet "UQBMsv..."` 参数。

---

### 3. 违规创作者链上封禁与解封 (BlockMember)
当创作者内容违规需在链上快速熔断屏蔽时：
```bash
# 封禁 (status 设为 0)
cd /Users/hi/Documents/GitHub/rawxiaojiucai
npx tsx scripts/ops_member.ts block --uid "<UID>" --status 0

# 解封恢复 (status 设为 1)
npx tsx scripts/ops_member.ts block --uid "<UID>" --status 1
```

---

### 4. 金库收益巡检与董事长安全提现 (Withdraw)
```bash
cd /Users/hi/Documents/GitHub/rawxiaojiucai
npx tsx scripts/ops_treasury.ts
```
- 合约严格保留 `0.05 TON` 租金底池，防止合约因欠费被冻结。
- 多余资金自动生成一键提现 Tonkeeper 深层跳转链接，董事长点击后 1 秒即可将收益提回金库。

---

### 5. 合约重构与 Tact 编译自动化
如后续扩展合约逻辑，必须按标准链路重新编译与验证：
```bash
cd /Users/hi/Documents/GitHub/rawxiaojiucai/mingrentangheyue
npx tact -c tact.config.json
```
编译产物将自动输出至 `/Users/hi/Documents/GitHub/rawxiaojiucai/contracts/`。

---

## TG 审核机器人 (XGBot) 自动化闭环链路

```
[创作者前端提交] 
       │
       ▼
[Pinata IPFS 上传图片/JSON] ──► [TG 群推送到命主 Telegram]
                                          │
                                   [命主点击 同意]
                                          │
                                          ▼
                      [XGBot 调用 scripts/ops_member.ts set]
                                          │
                                 [W5 自动化私钥无感签名]
                                          │
                             [Orbs 集群并发广播上链]
                                          │
                                          ▼
                             [TVM 确认，写入 Central Registry]
```

---

## 双轨打赏与 80%/20% 商业分成架构 (Dual-Track Tipping & Platform Fee Split)

1. **双轨打赏机制**:
   - **普通创作者（绑定钱包）**: 无需持有 NFT 即可开启链上打赏通道。粉丝打赏资金触发多跳交易：**创作者实收 80%**，**平台生态服务费 20%** 自动直达平台国库金库 `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j`（Memo: `XG:EcoFund-20%`）。标准原子分账与前端代码规范详见 `ton_tipping_protocol`。
   - **Club Pass VIP 创作者**: 持有 Club Pass NFT（V2 或 V1）尊享 **100% 全额秒到账**（0% 平台服务费），并激活金标流光与 VIP 认证徽章。
   - **纯游客模式（无钱包）**: 仅用于身材展示与社媒引流，不开放打赏通道。
2. **多语言与软文知情规范**:
   - 全网 12 国语言（`zh_cn`, `zh_tw`, `zh_hk`, `en`, `ja`, `ko`, `vi`, `ru`, `es`, `fr`, `pt`, `id`）中，`club_term_2`、`club_tip_label`、`club_tip_unlock` 统一明示双轨规则，并通过 `npm run test:i18n` 自动化测试校验 100% 键位对齐。

---

## 避坑与防御规范

1. **禁止单节点广播**: 任何向链上广播的交易必须调用 `broadcastBoc` 并发推送到 Orbs 4410、4411 与 Toncenter，避免 Lite-server 单点丢包导致交易超时作废。
2. **动态 Seqno 递增确认**: 严禁硬编码 `seqno`；广播后必须轮询探测 W5 钱包的 `seqno` 直至递增，确认交易已正式打包入块。
3. **合约租金防死锁**: 提取金库资金时，合约强制保留 `0.05 TON`，严禁全部提空导致合约因欠费转为 uninitialized。
4. **单文件单一职责**: 本技能所有配套 `.ts` 脚本严格控制在 250 行以内，杜绝冗余巨石代码。
5. **无钱包补填机制**: 若历史游客创作者需补填钱包开通打赏分成通道，使用 `npx tsx scripts/ops_member.ts set` 传入该创作者 UID 与其 TON 钱包地址即可秒级上链激活。

