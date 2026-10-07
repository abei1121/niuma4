# Web3 & TON 公链交互缺陷排查矩阵 (Web3 / TON Trap Matrix)

## 1. 地址可回弹 (Bounceable) 与非回弹 (Non-bounceable) 陷阱
- **核心风险**: TON 地址有 Bounceable (`EQ...`) 与 Non-bounceable (`UQ...`) 两种 User-friendly 表达。
- **致命陷阱**: 当向一个**从未向外发送过交易的未初始化新钱包 (Uninitialized Wallet)** 转账或打赏时，若目标地址标记为 `bounceable: true` (`EQ...`)，TON 虚拟机将强制把资金弹回原钱包，并扣除来回 Gas 磨损费！
- **防御铁律**:
  - 所有普通用户转账、社交打赏、粉丝赠予的目标地址，必须强制解析为 Non-bounceable (`bounceable: false`，即 `UQ...` 格式)。
  - 合约内部相互调用、需要感知接收方失败时才使用 `bounceable: true`。

## 2. BigInt 浮点数与科学计数法转换陷阱
- **核心风险**: JavaScript 原生 `BigInt()` 构造器只要接收到任何含小数点的数值（浮点数）或带有小数点的字符串，就会抛出致命异常：`SyntaxError: Cannot convert float to BigInt` 或 `RangeError`。
- **致命代码示例**:
  ```ts
  // 错误！当 amountTon 为 0.05 时，amountTon * 1e9 可能因精度误差产生浮点数
  const nano = BigInt(amountTon * 1e9); 
  // 错误！Math.floor 返回浮点数类型，如果传给 BigInt 遇到非整数或科学计数法仍会报错
  const nano = BigInt(Math.floor(amountTon * 1e9));
  ```
- **防御铁律**:
  - 严禁对浮点乘积直接调用 `BigInt(...)`。
  - 使用标准的 `@ton/core` `toNano(amountStr)` 或字符串定点位移算法：
  ```ts
  import { toNano } from '@ton/core';
  const safeNano = toNano(amount.toString());
  ```

## 3. 原始地址字符串相等性比较陷阱
- **核心风险**: TON 的同一个账户可以表现为 `EQ...`（主网反弹）、`UQ...`（主网非反弹）、`kQ...`（测试网反弹）、`0:abc...`（Hex 原始格式），并且可能大小写不一致。
- **致命代码示例**:
  ```ts
  if (userWallet === post.wallet) { ... } // 极高概率误判为 false！
  ```
- **防御铁律**:
  - 严禁直接使用 `===` 或 `!==` 比较两串钱包地址。
  - 统一调用标准化地址比对函数 `isAddressEqual(a, b)` 或通过 `Address.parse(a).equals(Address.parse(b))`。

## 4. TEP-64 纯文本 Comment 与 BOC Payload 陷阱
- **核心风险**: 在 TON 链上向智能合约或个人附带备注（Comment）时，TEP-64 规范要求在 Cell 的前 32 位写入 0（`storeUint(0, 32)`），随后追加 UTF-8 文本；单个 Cell 容纳上限为 1023 位。
- **防御铁律**:
  - 构造转账 Comment 时必须显式补全 32 位 0 操作码：
  ```ts
  const commentCell = beginCell().storeUint(0, 32).storeStringTail(memo).endCell();
  ```
  - 严禁单 Cell 超长文本溢出（若文本超过 120 字符须采用 Snake-Cell 链式存储）。

## 5. Hold-to-Earn 会员验权与缓存失效陷阱 (Revoke-on-Transfer)
- **核心风险**: 前端将用户持有 NFT 或 Token 状态持久化到 `localStorage` 中。当用户把 NFT 转出或在二级市场售出后，前端若继续信任本地缓存，将导致权限残留甚至白嫖。
- **防御铁律**:
  - 本地缓存只作首屏骨架占位，必须在联网后静默向 RPC / Indexer 重新打靶校验。
  - 切换钱包或断开连接时，毫秒级清空该地址对应的特权标记。

## 6. TonConnect 2.0 `ton_proof` 验签与 `'ton-safe-sign-magic'` 混淆陷阱
- **核心风险**:
  1. 验签混淆：开发者误用旧版 `'ton-safe-sign-magic'` 字符串拼接加盐消息，导致标准 TonConnect 钱包（Tonkeeper、MyTonWallet、OpenMask）的有效签名被全部判定为非法伪造；
  2. 假签名直通漏洞：部分前端或后端仅校验 `signature.length === 64` 即视为验签通过，导致恶意攻击者传入任意 64 字节伪造字符串即可绕过身份认证接管管理员权限。
