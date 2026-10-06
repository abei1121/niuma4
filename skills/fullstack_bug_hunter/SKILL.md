---
name: fullstack_bug_hunter
description: 全栈深层缺陷与隐蔽 Bug 自动化审计中枢。融合 GitHub 前沿静态分析启发式规则、Web3/TON 公链陷阱（Bounceable/BigInt/地址标准化）、移动端 Safari/WebView/PWA 沙箱缺陷、React 并发状态竞态、Popstate 历史记录栈防死锁与小文件单一职责规范。
triggers:
  - bug_hunt
  - bug_audit
  - find_bugs
  - check_bugs
  - 检查bug
  - 找bug
  - 排查bug
  - 代码审计
---

# 全栈深层缺陷与隐蔽 Bug 自动化审计中枢 (FullStack Bug Hunter)

## 概述
FullStack Bug Hunter 是面向现代高可用 Web3、移动端 WebApp/PWA 与微服务的系统化 Bug 深度排查与自愈中枢。本技能汲取了业内顶级安全审计经验（Slither、SlowMist Web3 安全规范、SEAL 安全联盟、Semgrep 启发式规则），并深度整合了我们在生产环境沉淀的 6 大核心缺陷维度，提供由静态 AST 扫描到动态运行时验证的全链路审计规范。

---

## 核心排查工具与参考资产

### 1. 自动化启发式缺陷扫描器
- **执行脚本**: [bug_scanner.py](./scripts/bug_scanner.py)
- **支持规则集**:
  - `RULE-W3-01`: BigInt 浮点数与科学计数法转换截断异常
  - `RULE-W3-02`: TON/加密货币原始字符串地址 `===` 直接比对陷阱
  - `RULE-W3-03`: 用户打赏/转账目标地址硬编码 `bounceable: true` 导致未初始化新钱包资金回弹
  - `RULE-W3-04`: TonConnect 2.0 签名验签摘要构造与 `'ton-safe-sign-magic'` 混用及伪签名放行漏洞
  - `RULE-W3-05`: 变量未经 try/catch 强转 `BigInt()` 遭遇非数字字符串导致运行时崩溃
  - `RULE-W3-06`: TonConnect UI 配置依赖 `walletsListUrl` 无效参数及 GitHub Raw 超时导致钱包选单退化只剩 Tonkeeper
  - `RULE-W3-07`: 拉起钱包前串行阻塞调用 RPC 导致的界面假死与按钮死锁（强制 0ms 本地离线 BOC 构建与异步后台出块追踪）
  - `RULE-W3-08`: TonConnect 移动端长连接 Session 锁定导致无法自选/切换其他钱包（强制显式换钱包解绑与重新呼起通道）
  - `RULE-W3-09`: 客户端多消息分账（Multi-message）在 Telegram Wallet (`@wallet`) 等移动端环境遭遇签名不支持/闪退陷阱
  - `RULE-MOB-01`: iOS Safari/WebKit 异步 `await` 导致剪贴板用户手势凭据失效
  - `RULE-MOB-02`: 移动端 WebView/Telegram 环境直调非 Universal 自定义协议导致白屏崩溃
  - `RULE-MOB-03`: 原生 `alert()`/`confirm()` 阻塞事件循环与冻结主线程
  - `RULE-MOB-04`: 粗暴使用 `document.body.style.touchAction = 'none'` 导致移动端手势死锁
  - `RULE-MOB-05`: 离屏生成海报时元素置于 `-9999px` 遭遇 WebKit 视口裁剪导致黑屏/空白画布
  - `RULE-MOB-06`: 未受控调用 `URL.createObjectURL` 且缺少 `URL.revokeObjectURL` 导致的内存泄漏
  - `RULE-CI-01`: Cloudflare Pages / Vercel Tailwind v4 构建缺少 `.nvmrc` Node 20 锁文件
  - `RULE-RCT-01`: 动态可变/可排序列表使用 `key={index}` 导致虚拟 DOM 复用错乱
  - `RULE-RCT-02`: 未经 DOMPurify 脱敏的 `dangerouslySetInnerHTML` XSS 注入
  - `RULE-RCT-03`: 弹窗未受控挂载 `history.pushState` 导致的物理返回键死锁
  - `RULE-RCT-04`: `useEffect` 内监听器或定时器缺少 `return` 清理导致的内存泄露
  - `RULE-RCT-05`: 表单编辑态数组过滤导致的下拉选择框槽位塌缩错位 (Array Shift Glitch)
  - `RULE-ARCH-01`: 单文件超出 250 行阈值违规（小文件单一职责标准）

### 2. 专项缺陷排查参考矩阵 (Progressive Disclosure)
- [Web3 & TON 公链交互缺陷矩阵](./references/web3_ton_matrix.md)
- [移动端 Safari、PWA 与 Telegram WebApp 运行环境缺陷矩阵](./references/mobile_webview_matrix.md)
- [React 18/19 并发渲染、状态机竞态与架构陷阱矩阵](./references/react_concurrency_matrix.md)

---

## 六阶段系统化排查标准 SOP (6-Phase Audit SOP)

### 阶段一：自动化启发式扫描 (Automated Static Heuristic Scan)
针对目标工程目录运行缺陷扫描器，获取首批潜在威胁报告：
```bash
# 扫描指定工程目录（例：rawxiaojiucai）
python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py /Users/hi/niuma/projects/rawxiaojiucai --skip-data
```
- 检查是否存在 `CRITICAL` 或 `HIGH` 级别的阻断性异常；
- 统计是否有业务文件突破 250 行的小文件规范红线。

