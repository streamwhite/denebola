# Opinionated Expo Mobile Framework — Plan

## 1. Goal

把仓库发展成一套可复用、可发布、可升级的 opinionated Expo / React Native 移动端开发框架：新项目通过生成命令获得可运行的工程，日常开发通过稳定的导出接口复用基础能力，后续通过常规 package 更新同步框架与依赖。

本计划承接并补充：

- `Expo React Native Mobile Application Template — PLAN.md`：产品和工程能力方向。
- `Package Runtime Distribution and Sync PLAN.md`：单 runtime package、生成器、发布及升级约束。

这两份文档中的包发布和 consumer 验证决策继续有效；本文聚焦下一阶段的框架化、API 稳定性、新项目体验和可控升级。

## 2. 产品原则

1. **约定优于选择**：默认给出路由、目录、provider、样式、数据请求、表单、错误处理、测试和发布方式；项目可通过标准 Expo 能力退出约定。
2. **框架管基础设施，应用管业务**：路由页面、业务 feature、领域模型、后端和品牌属于消费项目。
3. **先稳定公共接口，再扩展功能**：消费者只依赖 package 导出的 API，不依赖 `src` 内部路径。
4. **一个核心 runtime package + 一个项目生成命令**：维持简单的安装、发布和升级模型；暂不拆出多个 capability packages。
5. **默认轻量，按需启用原生能力**：不要因为“常见”就把相机、SQLite、后台定位等原生模块全部装进每个项目。
6. **安全更新可解释**：常规 package 更新同步 JS 和依赖；涉及原生代码、Expo SDK 或原生配置的更新明确要求重新构建二进制。
7. **升级不覆盖业务代码**：框架更新不能静默重写消费项目文件；必要的配置迁移应显式、可检查、可拒绝。

## 3. 当前基线（仓库现状）

已存在并应复用、稳定化的基础：

- `@your-scope/mobile-template` runtime package、`@your-scope/create-mobile-app` scaffold 和 consumer 示例。
- Expo Router、统一 Provider、启动初始化、错误边界、NativeWind 基础 UI。
- API client / normalized errors、TanStack Query provider、auth/session 抽象。
- SecureStore / memory storage、React Intl、Intl polyfills。
- Deep link / notification payload 解析、权限接口、设备和生命周期接口。
- Offline queue、迁移接口、feature flags、logger / analytics contracts。
- `mobile-template-doctor`、config plugin、consumer 验证脚本。

主要待完善项：

- 导出接口目前集中在 `packages/mobile-template/src/index.tsx`，但缺少明确的稳定性等级、子路径策略、弃用和变更约束。
- 生成项目与 runtime 的职责边界、默认目录和日常开发约定需要形成单一、完整的入门路径。
- 当前多个 native capability 仍是接口或轻量工具，应该通过需求优先级逐步实现，不能把 todo 清单当成首发范围。
- doctor 已能诊断版本与重建需求；跨版本的消费项目配置迁移、迁移说明和兼容性矩阵仍需规划。
- 包内示例和文档要展示从创建项目到实现首个真实 feature 的完整流程，并保持所有用户界面文案进入翻译资源。

## 4. 目标使用体验

### 新项目（推荐）

```sh
pnpm create @your-scope/mobile-app my-app
cd my-app
pnpm install
pnpm dev
```

生成器产出最小可运行的 Expo 应用：应用配置、Expo Router 入口、NativeWind 配置、框架 Provider、翻译资源、示例 feature、类型检查和测试脚本。生成后业务代码完全归消费项目所有。

### 已有 Expo 项目

```sh
pnpm add @your-scope/mobile-template
pnpm exec mobile-template-doctor
```

通过一次性集成说明接入 Provider / config plugin / 样式工具链，然后只从框架的公开导出接口使用基础能力。

### 消费项目更新

```sh
pnpm update @your-scope/mobile-template --latest
pnpm exec mobile-template-doctor
```

JS 和普通依赖通过 package manager 更新。doctor 给出兼容性与原生重建提示；有消费项目文件变更时，只运行对应迁移并先预览差异。

## 5. 架构和所有权

