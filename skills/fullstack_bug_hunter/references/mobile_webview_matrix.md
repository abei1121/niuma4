# 移动端 Safari、PWA 与 Telegram WebApp 运行环境缺陷排查矩阵 (Mobile & WebView Matrix)

## 1. 异步等待导致的剪贴板手势凭证失效 (Transient Activation Loss)
- **核心风险**: iOS Safari / WebKit 对 `navigator.clipboard.writeText` 实施了严格的用户激活凭据（User Gesture Token）保护。
- **致命陷阱**: 一旦在手势点击事件中出现 `await asyncFunction()` 或网络请求，当异步任务 resolve 时，浏览器的手势有效时间窗口（Transient Activation）已经过期！此时执行 `navigator.clipboard.writeText` 将直接抛出 `NotAllowedError: The request is not allowed by the user agent or the platform in the current context`。
- **防御铁律**:
  - 剪贴板复制必须在用户触摸/点击回调的**同步微任务轮次**内立即触发；
  - 若必须等待服务端生成内容，必须前置占位复制或提供二次轻触按钮；
  - 必须包裹降级方案：创建隐藏 `<textarea>` 并调用 `document.execCommand('copy')`。

## 2. 自定义 URL Scheme (`xxx://`) 崩溃与 WebView 沙箱拦截陷阱
- **核心风险**: 在 Telegram 内置浏览器（In-App Browser）、微信内置 WebView 或 iOS Safari 中，直接给 `window.location.href` 赋值未安装应用的原生 Scheme（如 `ton://`、`tonkeeper://`、`weixin://`、`snssdk1128://`），会触发白屏报错页或阻断整个页面导航。
- **防御铁律**:
  - 优先使用 Universal Links（通用链接，如 `https://app.tonkeeper.com/...`、`https://t.me/...`）。
  - 在 Telegram Mini App 环境下，强制调用官方 API：`window.Telegram.WebApp.openLink(url)`。
  - 纯网页环境调起 App 时，封装隐藏 iframe 探针或安全跳转包裹函数 `openWebUrlSafely`，严禁在未确认安装时直接覆盖顶层 window location。

## 3. History 历史记录栈膨胀与 Android 物理返回键死锁陷阱
- **核心风险**: 移动端和 PWA 依靠 `window.history.pushState` 拦截 Android 物理返回键以关闭弹窗。当多个弹窗连续打开，或者弹窗关闭时调用 `history.back()` 与用户的物理返回动作产生竞态，会导致历史记录栈重复推入或多次回退死锁。
- **防御铁律**:
  - 弹窗历史守护统一使用单一定位标识（如 `{ xgModalOpen: true }`）；
  - 打开弹窗时仅 push 一次；关闭弹窗时判断如果是代码触发，则执行一次 `history.back()`，若是 `popstate` 触发则只需清除组件状态，严禁在 `popstate` 内部再次调用 `history.back()`。

## 4. 视口 100vh 与软键盘弹起布局断裂陷阱
- **核心风险**: 在 iOS Safari 和 Android 移动端，`100vh` 包含了底部虚拟控制栏的高度，导致固定在底部的按钮被遮挡。当用户点击输入框唤醒软键盘时，WebView 会被压缩，导致背景图变形或元素脱离视口。
- **防御铁律**:
  - 容器尺寸优先使用现代 CSS 的 `100dvh` (Dynamic Viewport Height) 替代传统的 `100vh`；
  - 弹窗底部使用 `padding-bottom: env(safe-area-inset-bottom, 16px)` 保障全面屏下巴安全区。

## 5. 原生阻塞型弹窗 (alert/confirm/prompt) 冻结事件循环陷阱
- **核心风险**: 移动端 WebApp 中调用原生的 `alert()`、`confirm()` 会挂起 JavaScript 主线程与渲染管线。在 Telegram WebApp 或全屏 PWA 下，原生弹窗不仅视觉风格割裂，还会导致音视频解码停滞或页面卡死。
- **防御铁律**:
  - 全局拔除所有 `alert()` 与 `confirm()`。
  - 统一采用轻量级自定义 React 提示模态框或优雅的 Toast 浮层。

## 6. Telegram WebApp (TMA) 外部钱包签名锁死与 `tonProof` 穿透
- **核心风险**: 在 Telegram Mini App 环境中，部分前端代码检测到 `window.Telegram?.WebApp` 存在时，错误地跳过了 `tonProof` 的 payload 设定（例如传 `{ state: 'ready', value: {} }`）。这会导致用户在 TMA 内使用外部钱包（如 Tonkeeper、MyTonWallet）连接时，钱包无法弹窗请求签名，使高权限用户/管理员永远停留在只读的“观察模式”，无法获得管理会话 Token。
- **防御铁律**:
  - 无论是否处于 TMA 环境，`useTonProof` 或 TonConnect 初始化时必须无差别提供 `{ tonProof: nonce }`；
  - 链接跳转必须封装安全跳板：优先使用 `Telegram.WebApp.openTelegramLink` 处理内部频道/机器人，使用 `Telegram.WebApp.openLink` 处理外部网页，非 TMA 环境回退至 `window.open`。

## 7. iOS WebKit `touchAction: none` 破坏性滚动穿透陷阱
- **核心风险**: 为防止模态框底层页面滚动，开发者有时直接在 `body` 或顶层容器设置 `document.body.style.touchAction = 'none'`。在 iOS Safari / WebKit 内核中，这会破坏手势识别事件链，导致弹窗关闭后全站页面无法恢复上下手势滑动，甚至造成页面死锁冻结。
- **防御铁律**:
  - 严禁通过 `touchAction = 'none'` 锁定移动端页面滚动；
  - 正规防滚动穿透方案：在模态框挂载时设置 `document.body.style.overflow = 'hidden'`，并在组件卸载或关闭回调中严格清除该内联样式；
  - 移动端弹窗必须通过 React 绑定 Telegram 物理返回键（`Telegram.WebApp.BackButton`），确保用户使用手势后退时能自然关闭当前弹窗。
