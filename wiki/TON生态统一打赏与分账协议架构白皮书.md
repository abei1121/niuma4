# TON 生态统一打赏与分账协议架构白皮书 (TON Tipping Protocol Architecture)

> **定位**：小韭菜全生态（包括《你是细狗吗》`raw.xiaojiucai.pro`、《人生运势历》`obs.xiaojiucai.pro`、《小韭菜俱乐部》`club.xiaojiucai.pro` 以及未来孵化的全新 Web3 DApp）统一打赏、80/20 自动分账、金主留言墙与全主流钱包直通标准规范。  
> **核心原则**：新 Agent 接入任何新 DApp 时，100% 复刻本标准，严禁篡改金库常量与合约白名单。

---

## 一、核心定点资产与唯一董事长金库 (Single Source of Truth)

未来所有 DApp 在涉及打赏、分账、国库收入与管理员权限时，**统一且唯一套用以下链上常量**：

### 1. 董事长官方金库与资产矩阵

| 身份角色 | 链上地址 (Non-bounceable UQ) | Raw 格式 (`0:xxx`) | 职责定位与权威事实 |
| :--- | :--- | :--- | :--- |
| **董事长官方金库 / 平台国库 (Chairman & Treasury)** | `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j` | `0:5b3ccf23508e5d7942b46669c196e7482f549404fae9a7a93e052c99ba452cb4` | **官方唯一最高董事长金库**、NFT 合约最高 Owner、名人堂合约 Chairman、全平台生态服务费金库，接收普通创作者 20% 打赏分润抽水，未来全矩阵 DApp 官方主收款与金库唯一归集地址。严禁使用任何其他临时地址！ |
| **Club Pass VIP NFT 主网合约** | `EQAOgV_jpZ6YK0ZypEp4oTgAa4T_QZafNN-Or0RSHs3S0Q3a` | - | 官方 V2 会员卡合集合约，持卡地址全自动享受 0% 抽水特权 |
| **双开门名人堂主网合约** | `EQDJQcb-1K6W7LCowAqTXvrYXHfdyVsRban8oQw9RrZntGka` | - | 链上创作者存证与 RBAC 管理中心，Tact 1.6 编写 |