### 阶段二：Web3 与链上资金安全核查 (Web3 Protocol & Asset Safety Audit)
1. **转账与打赏目标地址规范**:
   - 检查所有向外转账、打赏调起逻辑（如 Tonkeeper / TonConnect），目标地址是否强制声明为非反弹格式 (`bounceable: false` / `UQ...`)，绝不能将新创建未发交易的空钱包打赏资金弹回；
2. **BigInt 运算与定点数精度**:
   - 检查所有代币单位转换（TON -> nanoTON、Decimals 计算），严禁使用浮点数直接送入 `BigInt()`，必须使用官方 `toNano()` 或字符串安全左移；
3. **地址相等性比对**:
   - 严禁对两串字符串地址直接使用 `===`，必须使用统一的 `isAddressEqual(addrA, addrB)` 处理 Hex、EQ、UQ 互通；
4. **TEP-64 备注与 Payload 格式**:
   - 链上转账带有用户备注时，前 32 位必须显式补 0 (`storeUint(0, 32)`)；
5. **NFT 持仓动态验权与打赏通道三位一体防击穿标准**:
   - 打赏通道展示必须严格绑定目标地址链上 NFT 持仓状态。全网瀑布流卡片、点击放大灯箱浮层（Lightbox）与打赏弹窗本体（Modal）必须三位一体联合管控，严禁在灯箱浮层无脑暴露打赏按钮；
   - 链上地址统一采用小写 Raw Hex (`0:xxx`) 归一化作为唯一缓存 Key，配合正向 7 天、负向 10 分钟的冷热缓存和 In-flight 去重机制。

### 阶段三：移动端 WebView、Safari 与 PWA 沙箱核查 (Mobile Sandbox Audit)
1. **剪贴板用户手势生命周期**:
   - 检查 `navigator.clipboard.writeText` 是否紧随用户轻触或点击事件触发，严禁在其前置插入 `await` 异步网络请求；必须配备 `document.execCommand('copy')` 兜底；
2. **外部协议与客户端唤醒**:
   - 严禁使用 `window.location.href = 'xxx://'` 强制跳转；必须优先采用 Universal Links，或封装安全沙箱跳出函数（通过隐藏 iframe 或在 Telegram 中调用 `window.Telegram.WebApp.openLink`）；
3. **消除阻塞式原生弹窗**:
   - 彻底清除所有 `alert()`、`confirm()`、`prompt()`，换用非阻塞 React 模态框或 Toast；
4. **离屏画布生成与视口裁剪防黑屏**:
   - 海报截图 DOM 严禁置于 `-9999px`，必须置于视口内不可见层 (`left: 0, top: 0, opacity: 0.01, zIndex: -100`)，防止 WebKit 裁剪合成层导致生成黑屏/空白画布；
5. **内存泄漏与对象 URL 规范**:
   - 只要使用 `URL.createObjectURL` 生成预览图，必须在重新选图、提交完成以及组件卸载生命周期内成对调用 `URL.revokeObjectURL`，杜绝移动端 OOM 崩溃。

### 阶段四：React 状态机、多层弹窗与并发竞态核查 (State & Concurrency Audit)
1. **编辑态槽位防塌缩错位 (Slot Anti-Shift)**:
   - 表单多项配置（如多下拉框部位设定）在编辑态严禁直接调用 `filter` 剔除空值导致数组长度缩短和槽位塌缩错位，必须保持槽位索引绝对稳定，仅在保存时清洗；
2. **模态框平级解耦与防穿透**:
   - 顶级弹窗必须平级受控挂载于根节点，子组件按钮必须阻止事件冒泡 (`e.stopPropagation()`)，防止点击卡片与点击操作按钮引发弹窗重叠冲突；
2. **History 栈与返回键看门狗**:
   - 弹窗接入 `history.pushState` 必须有成对的 `popstate` 监听，组件卸载时必须安全回收标记，杜绝物理返回键造成应用卡死；
3. **Effect 资源回收**:
   - 检索组件内的所有 `setInterval`、`setTimeout`、`addEventListener`，必须具备 `return () => cleanup`。

### 阶段五：功能契约与数据边界一致性核查 (Contract & Boundary Audit)
1. **UI 占位符与底层过滤对齐**:
   - 校验搜索框 Placeholder 所承诺的检索字段是否全部在过滤回调（如 `posts.filter`）中得到了实现；
2. **多语言字典全覆盖**:
   - 检查所有语言文件（中简、中繁、中港、英等）的 Key 是否 100% 对齐，杜绝页面切换语言时出现 `undefined` 字段；
3. **网络与接口降级容灾**:
   - 针对图片、IPFS 网关与外部 RPC，必须具备多网关竞速或自动 Fallback 机制（如 Pinata -> dweb -> cloudflare-ipfs）。

### 阶段六：修复验证与防退化验收 (Remediation & Regression Verification)
1. 修复后再次执行扫描器，确认漏洞数量清零：
   ```bash
   python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py <target_path> --skip-data
   ```
2. 执行前端构建与类型检查（在 Mac 本地极速校验）：
   ```bash
   npm run build
   ```
3. 检查变更代码是否严格遵守 `< 250` 行小文件标准。
