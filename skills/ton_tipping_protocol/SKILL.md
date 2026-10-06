---
name: ton_tipping_protocol
description: TON 生态 DApp 统一打赏、80/20 自动分账、金主留言墙与多钱包高可用集成标准化中枢。用于全矩阵 DApp 快速复用经过真机实测的打赏组件、TonConnect 消息规范、12 语种国际化与董事长资产矩阵。
triggers:
  - ton_tipping_protocol
  - ton_tip_engine
  - dapp_tipping
  - tip_split_ops
  - ton_supporter_wall
---

# TON DApp 统一打赏与分账标准协议 (TON Tipping Protocol)

## 概述
本技能为小韭菜矩阵全生态 Web3 DApp（包括《你是细狗吗》`raw.xiaojiucai.pro`、《人生运势历》`obs.xiaojiucai.pro`、《小韭菜俱乐部》`club.xiaojiucai.pro` 以及未来所有全新孵化的 DApp）提供**即插即用、经过真机全钱包实测打靶的统一打赏与分账体系**：
1. **统一商业分账引擎**: 普通创作者与粉丝打赏默认强制执行 80%/20% 双消息原子分账；持有官方 Club Pass 会员卡 NFT 享有 100% 全额到账（0% 平台服务费）特权。
2. **TonConnect 零报错消息规范**: 彻底规避 TVM 模拟退回、TonConnect SDK 额外参数报错、留言 BOC 编码异常等全链条踩坑点。
3. **金主留言板 (Supporter Wall) 极速同步**: 链上解析交易附言，提供精选滚动 15 条留言瀑布流与 12 国语言相对时间（刚刚 / 5m ago / 2h ago / 3d ago / 早期支持）。
4. **全主流钱包真机兼容体系**: 完美兼容 Telegram 内置钱包、Tonkeeper、Bitget Wallet 与币安 Web3 钱包（Binance Web3 Wallet），提供本地元数据预置与原生 DeepLink 唤起。

---

## 核心定点资产与账号矩阵 (Permanent Account Matrix)

未来所有 DApp 在涉及打赏、分账、国库收入与管理员权限时，**统一且唯一套用以下账号常量**：

### 1. 打赏与分账核心账户 (Tipping & Split Accounts)

| 身份角色 | 链上地址 (Non-bounceable UQ) | Raw 格式 (`0:xxx`) | 职责定位 |
| :--- | :--- | :--- | :--- |
| **董事长官方金库 / 平台国库 (Chairman & Platform Treasury)** | `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j` | `0:5b3ccf23508e5d7942b46669c196e7482f549404fae9a7a93e052c99ba452cb4` | 官方唯一最高董事长金库、NFT 合约最高 Owner、名人堂合约 Chairman、全平台生态服务费金库，接收普通创作者 20% 打赏分润抽水，未来全矩阵 DApp 官方主收款与金库统一归集此地址 |
| **Club Pass VIP NFT 主网合约** | `EQAOgV_jpZ6YK0ZypEp4oTgAa4T_QZafNN-Or0RSHs3S0Q3a` | - | 官方 V2 会员卡合集合约，持卡地址全自动享受 0% 抽水特权 |

