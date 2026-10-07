# 全栈代码法医 · 安全防御与数据流污点追踪矩阵 (Security & Taint Analysis Matrix)

> **定位**：汲取 GitHub CodeQL、Semgrep、OWASP Top 10 与 SEAL 911 Web3 安全联盟规范，系统化沉淀前端、移动端 WebView 与 DApp 全生命周期的高危安全缺陷与病理级数据流向漏洞。

---

## 一、不可信持久化存储流入 JSON.parse 崩溃漏洞 (`RULE-SEC-01` / `TAINT-STORAGE-PARSE`)

### 1. 病理机理
`localStorage` 或 `sessionStorage` 中的字符串直接送入 `JSON.parse`。一旦用户由于跨版本升级导致老缓存格式残留、缓存被意外置空为 `undefined`、或用户手动篡改缓存，`JSON.parse()` 将抛出未捕获的 `SyntaxError`，导致整个 React 组件树崩溃白屏。

### 2. 致命代码 vs 法医级修复
```typescript
// ❌ 致命隐患：老用户老缓存格式不匹配直接白屏
const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');

// ✅ 法医级防御：安全卫语句与模式降级
let userProfile = null;
try {
  const raw = localStorage.getItem('user_profile');
  userProfile = raw ? JSON.parse(raw) : null;
} catch (e) {
  console.warn('[Forensic] Corrupted storage payload, clearing key:', e);
  localStorage.removeItem('user_profile');
}
```

---

## 二、浏览器存储明文助记词/私钥致命泄露漏洞 (`RULE-SEC-02` / `TAINT-STORAGE-SECRET`)

### 1. 病理机理
Web3 DApp 在本地无加密存储用户的助记词 (Mnemonic / Seed Phrase) 或私钥 (Private Key)。浏览器扩展（恶意外挂插件）、XSS 漏洞或共享设备可直接通过 `localStorage.getItem` 批量盗取明文私钥，导致用户钱包链上资产瞬间清空。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ P0 资金毁灭陷阱：明文存储私钥
localStorage.setItem('mnemonic', userMnemonic);
localStorage.setItem('private_key', secretKeyHex);

// ✅ 法医级防御：零私钥原则 (Zero-Secret Principle)
// 1. 强制使用 TonConnect / Tonkeeper 等外部硬件/系统钱包离线签名，DApp 永不触碰私钥；
// 2. 若为本地托管临时 Session 凭据，强制使用 Web Crypto API (AES-GCM 256) 与 PBKDF2 密码派生加密存储。
```

---

## 三、跨窗口 postMessage 未做 Origin 校验劫持漏洞 (`RULE-SEC-03` / `TAINT-POSTMESSAGE-ORIGIN`)

### 1. 病理机理
在 Telegram WebApp、iframe 嵌入式支付或第三方登录弹窗中，通过 `window.addEventListener('message', handler)` 接收数据，未校验 `event.origin`。任意第三方恶意网站可通过 `iframe.contentWindow.postMessage` 向目标窗口投递伪造数据包，实施假充值、篡改支付地址或触发高危执行。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ 致命漏洞：信任全网任意窗口消息
window.addEventListener('message', (event) => {
  if (event.data.type === 'PAYMENT_SUCCESS') {
    grantUserVip(event.data.userId);
  }
});

// ✅ 法医级防御：严格的白名单域名核查
const TRUSTED_ORIGINS = new Set([
  'https://obs.xiaojiucai.pro',
  'https://toncenter.com',
  'https://t.me'
]);

window.addEventListener('message', (event) => {
  if (!TRUSTED_ORIGINS.has(event.origin)) {
    console.warn('[Forensic Security] Blocked untrusted message from origin:', event.origin);
    return;
  }
  if (event.data?.type === 'PAYMENT_SUCCESS') {
    grantUserVip(event.data.userId);
  }
});
```

---

## 四、外部/未受控变量强转 BigInt 崩溃陷阱 (`RULE-W3-05` / `TAINT-BIGINT-CAST`)

### 1. 病理机理
JavaScript 原生 `BigInt()` 无法解析含有小数点、科学计数法或非纯数字字符的字符串。一旦传入 `"100.5"` 或 `"1e9"`，JavaScript 线程抛出 `SyntaxError: Cannot convert to a BigInt`，直接中断后续出块或结算逻辑。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ 致命隐患：用户输入或 URL 参数带小数直接引发未捕获崩溃
const amount = BigInt(paramAmount);

// ✅ 法医级防御：格式校验与安全定点移位
function safeToNano(amountStr: string, decimals: number = 9): bigint {
  try {
    const clean = amountStr.trim();
    if (!/^\d+(\.\d+)?$/.test(clean)) return 0n;
    const [intPart, fracPart = ''] = clean.split('.');
    const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(intPart + paddedFrac);
  } catch (_) {
    return 0n;
  }
}
```

---

## 五、URL 查询参数直接流入导航致死汇 (`TAINT-URL-REDIRECT`)

### 1. 病理机理
从 `URLSearchParams` 或 `location.hash` 提取参数（如 `redirect_url`、`target`），直接赋值给 `window.location.href` 或 `window.open`。可被攻击者利用伪造 `javascript:alert(1)`、`data:text/html,...` 或私有客户端协议造成 WebView 假死、白屏或开放重定向钓鱼。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ 致命隐患：开放重定向或 scheme 崩溃
const redirect = new URLSearchParams(window.location.search).get('return_to');
if (redirect) window.location.href = redirect;

// ✅ 法医级防御：严格协议白名单校验
const redirect = new URLSearchParams(window.location.search).get('return_to');
if (redirect && (redirect.startsWith('https://') || redirect.startsWith('/'))) {
  window.location.href = redirect;
} else {
  window.location.href = '/';
}
```

---

## 六、未脱敏表达式流入 innerHTML 导致 DOM-XSS (`RULE-RCT-02` / `TAINT-XSS-DOM`)

### 1. 病理机理
将用户昵称、留言、链上 Remark 备注通过 `dangerouslySetInnerHTML={{ __html: content }}` 渲染至页面，若未通过 `DOMPurify.sanitize()` 脱敏，攻击者可注入 `<img src=x onerror=...>` 执行任意恶意脚本，窃取用户 Session。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ 致命隐患：DOM-XSS 注入
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ 法医级防御：DOMPurify 脱敏或原生文本节点
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

---

## 七、异步网络请求跨微任务更新已卸载组件状态 (`TAINT-ASYNC-RACE`)

### 1. 病理机理
在 `useEffect` 中发起网络请求或异步 Canvas 渲染，在 Promise 决议之前用户切换路由或关闭模态框。当 Promise 回调执行时，组件早已卸载，导致：
1. 控制台报 React 内存泄露警告；
2. 脏数据被写入闭包引发幽灵状态；
3. 大对象（如 Canvas 像素 Blob）无法被 V8 垃圾回收导致 OOM。

### 2. 致命代码 vs 法医级防御
```typescript
// ❌ 致命隐患：组件卸载后依然调用 setState
useEffect(() => {
  fetchUserData().then(data => setUser(data));
}, [userId]);

// ✅ 法医级防御：成对 isMounted 守卫或 AbortController
useEffect(() => {
  let isMounted = true;
  fetchUserData().then(data => {
    if (isMounted) setUser(data);
  });
  return () => {
    isMounted = false;
  };
}, [userId]);
```