```text
Consumer application
├── src/app/                 Expo Router 页面与路由
├── src/features/            业务功能
├── src/messages/            应用翻译
├── app.config.ts            应用标识、权限、品牌及应用插件配置
└── @your-scope/mobile-template
    ├── public exports        有版本承诺的框架 API
    ├── providers             框架默认运行时装配
    ├── components            小型共享 UI / 表单 / 状态组件
    ├── lib                   API、存储、i18n、设备等框架能力
    ├── app.plugin.js         框架拥有的原生默认配置
    └── mobile-template-doctor 诊断与升级指引
```

| 归框架所有 | 归消费应用所有 |
| --- | --- |
| 导出接口、Provider、可复用组件与基础工具 | 业务路由、页面和 feature |
| 框架默认配置与 config plugin 自身行为 | app 名称、图标、bundle id、权限选择和品牌 |
| 框架内置翻译、兼容性元数据、迁移工具 | 业务翻译、领域类型、API endpoint、后端实现 |
| package 版本、依赖范围、升级说明 | 应用自己的 lockfile、构建凭据和发布节奏 |

## 6. 公共导出 API 约定

### API 面

- 根入口 `@your-scope/mobile-template` 暴露推荐路径：Provider、公共组件、服务工厂、必要 hooks、错误/数据类型及版本信息。
- 继续以消费方注入为主：API transport/auth client、analytics、logger、permissions、notifications、files 等由应用提供实现，避免绑定 SaaS 或业务后端。
- 保持 `MobileTemplateProvider` 作为默认快速路径；允许应用向 Provider 注入配置/实现，不要求应用接受不可覆盖的全局单例。
- 避免根入口无差别导出所有内部 helper。只在真实消费场景稳定后再公开；内部实现可自由重构。
- 对确有独立加载价值的能力，再评估受支持的 package 子路径；不提供指向内部源码目录的深层导入。

### 兼容性规则

- Semver：patch 为兼容修复，minor 增加兼容 API，major 才删除/改变公共 API 或提高兼容底线。
- 所有公开导出需有类型、用途文档、最小示例和对应测试；发布前检查 tarball 中目标文件存在。
- 删除 API 前至少经历一个 deprecation 周期；弃用说明给出替代 API 与移除版本。
- 将 Expo SDK、React Native、React 和原生模块版本范围记录为兼容矩阵；升级由 Expo SDK 升级任务驱动，而非无差别自动追新。
- `react` / `react-native` 保持 peer dependency，遵循单实例约束；Expo CLI、Metro、Babel、Expo Router 等项目根工具链入口在生成项目中显式声明并与 runtime 对齐。

## 7. 默认技术约定与功能范围

### V1 默认启用

- TypeScript strict、pnpm、Expo Router、Expo development build 工作流。
- feature-oriented 目录：路由层薄，业务逻辑聚合在 `src/features/<feature>`；跨 feature 通用代码进入 `src/shared` 或约定的公共目录。
- NativeWind + 语义化主题 tokens；共享 UI 控制在常用基础组件，不预先实现大型设计系统。
- React Hook Form + Zod；TanStack Query 管服务端状态，React state/context 管本地 UI 状态。
- 统一 API 错误模型、请求超时和可注入认证；SecureStore 存敏感凭据，普通偏好使用普通存储抽象。
- React Intl / ICU 消息、locale fallback、格式化 polyfill；消费应用的 UI 文案必须外置到应用翻译资源。
- Loading / Empty / Error / Offline / Unauthorized 状态、应用级 error boundary、日志接口和基础无障碍约定。
- 环境配置示例、development / preview / production profile、诊断命令及基础单元/组件/consumer 测试。

### 按需启用，不列入默认依赖的能力

- SQLite 与离线优先同步、通知/推送、相机/媒体、文件、后台任务、位置、biometric、复杂权限流程。
- Analytics、crash reporting、远程 feature flags、auth / OAuth 厂商、支付和具体后端。
- 这些能力先提供窄接口、集成 recipe 或独立示例；只有多项目验证后再决定是否加入 runtime 默认依赖。

### 不纳入近期目标

- 自建全功能导航系统、百组件 UI 库、插件市场、通用同步冲突引擎。
- 自动改写任意消费项目、隐式安装一组未经用户确认的新依赖。
- 为了宣称“只安装一个 package”而隐藏 Expo CLI/Metro 实际需要的项目根依赖。