### 2. 智能合约官方管理员白名单矩阵 (Smart Contract RBAC Whitelist)
本矩阵直接**100% 对齐并继承两大主网智能合约**（[`XiaoJiucaiClubV2.tact`](file:///Users/hi/Documents/GitHub/clubxiaojiucai/contracts/XiaoJiucaiClubV2.tact#L214-L217) 与 [`HallOfFameRegistry.tact`](file:///Users/hi/Documents/GitHub/rawxiaojiucai/mingrentangheyue/main.tact#L71-L77)）的代码内置管理员白名单：

| 管理员编号 | 链上地址 (Non-bounceable UQ) | 合约角色与来源 | 业务现状 |
| :--- | :--- | :--- | :--- |
| **W5 自动化管理员** | `UQCqQVeGQ_90SBai5TjiuA0u-serd-IMg9luyeFeWRngHa8E` | 合约内置 Headless Admin | 私钥无感签名，负责 TG 审核通过后免交互上链与 Gas 支付 |
| **合约管理员 1** | `UQAZ1NmBj0uIiCYSawHyKGXfMpaZyh-hpsMngfgTY1zZhE5n` | NFT 合约预置白名单 Admin 1 | 官方团队多签/管理席位 |
| **合约管理员 2** | `UQAaJVdzHt0kcPep4LA5JKTnz5FOYV2zxRqfIG_SpWpX0WUv` | NFT 合约预置白名单 Admin 2 | 官方团队多签/管理席位 |
| **合约管理员 3** | `UQA-bYMHnnF1aJCstnDofa9vzMmnGgPuKe6YOgr7IilEDkZO` | NFT 合约预置白名单 Admin 3 | **NFT 合约原生预置管理员**（当前已分配赋予已验证创作者 `@imm.kimi` 作为独立收款与特权席位） |
| **合约管理员 4** | `UQBi4TPc-ewDv6G2X1jzx4dpzeozZp6umQt1N4aFmlUx4dbF` | NFT 合约预置白名单 Admin 4 | 官方团队多签/管理席位 |

---

## 核心业务分账算法规范 (Tip Split Engine Standard)

### 1. 分成比例与特权规则
- **普通创作者**: 
  - 创作者净收益：`80%`
  - 平台生态服务费：`20%`（直达平台国库金库 `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j`）
  - 前端以单次 `sendTransaction` 同时提交 2 条原子消息（Message 0 转账给创作者，Message 1 转账给国库），杜绝拆单与逃费。
- **VIP 尊享创作者**:
  - 持有官方 Club Pass 会员卡 NFT（或目标创作者本身即为平台国库时），**平台服务费降为 0%**。
  - 粉丝打赏 100% 全额秒到创作者钱包（仅 1 条消息）。

### 2. 标准分账计算实现 (`tipSplitHelper.ts`)
```typescript
import { beginCell, toNano } from '@ton/core';

export const PLATFORM_TREASURY_ADDRESS = 'UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j';

export function buildTipMessages(params: {
  destAddress: string;
  totalTon: number;
  comment?: string;
  isVip?: boolean;
}) {
  const { destAddress, totalTon, comment, isVip = false } = params;
  const totalNano = toNano(totalTon.toString());

  // 留言 BOC 构建 (无留言时严格为 undefined，严禁传空字符串)
  let commentPayload: string | undefined = undefined;
  if (comment && comment.trim().length > 0) {
    const cleanComment = comment.trim().slice(0, 120);
    const bodyCell = beginCell()
      .storeUint(0, 32) // 32 位 0 代表纯文本附言
      .storeStringTail(cleanComment)
      .endCell();
    commentPayload = bodyCell.toBoc().toString('base64');
  }

  // VIP 或直打给国库: 100% 全额到账 (单笔消息)
  if (isVip || destAddress === PLATFORM_TREASURY_ADDRESS) {
    return [
      {
        address: destAddress,
        amount: totalNano.toString(),
        payload: commentPayload
      }
    ];
  }

  // 普通创作者: 80% 到创作者，20% 到平台国库
  const creatorNano = (totalNano * 8n) / 10n;
  const cutNano = totalNano - creatorNano;

  return [
    {
      address: destAddress,
      amount: creatorNano.toString(),
      payload: commentPayload
    },
    {
      address: PLATFORM_TREASURY_ADDRESS,
      amount: cutNano.toString()
    }
  ];
}
```

---

## TonConnect 消息规范与真机避坑铁律

1. **严禁在消息中注入非协议字段**:
   - `messages` 数组中的元素**只能**包含 `address`、`amount`、`payload`（可选）以及 `stateInit`（可选）。
   - **绝对严禁**注入 `bounce: false` 或 `network: '-239'` 到单条 message 对象内部！TonConnect SDK 遇到未识别字段会在签名解析前直接抛出 `Invalid message schema: extra property 'bounce' at index 0`，导致弹窗崩溃。
2. **留言附言（Payload）严格构建规范**:
   - 用户未输入留言时，`payload` 字段**必须为 `undefined`**（或者不包含该键），**严禁传 `payload: ""` 空字符串**。空字符串无法被钱包 SDK 解析为有效 BOC，会报 `Base64 string expected` 错误。
   - 留言上限严格截断为 120 个字符，防止 BOC 尺寸突破单单元 Cell 限制（127 字节）。
3. **未激活（Uninitialized）账户防退回警示**:
   - 接收方若为全新未产生过交易的钱包（链上状态为 `nonexist`），部分多链钱包（如 Bitget）在本地预模拟时会自动给消息加 `bounce: true` 导致净到账模拟为 0，弹窗仅显示 Gas 费（如 `0.0000几 TON`）。
   - 前端需在打赏前做链上探测，若为未激活地址，弹出轻量提醒解释模拟机理，并建议使用 Telegram 钱包或 Tonkeeper 极速支付。

---

## 金主留言墙 (Supporter Wall) 架构与 12 语种规范

### 1. 链上附言解析与抓取策略
- 请求 Orbs 去中心化网关（`4410`、`4411`）或 TonCenter `getTransactions` 接口：
  - 过滤条件：`in_msg` 存在、金额 > 0、且包含文本 Comment（`in_msg.message` 或解码后的 BOC 文本）。
  - 数据清洗：正则过滤危险 HTML/Script 标签，去除多余空白字符。
- **精选滚动 15 条留言机制 (Rolling Top 15 Supporter Feed)**:
  - 仅拉取并展示最近 15 条真实打赏留言，既保障高频活跃氛围，又极大压低移动端 RPC 延迟与内存占用。

### 2. 12 语种相对时间格式化 (`formatLightboxTimeAgo`)
全矩阵统一复用以下纯算法函数，无任何外部库依赖：
```typescript
export function formatLightboxTimeAgo(timestampSeconds: number, lang: string): string {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000) - timestampSeconds);
  const minutes = Math.floor(diffSec / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const isZh = lang === 'zh_cn' || lang === 'zh_tw' || lang === 'zh_hk';
  if (minutes < 1) return isZh ? '刚刚' : 'Just now';
  if (minutes < 60) return isZh ? `${minutes}分钟前` : `${minutes}m ago`;
  if (hours < 24) return isZh ? `${hours}小时前` : `${hours}h ago`;
  if (days <= 3) return isZh ? `${days}天前` : `${days}d ago`;
  return isZh ? '早期支持' : 'Recent';
}
```

---

## 多钱包唤起与环境配置规范 (`utils/wallets.ts`)

为了保障国内网络与跨国环境 100% 成功唤起，必须在前端静态配置 `LOCAL_WALLETS`：

```typescript
export const LOCAL_WALLETS = [
  {
    appName: 'telegram-wallet',
    name: 'Wallet in Telegram',
    imageUrl: 'https://wallet.tg/images/logo-288.png',
    aboutUrl: 'https://wallet.tg/',
    universalLink: 'https://t.me/wallet?attach=wallet',
    bridgeUrl: 'https://bridge.tonapi.io/bridge',
    platforms: ['ios', 'android', 'macos', 'windows', 'linux']
  },
  {
    appName: 'tonkeeper',
    name: 'Tonkeeper',
    imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
    aboutUrl: 'https://tonkeeper.com',
    universalLink: 'https://app.tonkeeper.com/ton-connect',
    bridgeUrl: 'https://bridge.tonapi.io/bridge',
    platforms: ['ios', 'android', 'chrome', 'firefox']
  },
  {
    appName: 'bitgetTonWallet',
    name: 'Bitget Wallet',
    imageUrl: 'https://raw.githubusercontent.com/bitkeepwallet/download/main/logo/png/bitget_wallet_logo_0_1.png',
    aboutUrl: 'https://web3.bitget.com',
    universalLink: 'https://bkcode.vip/ton-connect',
    deepLink: 'bitkeep://',
    jsBridgeKey: 'bitgetTonWallet',
    bridgeUrl: 'https://bridge.tonapi.io/bridge',
    platforms: ['ios', 'android', 'chrome']
  },
  {
    appName: 'binanceWeb3TonWallet',
    name: 'Binance Wallet',
    imageUrl: 'https://public.bnbstatic.com/image/cms/article/body/202311/8ebbf903d7ad666e4a29aef10e0513e2.png',
    aboutUrl: 'https://www.binance.com/web3wallet',
    universalLink: 'https://app.binance.com/cedefi/ton-connect',
    deepLink: 'bnc://app.binance.com/cedefi/ton-connect',
    jsBridgeKey: 'binancew3w',
    bridgeUrl: 'https://wallet.binance.com/tonbridge/bridge',
    platforms: ['ios', 'android']
  }
];
```

> **币安 Web3 钱包避坑说明**:
> 1. 必须配置 `deepLink: "bnc://app.binance.com/cedefi/ton-connect"`，保障 PWA 或独立浏览器下点击一键唤醒币安 App。
> 2. 币安远端 SSE Bridge (`https://wallet.binance.com/tonbridge/bridge`) 易受网络波动影响，最佳体验为引导用户在币安 App 内置 Web3 浏览器中打开 DApp，直接利用注入的 `window.binancew3w` 实现 0ms 本地原生直连。

---

## 工程规范与架构防御红线

1. **显式条件挂载 (Strict Conditional Mounting)**:
   - 全局打赏弹窗与留言板弹窗在根组件挂载时**必须**使用布尔短路：
     ```tsx
     {showTipModal && (
       <TipModal
         isOpen={showTipModal}
         onClose={() => setShowTipModal(false)}
         creator={targetCreator}
       />
     )}
     ```
   - 严禁在后台静默挂载未显示的弹窗，防止内部组件初始化异常引发 ErrorBoundary 拦截全屏导致界面假死。
2. **多小文件解耦与单文件严格 < 250 行**:
   - 打赏模块强制拆分：
     - `TipModal.tsx`: 弹窗 UI、金额快捷键、自定义输入
     - `tipSplitHelper.ts`: 80/20 分账与 BOC 编码纯函数
     - `useTipFeed.ts`: 链上留言与打赏历史异步 Hook
     - `ClubLightbox.tsx` / `SupporterWall.tsx`: 留言墙与全屏查看器
     - `lightboxI18n.ts`: 留言板多语言字典与相对时间换算
   - 严格禁止单文件超过 250 行。
3. **发版前严格静态门禁**:
   - 在部署任何接入打赏系统的 DApp 前，必须本地运行 `npx tsc --noEmit`，确保 0 个未定义变量与类型错误流向生产。