### 2. 智能合约内置 RBAC 管理员白名单矩阵
直接继承两大主网智能合约（[`XiaoJiucaiClubV2.tact`](file:///Users/hi/Documents/GitHub/clubxiaojiucai/contracts/XiaoJiucaiClubV2.tact#L214-L217) 与 [`HallOfFameRegistry.tact`](file:///Users/hi/Documents/GitHub/rawxiaojiucai/mingrentangheyue/main.tact#L71-L77)）代码内置白名单：

| 管理席位 | 链上地址 (Non-bounceable UQ) | 合约角色与说明 |
| :--- | :--- | :--- |
| **🤖 W5 自动化管理员** | `UQCqQVeGQ_90SBai5TjiuA0u-serd-IMg9luyeFeWRngHa8E` | 合约内置 Headless Admin，TG 审核通过后私钥免交互上链与 Gas 垫付 |
| **🛡️ 官方管理员 1** | `UQAZ1NmBj0uIiCYSawHyKGXfMpaZyh-hpsMngfgTY1zZhE5n` | NFT 合约与名人堂合约预置白名单 Admin 1 |
| **🛡️ 官方管理员 2** | `UQAaJVdzHt0kcPep4LA5JKTnz5FOYV2zxRqfIG_SpWpX0WUv` | NFT 合约与名人堂合约预置白名单 Admin 2 |
| **🛡️ 官方管理员 3** | `UQA-bYMHnnF1aJCstnDofa9vzMmnGgPuKe6YOgr7IilEDkZO` | NFT 合约预置白名单 Admin 3（细狗 DApp 中已分配赋予已验证创作者 `@imm.kimi` 作为独立收款与特权席位） |
| **🛡️ 官方管理员 4** | `UQBi4TPc-ewDv6G2X1jzx4dpzeozZp6umQt1N4aFmlUx4dbF` | NFT 合约与名人堂合约预置白名单 Admin 4 |

---

## 二、商业分账引擎算法 (Tip Split Engine)

### 1. 双轨商业分账模型
- **普通创作者**：
  - 创作者净实收：`80%`
  - 平台生态维护费：`20%`（直达董事长金库 `UQBbPM8jUI5deUK0ZmnBludIL1SUBPrpp6k-BSyZukUstM_j`，Memo 标注 `XG:EcoFund-20%`）。
  - 前端以单笔 `sendTransaction` 提交 2 条原子消息（Message 0 转给创作者，Message 1 转给金库），杜绝逃费与拆单。
- **VIP 尊享创作者**：
  - 持有 Club Pass 会员卡 NFT（或目标创作者本身即为董事长金库时），**平台服务费降为 0%**。
  - 粉丝打赏 100% 全额秒到创作者钱包（单笔消息）。

### 2. 标准算法实现 (`tipSplitHelper.ts`)
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

  // 附言 BOC 构造 (无留言时严格为 undefined，严禁传空字符串)
  let commentPayload: string | undefined = undefined;
  if (comment && comment.trim().length > 0) {
    const cleanComment = comment.trim().slice(0, 120);
    const bodyCell = beginCell()
      .storeUint(0, 32)
      .storeStringTail(cleanComment)
      .endCell();
    commentPayload = bodyCell.toBoc().toString('base64');
  }

  // VIP 或直接打赏给董事长金库: 100% 全额到账
  if (isVip || destAddress === PLATFORM_TREASURY_ADDRESS) {
    return [
      {
        address: destAddress,
        amount: totalNano.toString(),
        payload: commentPayload
      }
    ];
  }

  // 普通创作者: 80% 到创作者，20% 到董事长金库
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

## 三、TonConnect 消息规范与避坑铁律

1. **绝对禁止注入非协议字段**：
   - 单条 message 对象**只允许**包含 `address`、`amount`、`payload`（可选）、`stateInit`（可选）。
   - **严禁**在 message 内写 `bounce: false` 或 `network: '-239'`，TonConnect SDK 会在签名解析前直接崩溃抛出 `Invalid message schema: extra property 'bounce'`。
2. **留言附言（Payload）严格规约**：
   - 用户未留言时，`payload` 必须为 `undefined`，**绝不可传空字符串 `""`**（会导致 `Base64 string expected` 异常）。
   - 字符数上限严格截断为 120 字符，保证不超过单单元 Cell 127 字节物理上限。
3. **未激活账户本地预模拟防退回**：
   - 若接收方为全新钱包（`state: nonexist`），部分钱包（如 Bitget）本地模拟默认带 `bounce: true` 导致显示预估到账为 0，仅扣 Gas。
   - 前端需检测该状态并给予用户友好提示。

---

## 四、全主流钱包真机唤醒矩阵 (`wallets.ts`)

为了确保国内外网络环境 100% 唤起成功，前端统一静态配置：
- **Tonkeeper**: `universalLink: 'https://app.tonkeeper.com/ton-connect'`
- **币安 Web3 钱包**: `deepLink: 'bnc://app.binance.com/cedefi/ton-connect'`, `universalLink: 'https://app.binance.com/cedefi/ton-connect'`
- **Bitget Wallet**: `universalLink: 'https://bkcode.vip/ton-connect'`, `deepLink: 'bitkeep://'`
- **Telegram Wallet**: `universalLink: 'https://t.me/wallet?attach=wallet'`
- **OKX Wallet**: `deepLink: 'okx://web3/wallet/tonconnect'`

---

## 五、金主留言墙 (Supporter Wall) 极速同步架构

1. **链上抓取与精选滚动 15 条**：
   - 过滤条件：`in_msg` 存在、金额 > 0、附带有效文本 Comment。
   - 滚动窗口：仅拉取最近 15 条真实留言，压低移动端 RPC 请求负载与内存占用。
2. **12 语种相对时间格式化**：
   - 统一算法支持 12 种主流语言，无外部库依赖（刚刚 / 5m ago / 2h ago / 3d ago / 早期支持）。

---

## 六、工程红线与防御契约

1. **显式条件挂载 (Strict Conditional Mounting)**：
   - 弹窗组件挂载必须使用 `{showTipModal && <TipModal ... />}`，禁止后台静默挂载隐藏组件，防止未捕获异常引发全屏假死。
2. **多小文件解耦与单文件严格 < 250 行**：
   - 模块解耦为 `TipModal.tsx`、`tipSplitHelper.ts`、`useTipFeed.ts`、`TipWalletSelector.tsx`、`TipVaultSummary.tsx` 等。
3. **部署前静态类型审查**：
   - 发布前必须通过 `npx tsc --noEmit`，实现 0 错误上链。