## 8. 实施阶段

### Phase 0 — 盘点与范围冻结

- 以当前代码和 consumer fixture 为准，整理 capability 清单：已实现、仅接口、缺失、可选原生依赖。
- 固定本计划的 V1 默认项和非目标，清理重复或彼此冲突的旧路线描述（保留历史决策和证据）。
- 形成 `exports` 清单、目录约定、生成项目文件清单、兼容 SDK 范围。

**完成标准：**每项能力有状态/所有者/是否默认安装；新项目入口和包更新承诺可被简洁说明。

### Phase 1 — 稳定核心公共 API

- 审核根 `src/index.tsx` 所有现有导出，标记 stable / experimental / internal；删除不必要的内部导出前先检查 consumer 示例和调用方。
- 统一 Provider 配置和能力注入方式，确保 Provider 可嵌套/测试且不暗中覆盖 consumer 配置。
- 补齐每个 stable API 的类型、错误行为、文档和必要单测；将 exports metadata 与包内容验证纳入 package tests。
- 给 API 变更建立 semver、弃用、release note 规则。

**完成标准：**消费应用仅使用受支持入口即可完成标准接入；内部文件搬迁不会破坏公开 API。

### Phase 2 — 新项目黄金路径

- 让生成器产出最小但完整的可运行 app：根 layout、默认路由、provider、NativeWind、主题 tokens、i18n、env 示例、测试和常用 scripts。
- 生成一个小型、可删除的示例 feature，体现 feature 目录、API + Query、表单 + schema、loading/error 和翻译的推荐组合。
- README 采用从创建、运行、添加 feature、配置环境、测试到构建的顺序；保留已有项目接入路径。
- 明确 app 根工具链依赖的原因，并让生成器负责对齐 Expo SDK 所需版本。

**完成标准：**从 packed package/scaffold 建出的干净 consumer 可安装、解析配置并通过 typecheck 和核心测试；README 读者不需要先理解仓库内部结构。

### Phase 3 — 常用能力补齐（按收益排序）

1. 核心体验缺口：可配置主题/locale、稳定表单错误映射、应用级错误恢复、日志脱敏约定。
2. 常用集成 recipe：认证 session 与 API client 接线、列表分页/刷新、deep link 到业务路由、环境切换。
3. 经需求确认后再实现 native capability adapter 和额外 UI；每个可选 native 集成都包含 config plugin 要求、权限说明、dev build 限制和 consumer 验证。

**完成标准：**每项新增能力有清晰的启用成本、原生影响、错误处理与示例；不因单个示例用例扩展核心 API。

### Phase 4 — 安全升级与项目迁移

- 扩展 doctor：检查 package、Expo SDK/React Native/React peer 对齐、config plugin、关键原生依赖及是否需要重建。
- 引入版本化 migration registry，仅迁移框架曾生成且有明确 schema 的文件；迁移支持 `--dry-run`、冲突检测、变更摘要和可恢复备份。
- 业务文件不自动迁移或覆盖。遇到冲突应停止并指出手动步骤；无迁移时明确提示普通 package update 足够。
- 每次 major / Expo SDK 升级发布兼容矩阵、迁移指南、原生重建要求和已知限制。

**完成标准：**可从至少一个旧版 consumer fixture 验证诊断、无冲突迁移、冲突保护以及原生重建提示。

### Phase 5 — 发布质量门禁

- 对 runtime 与 scaffold 分别验证 package metadata、packed tarball、公开导出、依赖声明和 clean consumer 安装。
- 按改动执行 API 单元/组件测试、consumer 验证；涉及 native 配置时验证 Expo config/prebuild 结果，并安排 iOS/Android development build 验证。
- 发布说明列出新增/弃用/移除 API、SDK/peer 范围变化、迁移命令和是否需要新二进制。
- 保持发布简单：核心 runtime 按既有决策普通 npm package 发布；生成器只在脚手架内容或创建流程变化时单独发布。

**完成标准：**每个版本都可以从实际 tarball 安装验证，且升级影响和恢复路径清楚。

## 9. 测试与验收策略

