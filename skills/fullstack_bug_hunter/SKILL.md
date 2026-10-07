---
name: fullstack_bug_hunter
description: 全栈代码法医 (Fullstack Code Forensic)。面向现代 Web3/DApp、移动端 Safari/WebView/PWA 与微服务的病理级深层缺陷排查与自愈中枢。融合 Web3/TON 链上资金陷阱、Safari 视口与手势剪贴板沙箱缺陷、React 并发竞态、多语言 Key 100% 对齐与 250 行小文件单一职责铁律。
triggers:
  - 全栈代码法医
  - 代码法医
  - 法医
  - bug_hunt
  - bug_audit
  - find_bugs
  - check_bugs
  - 检查bug
  - 找bug
  - 排查bug
  - 找暗坑
  - 代码审计
---

# 全栈代码法医 (FullStack Code Forensic / Bug Hunter)

## 概述
全栈代码法医 (FullStack Code Forensic) 是面向现代高可用 Web3、移动端 WebApp/PWA 与微服务的病理级 Bug 深度排查与自愈中枢。本技能汲取了业内顶级安全审计经验（Slither、SlowMist Web3 安全规范、SEAL 安全联盟、Semgrep 启发式规则），并深度整合了我们在生产环境沉淀的 6 大核心缺陷维度，提供由静态 AST 扫描到动态运行时验证的全链路审计规范。

---

## 核心排查工具与参考资产

### 1. 自动化全量分析与验收中枢
- **启发式缺陷扫描器**: [bug_scanner.py](./scripts/bug_scanner.py) (AST / 正则双层启发式扫描，支持 `--staged` 增量与 `--fix` 自愈)
- **语义级污点流向分析器 (CodeQL-Inspired)**: [taint_analyzer.py](./scripts/taint_analyzer.py) (从 Storage / URL / RPC 污染源追踪至 Parse / BigInt / 异步 State / DOM XSS 致死汇，支持 `--staged`)
- **手术刀式自愈引擎**: [auto_fixer.py](./scripts/auto_fixer.py) (高置信度暗坑自动重构修复与补丁预演，严格守护 250 行小文件红线)
- **Git Pre-Commit 门禁安装器**: [install_hook.sh](./scripts/install_hook.sh) (一键为工程注入 `<10ms` 增量提交审查守卫)
- **多语言 Key 对齐自动化探针**: [i18n_parity_checker.py](./scripts/i18n_parity_checker.py) (基准字典拓扑对齐与插值占位符一致性核查)
- **四步全量回归与验收守卫**: [verify_fix.sh](./scripts/verify_fix.sh) (支持全量扫描、`--staged` 增量、`--fix` 自动自愈与 `--install-hook`)

### 2. 核心检测规则库 (Rules Matrix)
- **Web3 & 链上资产安全**:
  - `RULE-W3-01`: BigInt 浮点数与科学计数法转换截断异常
  - `RULE-W3-02`: TON/加密货币原始字符串地址 `===` 直接比对陷阱
  - `RULE-W3-03`: 用户打赏/转账目标地址硬编码 `bounceable: true` 导致未初始化新钱包资金回弹
  - `RULE-W3-04`: TonConnect 2.0 签名验签摘要构造与 `'ton-safe-sign-magic'` 混用及伪签名放行漏洞
  - `RULE-W3-05`: 变量未经 try/catch 强转 `BigInt()` 遭遇非数字字符串导致运行时崩溃
  - `RULE-W3-06`: TonConnect UI 配置依赖 `walletsListUrl` 无效参数及 GitHub Raw 超时导致钱包选单退化只剩 Tonkeeper
  - `RULE-W3-07`: 拉起钱包前串行阻塞调用 RPC 导致的界面假死与按钮死锁
  - `RULE-W3-08`: TonConnect 移动端长连接 Session 锁定导致无法自选/切换其他钱包
  - `RULE-W3-09`: 客户端多消息分账（Multi-message）在 Telegram Wallet 等移动端环境遭遇签名不支持/闪退陷阱
  - `RULE-W3-10`: 硬编码单一第三方公有 RPC 节点缺乏容灾熔断降级池（HTTP 429 故障陷阱）
  - `RULE-W3-11`: TON 原始 Raw (0:...) 与 Bounceable (EQ...) 地址直用 `===` 字符串比对导致误判失败
- **移动端 Safari / WebKit / Telegram Mini App**:
  - `RULE-MOB-01`: iOS Safari/WebKit 异步 `await` 导致剪贴板用户手势凭据失效
  - `RULE-MOB-02`: 移动端 WebView/Telegram 环境直调非 Universal 自定义协议导致白屏崩溃
  - `RULE-MOB-03`: 原生 `alert()`/`confirm()` 阻塞事件循环与冻结主线程
  - `RULE-MOB-04`: 粗暴使用 `document.body.style.touchAction = 'none'` 导致移动端手势死锁
  - `RULE-MOB-05`: 离屏生成海报或复制 DOM 置于 `-9999px` 遭遇 WebKit 视口裁剪黑屏或视口跳动陷阱
  - `RULE-MOB-06`: 未受控调用 `URL.createObjectURL` 且缺少 `URL.revokeObjectURL` 导致的内存泄漏
  - `RULE-MOB-07`: 裸调 `navigator.clipboard.writeText` 缺少 DOM 选区安全降级与 catch 捕获
  - `RULE-MOB-08`: 裸调 `navigator.vibrate` 在 iOS Safari / WebKit 抛错或静默失效
