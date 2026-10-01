# React 18/19 并发渲染、状态机竞态与架构陷阱矩阵 (React & Architecture Matrix)

## 1. 顶层多弹窗平级挂载与 Z-Index 竞态 (Modal Anti-Race Condition)
- **核心风险**: 当子组件内部直接嵌套挂载了全屏模态框（如打赏弹窗、VIP 验证弹窗、联系方式弹窗），在事件冒泡或父子状态切换时，会出现两个弹窗同时点亮、相互遮挡、背景暗度重叠导致死锁。
- **防御铁律**:
  - 全局顶层弹窗必须**平级独立挂载**于根组件或主控制层受控状态（如 `App.tsx` 或 `DoubleDoorClub.tsx`）；
  - 子组件交互只触发 `onOpenModal(type, payload)` 状态回调；
  - 子卡片上的按钮事件必须显式附加 `e.stopPropagation()`，彻底切断卡片点击穿透。

## 2. 副作用未清理与卸载组件内存泄露 (Uncleaned Effect & State Leak)
- **核心风险**: 在 `useEffect` 中挂载了 `addEventListener`、`setInterval`、`setTimeout` 或异步网络请求，若未在 return 闭包中执行 `removeEventListener` 或清除定时器，在组件卸载后回调仍然执行，会导致内存持续泄漏以及 React "Can't perform a React state update on an unmounted component" 警告。
- **防御铁律**:
  - 每一个在 `useEffect` 中注册的监听或定时器必须有对应的清理回调：
  ```tsx
  useEffect(() => {
    const handleResize = () => { ... };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  ```
  - 异步请求必须配备 `isMounted` 标志位或 `AbortController`。

## 3. 动态列表 key={index} 导致的 DOM 复用状态错乱陷阱
- **核心风险**: 当列表包含过滤、排序、增删操作时，使用数组索引 `key={index}` 会让 React 的虚拟 DOM Diff 算法误以为节点未改变，导致输入框内容错位、复选框勾选状态混淆、组件动画重绘异常。
- **防御铁律**:
  - 必须使用业务唯一持久标识符（如 `item.id`、`item.hash`、`item.wallet`）作为 `key`；
  - 仅在完全静态、无增删排序、纯展示标签数组时才允许使用 index。

## 4. UI 占位符承诺与底层过滤逻辑脱节 (Search & Filter Mismatch)
- **核心风险**: 输入框的 Placeholder 宣称支持多维度检索（例如“搜索 UID / 钱包 / 平台账号 / 宣言”），但底层 `posts.filter()` 代码中仅编写了 `p.platformId.includes(kw)`，造成用户输入其他宣称字段时搜不到结果的“伪 Bug”。
- **防御铁律**:
  - 搜索逻辑必须 100% 覆盖 UI Placeholder 承诺的所有检索维度；
  - 字符串匹配前统一执行 `toLowerCase().trim()` 并剔除空指针防御。

## 5. 小文件单一职责标准 (< 250 行铁律)
- **核心风险**: 单文件一旦超过 250 行，其状态分支与副作用呈指数级增长，开发人员修改一处极易引发跨函数连锁反应与隐藏 Bug。
- **防御铁律**:
  - 任何超过 250 行的代码文件必须拆分：抽离出子组件、状态 Hook（如 `useClubFeed.ts`）、辅助计算工具（如 `posterHelpers.ts`）或字典文件（如 `posterI18n.ts`）。

## 6. 轮询 Hook 依赖项闭包陈旧与高频死循环 (Callback Reference Stability)
- **核心风险**: 自定义 Hook（如 `useContractData`、`useTonPrice`）内部声明普通函数 `fetchData`，在 `useEffect` 中将其作为依赖项并启动 `setInterval`。由于组件状态变更导致 `fetchData` 每次渲染都分配新引用，`useEffect` 频繁销毁并重新初始化，引发疯狂的高频网络拉取死循环与 React 重绘风暴。
- **防御铁律**:
  - 供 `useEffect` 调用的异步拉取函数必须使用 `useCallback` 稳定引用；
  - 内部必须设置 `let isMounted = true;` 并在 cleanup 函数中置为 false，防止在组件卸载后更新状态抛出异常；
  - 定时轮询器必须在 return 闭包中显式调用 `clearInterval(timer)`。

## 7. Tailwind CSS v4 与 Vite 6 的 CI/CD Node 20 编译锁 (Cloudflare Pages Trap)
- **核心风险**: 采用 Tailwind CSS v4 与 Vite 6 的现代化前端工程，其内部底层 LightningCSS 必须运行在 `Node.js >= 20.0.0` 环境。Cloudflare Pages 或老旧 CI/CD 默认容器镜像常为 Node 18 或 12，拉取代码后编译直接抛出语法解析异常或模块缺失报错。
- **防御铁律**:
  - 项目根目录必须显式提交两个版本锁文件：`.nvmrc` 和 `.node-version`，声明兼容的主流 LTS 版本（如 `20.18.0`）；
  - 本地验证构建必须确保 `npm run build` < 5.0 秒，且零 TypeScript 类型警告。