- **API 单测：**服务工厂、错误归一化、存储/session、校验器、locale、deep link/notification parser、迁移冲突保护。
- **组件测试：**用户可见交互、加载/失败/空状态、表单校验与无障碍语义。
- **consumer fixture：**从打包产物创建新项目/接入已有 Expo fixture，验证导出解析、config plugin、单实例依赖及类型检查。
- **原生验证：**仅当 Expo SDK、config plugin 或原生模块变化时安排 iOS/Android development build；普通 JS 变更不以 native build 作为默认门槛。
- 测试行为和兼容承诺，不锁定内部实现细节；发现兼容问题时先增加能复现的测试，再修复实现。

## 10. 后续实施顺序

1. 完成 Phase 0 的 capability/API/生成文件清单。
2. 先定公共 API 约定并审核现有出口，再做根入口与 Provider 调整。
3. 整理 scaffold 的黄金路径和 consumer 文档，确保无新项目功能被强制覆盖。
4. 按真实新项目开发过程补核心缺口，避免照搬大而全功能清单。
5. 实现版本诊断与受控迁移，先覆盖 config/框架生成文件，再考虑其他自动化。
6. 使用 packed consumer 验证发布质量，必要时完成原生构建验证。

## 11. 最终验收

- 一个命令创建的新项目能开始开发，默认架构和主要选择清晰且一致。
- 新项目从框架的公开导出 API 使用基础能力，不依赖框架源码内部路径。
- 业务功能、路由、文案、品牌、后端实现仍由消费应用控制。
- `pnpm update @your-scope/mobile-template --latest` 更新 runtime；doctor 清楚报告版本兼容、迁移步骤和原生重建需求。
- 迁移工具不会静默覆盖消费者改动，冲突时能预览、停止并给出修复指引。
- runtime/package/scaffold 由实际发布 tarball 和 consumer fixture 验证，而不只在 workspace 内验证。
- 依赖规模、native rebuild 成本、启动路径、错误处理、无障碍和安全约定有文档且可验证。

## 12. 实施状态

计划各阶段均已完成；本节记录落地内容与验证方式，不改动上文的目标与规则。

- **Phase 0 — 盘点：**`docs/CAPABILITIES.md` 按 stable / contract / tool / deferred 盘点公开能力与默认启用状态。
- **Phase 1 — 公共 API：**
  - `MobileTemplateProvider` / `AppProviders` 支持注入 `queryClient`、`defaultLocale`、`messages`。
  - i18n 新增 `AppMessages`、`Locale`、`mergeMessages`，应用文案按 locale 覆盖框架默认值。
  - `AuthProvider` 支持注入 `storage`，默认 `secureStorage`。
  - 新增 `framework` 元数据（包名、版本、Expo/React/React Native 范围）。
- **Phase 2 — 黄金路径：**
  - 生成项目包含 `src/messages.ts`、`src/features/home`、`src/features/settings`、`src/app/settings.tsx`、`src/lib/api.ts`、`.env.example`、`README.md`。
  - 生成项目自带 `tests/messages.test.ts` 与 `pnpm test`（vitest）。