- **防御铁律**:
  - 严格按照 TonConnect 2.0 规范构造二进制 buffer：
    `msg = 'ton-proof-item-v2/' ++ wc(int32BE) ++ hash(256BE) ++ dLen(uint32LE) ++ domain ++ ts(uint64LE) ++ payload`；
  - 严格使用 `0xffff` 与 `'ton-connect'` 作为前缀加盐：
    `fullMsg = Buffer.concat([Buffer.from([0xff, 0xff]), Buffer.from('ton-connect'), sha256(msg)])`；
  - 必须从钱包账户状态获取公钥（32 字节 Ed25519 Public Key），并通过 `nacl.sign.detached.verify(sha256(fullMsg), signature, publicKey)` 执行真实验签，绝不允许长度宽松放行。

## 7. TON 合约 Exit Code -13 诊断与多节点 RPC 故障转移池
- **核心风险**:
  1. 交易失败 `exit_code: -13`：在 TON 虚拟机（TVM）中，-13 通常代表计算阶段 Gas 不足（Out of Gas）或在执行过程触发了未捕获的运行时异常（如 Cell 下溢/上溢、反序列化字段错位）；
  2. 单一 RPC 依赖单点故障：公用 Toncenter 节点容易触发 HTTP 429 限流，导致前端拉取合约状态频繁抛出 Network Error。
- **防御铁律**:
  - 前端调起合约交互（如铸造、部署）必须预留充足 Gas（一般建议 `>= 0.05 TON`），并指定 `mode: 64` 将未消耗完的剩余 Gas 自动退回调用者；
  - 前端必须配置动态 RPC 故障转移池（如 Toncenter + GetBlock + TonAPI / Orbs），在检测到 HTTP 429/502 或请求超过 3.5s 时毫秒级切换节点。

## 8. TonConnect UI 钱包选单缺失与 `walletsListUrl` 无效参数陷阱
- **核心风险**:
  1. 官方 `@tonconnect/ui` 的 `walletsListConfiguration` 只接收 `{ includeWallets: UIWallet[] }`，传入 `walletsListUrl` 会被静默忽略；
  2. 忽略后 SDK 会向 `https://raw.githubusercontent.com/.../wallets-v2.json` 发起请求，在移动弱网或受限网络下必触发超时；
  3. 请求失败后 SDK 退化为硬编码极简列表（往往只保留 Tonkeeper），导致 Telegram Wallet、OKX、Bitget 等全线消失。
- **防御铁律**:
  - 项目静态资源预置 `LOCAL_WALLETS` 镜像，显式通过 `walletsListConfiguration={{ includeWallets: LOCAL_WALLETS }}` 注入；
  - 界面提供显式【换钱包】按钮，通过先 `disconnect()` 后 `openModal()` 破除 Session 锁定。

## 9. 拉起钱包前串行阻塞 RPC 调用与按钮死锁陷阱
- **核心风险**:
  点击支付/铸造后，若在拉起钱包前串行请求 `getContractState`、`getGetCurrentPrice`，一旦网络抖动或 RPC 429 限流，钱包尚未唤醒界面即进入假死状态。
- **防御铁律**:
  - 本地离线 0ms 组装 BOC 消息载荷（`beginCell().storeUint(...).endCell().toBoc().toString('base64')`），直接唤醒 TonConnect；
  - 交易状态采用异步状态机解耦，后台容错轮询链上出块，并提供秒级取消复位机制。

## 10. 客户端多消息分账在移动端钱包中的闪退与兼容性陷阱
- **核心风险**:
  部分移动端钱包（如 Telegram Wallet `@wallet` 或旧版 Web3 钱包）对单笔交易包含多条消息（`messages: [...]` 数组长度 > 1）支持极差，容易静默丢失消息或直接抛出签名失败异常。
- **防御铁律**:
  - 优先在智能合约层面设计分账（Payment Splitter），前端保持单笔消息交互；
  - 客户端多消息必须嗅探钱包环境并提供降级单笔通道。

## 11. SEAL 911 前端反钓鱼与多节点 RPC 熔断灾备标准 (Anti-Hijack & Failover Pool)
- **核心风险**:
  1. 单一公有 RPC 节点（如 Toncenter）常因流量尖峰遭遇 HTTP 429 限流或 DNS 污染，导致用户交易提交后因查不到链上状态而重复扣款；
  2. 钓鱼与仿冒合约地址风险：前端直接展示用户传入的外部目标地址，未经过正规校验导致攻击者构造同形混淆（Homoglyph）字符串窃取资金。
- **防御铁律**:
  - 前端 RPC 层必须封装竞速与熔断重试（Fallback Pool）：
    配置至少 2~3 个异构节点（如 Toncenter + Orbs L2 + GetBlock / TonAPI），主节点超时 > 3.0s 或抛出 429 时无缝切换备用节点；
  - 涉及打赏与转账目标地址时，前端强制经过 `Address.parseFriendly(raw)` 统一验证并转为规范的 `UQ...` 格式展示；
  - 严禁在浏览器端暴露任何私钥、助记词或未脱敏的服务端 Secret Key。