- **系统安全与数据防泄露 (Security & Secrets)**:
  - `RULE-SEC-01`: 裸调 `JSON.parse(storage.getItem)` 缺少结构校验与迁移守卫（老缓存白屏陷阱）
  - `RULE-SEC-02`: 本地 Storage 存储未加密助记词或私钥明文（P0 资金泄露陷阱）
  - `RULE-SEC-03`: `postMessage` 监听器未做 `event.origin` 来源域名校验
- **React 状态机与架构规范**:
  - `RULE-RCT-01`: 动态可变/可排序列表使用 `key={index}` 导致虚拟 DOM 复用错乱
  - `RULE-RCT-02`: 未经 DOMPurify 脱敏的 `dangerouslySetInnerHTML` XSS 注入
  - `RULE-RCT-03`: 弹窗未受控挂载 `history.pushState` 导致的物理返回键死锁
  - `RULE-RCT-04`: `useEffect` 内监听器或定时器缺少 `return` 清理导致的内存泄露
  - `RULE-RCT-05`: 表单编辑态数组过滤导致的下拉选择框槽位塌缩错位 (Array Shift Glitch)
  - `RULE-RCT-06`: 复杂表单选择器与可变插槽空过滤导致索引塌缩错位
  - `RULE-ARCH-01`: 单文件超出 250 行阈值违规（小文件单一职责标准）
- **数据流与污点追踪规则 (Taint Flows)**:
  - `TAINT-STORAGE-PARSE`: 存储不可信数据流入无防护 `JSON.parse`
  - `TAINT-BIGINT-CAST`: 外部/不可信变量流入无 try/catch 的 `BigInt`
  - `TAINT-URL-REDIRECT`: URL 查询参数直接流入 `window.location.href` 或 `window.open`
  - `TAINT-ASYNC-RACE`: 异步网络请求在 `useEffect` 中流入未挂载防护的 `setState`
  - `TAINT-XSS-DOM`: 外部表达式直接流入未脱敏的 `dangerouslySetInnerHTML`
  - `TAINT-POSTMESSAGE-ORIGIN`: 未核验 Origin 的跨窗口通信流入消息处理逻辑
  - `TAINT-STORAGE-SECRET`: 敏感凭据/私钥流入浏览器本地持久化存储

### 3. 专项缺陷排查参考矩阵 (Progressive Disclosure)
- [Web3 & TON 公链交互缺陷矩阵](./references/web3_ton_matrix.md)
- [移动端 Safari、PWA 与 Telegram WebApp 运行环境缺陷矩阵](./references/mobile_webview_matrix.md)
- [React 18/19 并发渲染、状态机竞态与架构陷阱矩阵](./references/react_concurrency_matrix.md)
- [安全防御与数据流污点追踪矩阵](./references/security_taint_matrix.md)

---

## 六阶段系统化排查标准 SOP (6-Phase Audit SOP)

### 阶段一：自动化启发式扫描与增量门禁 (Static Heuristic & Incremental Audit)
针对目标工程目录运行缺陷扫描器，获取首批潜在威胁报告：
```bash
# 1. 全量扫描指定工程目录
python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py <target_path> --skip-data

# 2. 暂存区增量门禁扫描（毫秒级，仅审查本次 git add 的文件）
python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py <target_path> --staged

# 3. 手术刀式一键自动修复高频暗坑
python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py <target_path> --fix
# 或预演修复 Diff 补丁
python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/bug_scanner.py <target_path> --dry-run
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
1. **多语言字典 100% 对齐自动化核查**:
   - 运行专用多语言探针，杜绝字段缺失导致卡片空白或静默回退中文：
   ```bash
   python3 /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/i18n_parity_checker.py <target_path>
   ```
2. **UI 占位符与底层过滤对齐**:
   - 校验搜索框 Placeholder 所承诺的检索字段是否全部在过滤回调（如 `posts.filter`）中得到了实现；
3. **网络与接口降级容灾**:
   - 针对图片、IPFS 网关与外部 RPC，必须具备多网关竞速或自动 Fallback 机制（如 Pinata -> dweb -> cloudflare-ipfs）。

### 阶段六：修复验证与防退化验收 (Remediation & Regression Verification)
1. **一键自动化全流程回归校验**:
   ```bash
   # 全量回归验证 (4 步完整流水线)
   bash /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/verify_fix.sh <target_path>

   # 暂存区增量回归验证
   bash /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/verify_fix.sh <target_path> --staged

   # 一键为项目安装 Git Pre-Commit 拦截门禁
   bash /Users/hi/.agents/skills/fullstack_bug_hunter/scripts/verify_fix.sh <target_path> --install-hook
   ```
   - **Step 1/4**: 运行 `bug_scanner.py`（确保 CRITICAL / HIGH 启发式违规清零）；
   - **Step 2/4**: 运行 `taint_analyzer.py`（确保不可信污点流向与未防护异步状态竞态清零）；
   - **Step 3/4**: 运行 `i18n_parity_checker.py`（确保所有语系字典 Key 与参数 100% 对齐）；
   - **Step 4/4**: 执行 `npm run build`（确保 TypeScript 类型编译与前端产物 0 错误）。
2. **小文件原则审查**: 检查所有变更业务代码文件，必须严格恪守 `<= 250` 行小文件标准（`RULE-ARCH-01`）。