- **Phase 3 — 常用能力：**`createQueryClient`（默认 retry/staleTime，且 `AppProviders` 默认使用）、`mapFieldErrors`、`toQueryString`、`redact`/`REDACTED`（默认 logger 自动脱敏）、`AppErrorBoundary` 支持 `onError` 上报。
- **核心基础能力：**
  - App 配置：`appConfig`、`normalizeAppConfig`。
  - Environment 配置：`environment`、`isProduction`、`resolveEnvironment`，新增 `EXPO_PUBLIC_APP_ENV`（含 root 与生成项目的 env 示例）。
  - App / Build 版本：`appVersion`、`toAppVersion` 从 Expo config 读取。
  - Feature Flags：`createFeatureFlags`、`FeatureFlagsProvider`、`useFeatureFlag`/`useFeatureFlags`。
  - Platform 检测：`platform`、`describePlatform`。
  - Device 信息：`device`、`readDeviceInfo`。
  - App 生命周期：`LifecycleProvider`、`useAppLifecycle`、`subscribeToLifecycle`、`toLifecycleState`。
  - 全局错误处理：`ErrorReporter`、`reportError`、`installGlobalErrorHandler`。
  - 性能监控接口：`PerformanceMonitor`、`measure`/`measureSync`、`PerformanceMonitorProvider`、`usePerformanceMonitor`。
  - 全局 Provider：`AppProviders` 组合 Query / Intl / FeatureFlags / Lifecycle / Performance。
  - 结构化日志（基于 `consola`）：`createLogger`/`logger`、Log Level 与 `EXPO_PUBLIC_LOG_LEVEL`、namespace/child logger、context/metadata、Error 序列化、timestamp/environment、request/trace/user id、dev pretty / prod JSON 输出、`LogSink`（`createMemoryLogSink` 轮转、`createPersistentLogSink` 持久化、`formatLogEntries`）、默认敏感字段脱敏。
  - Navigation：`navigation` helper、`buildPath`/`buildDeepLink`/`buildUniversalLink`/`isUniversalLink`/`isRouteActive`、`AppTabs`、`modalScreenOptions`/`openModal`、`RouteGuard`、`AuthGuard`、`NavigationStateProvider`/`useNavigationState`；config plugin 支持 `universalLinks`/`appLinks`（iOS associatedDomains + Android verified intentFilters）；并从 package 重新导出 Expo Router 基础组件与 hooks。
  - Authentication：`AuthProvider`/`useAuth` 覆盖 Session/Login/Logout/Register/Password Reset/Email Verification/Session Restore/Token Refresh/User Profile；RBAC（`can`/`canAny`/`hasRole`/`hasAnyRole`/`hasPermission`/`hasAllPermissions` 与 `useCan`/`useHasRole`/`useHasPermission`）；Auth Guard（`AuthGuard`/`useAuthGuard`）；OAuth/OIDC 抽象（`buildAuthorizationUrl`/`toSession`/`OAuthProviderConfig`/`loginWithOAuth`）；Biometric Unlock（`createExpoBiometricAdapter`/`unlockWithBiometrics`，基于 `expo-local-authentication`）。
  - Secure Storage：`secureStorage`（自带 key 索引以支持安全 `clear`）、`createSecureKV`、Token/Credential 存储（`createSessionManager`/`createCredentialStore`）、Encryption 抽象（`Cipher`/`passthroughCipher`，默认沿用 keychain）、Key Rotation（`createKeyRotation`/`isRotationDue`）与 Secure Delete。
  - Client State：Local State 用 React 原生 hooks；Global UI State 提供 `createStore`/`createUiStore`（基于 `zustand`，含 `useStore` re-export）、Persistent State（`createStore({ persist })` + `createZustandStorage` 适配 `Storage`）、State Hydration（`hydrationResult`/`isHydrated`/`onHydration`）与 State Reset（`store.reset()`）。
  - Server State：TanStack Query Provider 与 hooks（query/mutation/infinite）由 runtime 转发；`createQueryClient` 默认 `retryOnApiError`（网络/5xx 可重试、4xx 不重试）、staleTime/gcTime、`refetchOnReconnect`/`refetchOnWindowFocus`；`createQueryKeys`/`isQueryKeyInScope` 统一 key；cache invalidate（`invalidateScope`/`invalidateKeys`）、prefetch（`prefetchQuery`）、乐观更新（`optimisticListUpdate`/`optimisticDetailUpdate`/`rollbackQueries`/`snapshotQueries`）、分页（`appendInfinitePage`/`DEFAULT_PAGE_SIZE`）；离线缓存 `createQueryPersister` + `ServerStateProvider`（恢复/持久化 query cache，并在重连时回调）；离线 mutation 队列 `createSyncQueue`（可持久化、`flush`、`maxAttempts`）。
  - API / Networking：`createApiClient`（`request`/`requestWithMeta`）支持认证头、`Accept-Language`、每请求/客户端超时、`AbortSignal` 取消、可配置重试与指数退避（`RetryPolicy`/`runWithRetry`/`DEFAULT_RETRY`）、401 单次 token refresh、`X-Request-Id`/`X-Correlation-Id` 与结构化 `ApiResponse` 类型；`ApiError`/`normalizeNetworkError` 标准化错误；上传/多部分（`toFormData`/`uploadWithProgress`）、下载（`downloadBlob`）、SSE/流式（`subscribeToSSE`/`streamResponse`/`parseSSEChunk`）、WebSocket（`createWebSocketClient`，自动重连 + JSON）；网络状态与离线检测（`NetworkProvider`/`useNetwork`/`useIsOffline`，基于 `@react-native-community/netinfo`）；`ApiProvider`/`useApiClient`。
  - i18n：Locale 管理/检测/切换/回退（`useLocaleController`、`detectLocale`、`canonicalLocale`、`localeTag`、`fallbackMessages`、`LocaleSwitcher`，基于 `expo-localization` 设备检测 + `Storage` 持久化 + `EXPO_PUBLIC_DEFAULT_LOCALE`）、ICU/复数由 react-intl + FormatJS polyfill 支持、日期/数字/货币/百分比/相对时间（`useI18nFormatters`，常量集中在 `categories.ts`）、翻译校验（`validateTranslations`/`extractPlaceholders`）与抽取脚本（`i18n:extract`/`i18n:compile`）；列表搜索/排序/分页纯函数（`searchItems`/`sortByValue`/`filterItems`/`pageOf`）。
  - Design System / UI：`ThemeProvider`（light/dark/system）+ Design Tokens（spacing/radius/fontSize/fontWeight/lineHeight/shadow/palette/typography）与 themed hooks；组件覆盖 Button、Input/Textarea、Select/MultiSelect（搜索过滤 + 自由输入）、Checkbox/Radio/Switch/Slider、Card/Badge/Avatar、Spinner/Skeleton、List/ListItem、Dialog/ConfirmationDialog、BottomSheet、Toast/Snackbar、Tooltip、Search、Pagination、PullToRefresh、InfiniteList，以及 SafeArea/Keyboard 布局（新增原生依赖 `@react-native-community/slider`）。
  - Normal Storage（contract-first，不新增原生依赖）：`createKeyValueStorage`/`KeyValueBackend` 把任意字符串后端（AsyncStorage/MMKV/expo-sqlite kv）适配为 `Storage`；`createPreferences` 提供带默认值的类型化偏好；`createStorageCache`/`isExpired` 提供可持久化 TTL 缓存；`createVersionedStorage`/`migrateStoredValue`/`StorageMigration` 提供版本化存储与逐版本迁移（新版本数据不降级）。Persistence 复用既有 `createStore({ persist })` 与 `createQueryPersister`。
  - Database / Offline（contract-first，不新增原生依赖）：`SqlDatabase` 契约 + `createExpoSqliteDatabase`（鸭子类型适配 `expo-sqlite` 异步 API）；`runSqlMigrations`/`createSqlVersionTracker` 在既有 `migrate` 之上做语句级迁移；`createRepository`/`TableAdapter`/`createMemoryTableAdapter` 提供存储无关的本地仓储；`resolveConflict`/`lastWriteWins`/`resolveWith` 提供冲突策略；`createSyncEngine` 由注入的连通性驱动队列重连刷新；`createBackgroundSync`/`BackgroundSyncAdapter` 以契约方式桥接后台任务调度。
  - Notifications（contract-first，不新增原生依赖）：`NotificationAdapter` 升级为包含权限、`PushToken`、`schedule`/`cancel`、初始 payload 与订阅的完整契约；`subscribeToNotifications`/`consumeInitialNotification` 处理前台/后台（含冷启动）；`createPushTokenManager` 把 token 注册/撤销到后端；`createNotificationRouter`/`notificationDeepLink` 仅对显式声明的类型做路由与深链（`notificationPath` 复用）；`createNotificationPreferences`/`isNotificationTypeEnabled` 提供总开关 + 分类型偏好。
  - Permissions（contract-first，不新增原生依赖）：`createPermissionService`/`createMemoryPermissionHandle` 以注入 handler 的方式抽象 camera/photos/notifications/location/microphone/contacts/bluetooth；`requestPermissionStatus`/`isGranted`（`limited` 视为可用）；`createPermissionGate` 落实“用户操作 → 解释 → 请求 → 处理状态”，已授权时不弹解释；`readPermissionStates` 聚合各权限状态。
  - Device / Native（contract-first，不新增原生依赖）：既有 `device`/`readDeviceInfo`/`platform`/`describePlatform` 之外，新增 `readOsInfo`（OS Information）、`createAppStateAdapter`（App State，复用 lifecycle）、`BatteryAdapter`/`noopBattery`/`createMemoryBattery`（Battery）、`ClipboardAdapter`/`createMemoryClipboard`、`HapticsAdapter`/`noopHaptics`/`createMemoryHaptics`、`OrientationAdapter`/`toScreenOrientation`/`isLandscape`、`BrightnessAdapter`/`createMemoryBrightness`/`clampBrightness`、`readDeviceSecurityState`/`DeviceSecurityAdapter`（root/jailbreak/锁屏/生物识别聚合）；Network 复用既有 `networkCore`/`NetworkProvider`，Local Authentication 复用 `BiometricAdapter`/`createExpoBiometricAdapter`。
  - Media / Files（contract-first，不新增原生依赖）：`MediaAdapter` 扩展为 image pick / video pick / photo capture；`ImageAdapter` 契约 + `scaledDimensions`/`clampQuality`/`IMAGE_SIZE_DIMENSIONS`（thumbnail/medium/full）描述压缩与缩放约定；`toUploadFile`/`toMediaFormData` 把 `MediaAsset` 映射到既有 `UploadFile`/`toFormData`（配合 `uploadWithProgress`）；`createMediaCache`（远程图片 → 本地 uri）与 `createFileCache`（远程文件下载缓存 + `FileStore` 失效清理）复用 storage cache；File Upload/Download 复用既有 `transfer`。
  - Files / Background（contract-first，不新增原生依赖）：`FileSystemAdapter`（读写/base64/exists/info/mkdir/remove/list）与 `createMemoryFileSystem`、`FilePickerAdapter`/`ShareAdapter`/`OpenFileAdapter`、路径纯函数（`joinPath`/`fileNameFromUrl`/`fileExtension`/`temporaryFileName`）、`importFile`/`importTextFile`/`exportFile`/`writeTextFile`；`BackgroundTaskAdapter`/`BackgroundFetchAdapter`/`BackgroundLocationAdapter` 契约 + `createTaskScheduler`（注册/取消/`cancelAll`）+ 内存适配器，`createBackgroundSync` 改为复用 `BackgroundTaskAdapter` 并携带 `requiresNetwork`。
  - Linking / Integration（contract-first，不新增原生依赖）：`isAllowedUrl`/`UrlPolicy`/`urlScheme` 统一外部 URL 校验（host 仅约束 http(s)）；`isAppLink`/`appLinkPath` 覆盖 Android App Link / Universal Link；`LinkingAdapter`/`createAppLinker`（只打开允许且可打开的目标）实现 App-to-App；`ShareIntentAdapter`/`parseShareIntent`/`parseIncomingFiles` 处理 Share Intent 与 Incoming File。既有 deep link（`parseDeepLink`/`handleDeepLink`/`subscribeToDeepLinks`）与 `buildDeepLink` 复用。
  - App Lifecycle / Startup（contract-first，不新增原生依赖）：`runStartup`/`orderStartupSteps` 提供带 `dependsOn` 的初始化管线（未知/循环依赖即失败、可选步骤失败继续）；`classifyLaunch`/`createLaunchTracker` 区分 Cold/Warm/Resume；`SplashAdapter`/`createMemorySplashAdapter` 与 `TerminationAdapter` 补齐 Splash 与 App Termination 契约；Foreground/Background 复用既有 lifecycle。
  - UX / User Preferences（contract-first，不新增原生依赖）：`createThemePreferenceStore`（Theme Preference 持久化）、`createPrivacyPreferences`/`hasConsent`/`updateConsent`（Privacy/Consent）、`createAccessibilityPreferences`/`AccessibilityAdapter`/`prefersReducedMotion`（Accessibility）、`createOnboardingStore`/`trackLaunch`/`isFirstLaunch`/`completeOnboarding`（Onboarding 与 First Launch Detection）；Language Preference 复用 `createLocaleStore`，Notification Preference 复用 `createNotificationPreferences`。
  - Analytics / Observability（contract-first，不新增原生依赖）：`createConsentedAnalytics` 以同意状态门控 `track`/`identify`/`screen`（Event / Screen / User Identification + Privacy/Consent）；`createSessionTracker`（Session Tracking）、`CrashReporter`/`createMemoryCrashReporter`（Crash Reporting）、`NetworkTracker`/`createMemoryNetworkTracker`/`createPerformanceNetworkTracker`（Network Tracking，复用 PerformanceMonitor）；Error/Performance Reporting 复用既有 `ErrorReporter`/`PerformanceMonitor`。
  - Security（contract-first，不新增原生依赖）：`normalizeSecurityConfig`/`auditSecurityConfig`（Security Configuration，生产环境 cleartext 记 error）、`evaluateNetworkSecurity`/`isHostPinned`/`NetworkSecurityAdapter`（Certificate/Network Security 抽象）、`validateDeepLink`（Deep Link Validation，返回 typed Result）、`minimalPermissionSet`/`excessPermissions`（Permission Minimization）、`auditDependencies`（Dependency Audit）、`createSensitiveKeyMatcher`/`filterSensitive`/`redactSensitive`（Sensitive Log Filtering）；Secure Storage / Secret Redaction / URL Validation 复用既有 `secureStorage`/`redact`/`isAllowedUrl`。
  - Common Business Utilities（纯函数，无依赖）：`createId`/`createUuid`/`isUuid`（UUID/ID）、`isValidDate`/`toIsoDate`/`addMs`/`diffMs`/`startOfDay`/`formatDate`/`formatInTimeZone`/`deviceTimeZone`（Date/Time 与 Timezone）、`Money`/`toMinorUnits`/`addMoney`/`formatMoney`/`formatNumber`/`clampNumber`/`roundTo`（Currency/Number）、`capitalize`/`titleCase`/`truncate`/`slugify`（String）、`isEmail`/`isUrl`/`isPhoneNumber`（Validation）、`debounce`/`throttle`（异步节流）、`Result`/`ok`/`err`/`mapResult`/`toResult`（Result 类型）；Pagination 与 Retry 复用既有实现。
  - Native Extension（contract-first，不新增原生依赖）：`NativeModuleAdapter`/`createMemoryNativeModule`（Native Module Integration，iOS/Android 通用）、`NativeEventBridge`/`createMemoryEventBridge`（Native Event Bridge）、`normalizeNativeConfig`/`NativeConfig`/`requestedNativePermissions`（Native/Permission/Build Configuration）；config plugin（`app.plugin.js`）新增 `permissions`（iOS usage description + Android 权限）与 `build`（bundleIdentifier/packageName/buildNumber/versionCode）选项，保持 CNG/Config Plugin 路径。
  - Testing（测试工具，无运行时依赖）：`lib/testing/` 提供 `defineFixture`（Fixtures）、`createFactory`/`createSequence`（Factories）、`createMockFetch`/`jsonResponse`（Mock API，注入 `createApiClient` 的 `fetch`）、`createMockStorage`（Mock Storage，记录操作）、`createMockPermissionService`（Mock Permissions，记录请求）、`createMockNativeModule`/`createMockEventBridge`（Mock Native Modules）、`stableSnapshot`（Snapshot Testing 稳定化）、`toAccessibilityProps`/`meetsMinTouchTarget`（Accessibility Testing）；Unit/Component/Integration/E2E 复用既有 vitest / RTL / playwright 配置。
- **Phase 4 — 升级与迁移：**
  - doctor 增加 React / React Native 期望与实际版本行，并把 React Native 漂移纳入原生重建判断。
  - 新增 `mobile-template-migrate`：规划优先、冲突/缺失即中止不写入、写入前 `.bak` 备份、`.mobile-template-migrations.json` 记录已应用 id，只处理框架声明生成的文件。
- **Phase 5 — 发布门禁：**既有 `publish:dry-run` / `verify:consumer` / consumer fixture 测试继续有效；新增改动均带单测或组件测试。

验证：

```sh
pnpm test              # 单元测试（含 doctor、migrate、form-errors、redact、query-client 等）
pnpm test:component    # RTL 组件测试
pnpm typecheck         # clean
pnpm pack:packages     # 打包内容
```

生成项目验证（本仓库工具链）：scaffold 后 `tsc --noEmit -p .verify-tpl/tsconfig.json` 通过，`vitest run --root .verify-tpl` 通过。

说明：本环境 `pnpm verify:consumer` 因外部 npm registry（`registry.piaosiyuan.cn`）对 `tailwindcss` 返回 404 而无法完成安装；该步骤在可访问公共 registry 的环境按 CI 运行。
