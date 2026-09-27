# Framework Capability Inventory

Phase 0 artifact for `docs/OPINIONATED-MOBILE-FRAMEWORK-PLAN.md`: the auditable list of what
`@your-scope/mobile-template` ships, what is only a contract, and what is intentionally
deferred. Kept in sync with `packages/mobile-template/src/index.tsx` and the package tests.

Status legend:

- **stable** — implemented, exported and covered by tests.
- **contract** — type/interface only; the application provides the implementation.
- **tool** — CLI shipped by the package.
- **deferred** — planned, not shipped; must not be treated as available.

## Runtime

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| Provider composition | `MobileTemplateProvider` | stable | yes |
| Query + Intl + flags + lifecycle + performance + theme + toast providers | `AppProviders` | stable | yes |
| Startup / splash bootstrap | `Bootstrap` | stable | yes |
| App error boundary | `AppErrorBoundary` (`onError` hook) | stable | yes |
| Global error handling | `ErrorReporter`, `reportError`, `installGlobalErrorHandler` | contract | opt-in |
| Locale management + switching | `AppIntlProvider`, `useLocale`, `useLocaleController`, `LocaleSwitcher` | stable | en, zh-CN |
| Locale detection + fallback | `detectLocale`, `canonicalLocale`, `localeTag`, `fallbackMessages`, `supportedLocales`, `deviceLocales` | stable | device |
| Locale persistence / loading | `createLocaleStore`, `createLocaleLoader`, `LOCALE_STORAGE_KEY` | stable | `Storage` |
| Theme preference persistence | `createThemePreferenceStore`, `toThemePreference`, `THEME_PREFERENCE_KEY` | stable | opt-in |
| Language preference | `createLocaleStore`, `useLocaleController` | stable | device |
| Privacy / consent | `createPrivacyPreferences`, `hasConsent`, `updateConsent`, `ConsentKey` | stable | opt-in |
| Accessibility preference | `createAccessibilityPreferences`, `AccessibilityAdapter`, `prefersReducedMotion` | stable | opt-in |
| Onboarding / first launch | `createOnboardingStore`, `trackLaunch`, `isFirstLaunch`, `completeOnboarding` | stable | opt-in |
| Translating messages | `useText`, `mergeMessages`, `messages`, `MessageDescriptor` | stable | — |
| ICU message + pluralization | via `react-intl` (`formatMessage`, `plural`/`select`) + FormatJS polyfills | stable | — |
| Date / time formatting | `useI18nFormatters`, `DATE_STYLE_LONG`, `DATE_STYLE_MEDIUM`, `TIME_STYLE_SHORT` | stable | — |
| Number + currency + percent | `useI18nFormatters`, `TRANS_CURRENCY` | stable | — |
| Relative time | `useI18nFormatters`, `TRANS_UNIT` | stable | — |
| Translation validation | `validateTranslations`, `extractPlaceholders`, `ValidationIssue` | stable | — |
| Translation extraction | `pnpm i18n:extract` (`formatjs`) | tool | — |
| List search / sort / page helpers | `searchItems`, `sortByValue`, `filterItems`, `pageOf` | stable | — |
| App config | `appConfig`, `normalizeAppConfig`, `AppConfig` | stable | yes |
| Environment config | `environment`, `isProduction`, `resolveEnvironment` | stable | yes |
| App / build version | `appVersion`, `toAppVersion` | stable | yes |
| Framework metadata | `framework`, `templateVersion` | stable | — |
| Analytics | `Analytics` (`track`/`identify`/`screen`), `noopAnalytics` | contract | no-op |
| Consent-gated analytics | `createConsentedAnalytics` | stable | opt-in |
| Session tracking | `createSessionTracker`, `SessionTracker` | stable | opt-in |
| Crash reporting | `CrashReporter`, `noopCrashReporter`, `createMemoryCrashReporter` | contract | no-op |
| Network tracking | `NetworkTracker`, `createMemoryNetworkTracker`, `createPerformanceNetworkTracker` | stable | opt-in |
| Performance monitoring | `PerformanceMonitor`, `measure`, `measureSync`, `usePerformanceMonitor` | contract | no-op |
| Structured logging (`consola`) | `createLogger`, `logger`, `Logger` | stable | console |
| Log levels / filtering | `LogLevel`, `resolveLogLevel` | stable | `EXPO_PUBLIC_LOG_LEVEL` |
| Namespaces, child loggers, context | `Logger.child`, `Logger.withContext`, `LoggerContext` | stable | — |
| Error serialization | `serializeError`, `SerializedError` | stable | on |
| Log sinks (rotation / persistence) | `LogSink`, `createMemoryLogSink`, `createPersistentLogSink`, `formatLogEntries` | stable | opt-in |
| Log redaction | `redact`, `REDACTED` | stable | on |
| Plugin registry | `createPluginRegistry` | stable | opt-in |
| Feature flags | `createFeatureFlags`, `defaultFeatureFlags`, `FeatureFlagsProvider`, `useFeatureFlag` | stable | local |
| App lifecycle | `LifecycleProvider`, `useAppLifecycle`, `subscribeToLifecycle`, `toLifecycleState` | stable | yes |
| Startup pipeline | `runStartup`, `orderStartupSteps`, `StartupStep` | stable | opt-in |
| Launch classification | `classifyLaunch`, `createLaunchTracker`, `LaunchKind` | stable | opt-in |
| Splash screen contract | `SplashAdapter`, `createMemorySplashAdapter`, `Bootstrap` | contract | yes |
| App termination | `TerminationAdapter`, `createMemoryTerminationAdapter` | contract | no |
| Update policy | `updatePolicy` | stable | local |

## Build / Release

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| Development / Preview / Production profiles | `RELEASE_PROFILES`, `RELEASE_PROFILE_CONFIG`, `resolveReleaseProfile`, `isReleaseProfile` | stable | — |
| Environment separation per profile | `ReleaseProfileConfig.environment` + EAS `environment` / `env.EXPO_PUBLIC_APP_ENV` | stable | yes |
| Runtime version | `resolveRuntimeVersion`, `isRuntimeCompatible`, `DEFAULT_RUNTIME_VERSION_POLICY`, `runtimeVersion.policy: "nativeVersion"` | stable | native |
| Update channel + OTA gating | `decideUpdate`, `OtaUpdate`, `UpdateChannel`, `UpdateDecision` | stable | — |
| Rollback | `selectRollbackTarget`, `PublishedUpdate`, `RollbackTarget`, `pnpm update:rollback` | stable | opt-in |
| iOS / Android signing | `signingConfig`, `DEFAULT_SIGNING_CONFIG`, `PlatformSigningConfig` | stable | remote |
| EAS Build / Submit / Update | `eas.json` profiles + `pnpm build:*` / `pnpm submit:*` / `pnpm update:*` | tool | — |
| Continuous integration | `.github/workflows/ci.yml` (tests, typecheck, package + consumer verification) | tool | yes |

## Package Update / Sync

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| Framework version | `frameworkVersion`, `templateVersion`, `framework` | stable | yes |
| Module version | `MODULE_VERSIONS`, `moduleVersion`, `listModuleVersions` | stable | yes |
| Migration system | `mobile-template-migrate` + `FrameworkMigration`, `MigrationFile` | tool | — |
| Migration kinds | `MigrationKind` (`config` / `dependency` / `template`), `migrationSummary` | stable | — |
| Codemod | `Codemod`, `codemodById`, `DEFAULT_CODEMODS` | stable | — |
| Breaking change detection | `classifyChange`, `isBreaking`, `isNewer`, `compareSemver`, `parseSemver` | stable | — |
| Version compatibility matrix | `VERSION_MATRIX`, `checkCompatibility`, `latestCompatibleLine`, `upgradeAvailable` | stable | 0.1 |
| Update CLI | `mobile-template-update` (`--apply`) | tool | — |
| Changelog | `CHANGELOG.md` | tool | — |
| Upgrade guide | `docs/UPGRADING.md` | tool | — |
| doctor / health check | `mobile-template-doctor` | tool | — |

## Data and security

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| HTTP client | `createApiClient`, `ApiClient`, `ApiRequestOptions` | stable | opt-in |
| Request / response types | `ApiResponse`, `ApiRequestContext`, `HttpMethod`, `ApiResponseInfo` | stable | — |
| Query string builder | `toQueryString` | stable | — |
| TanStack Query provider | `QueryClientProvider` via `AppProviders`; `createQueryClient` | stable | yes |
| Query / mutation / infinite | re-exported `@tanstack/react-query` hooks | stable | yes |
| Query keys factory | `createQueryKeys`, `QueryKey`, `isQueryKeyInScope` | stable | — |
| Pagination | `DEFAULT_PAGE_SIZE`, `appendInfinitePage` | stable | — |
| Cache invalidation | `invalidateScope`, `invalidateKeys` | stable | — |
| Prefetch | `prefetchQuery` | stable | — |
| Optimistic updates | `optimisticListUpdate`, `optimisticDetailUpdate`, `rollbackQueries`, `snapshotQueries` | stable | — |
| Background refetch | `refetchOnReconnect`, `refetchOnWindowFocus` defaults | stable | on |
| Retry policy | `retryOnApiError`, `QUERY_RETRY_ATTEMPTS`, `queryDefaults` | stable | 2 attempts |
| Offline cache | `createQueryPersister`, `ServerStateProvider`, `QUERY_CACHE_KEY` | stable | opt-in |
| Offline mutation queue | `createSyncQueue`, `SyncQueue` (persist + flush + maxAttempts) | stable | opt-in |
| Local state | React `useState`/`useReducer` (no framework needed) | stable | — |
| Global UI state / Zustand | `createStore`, `useStore` (re-export), `AppStore` | stable | opt-in |
| Global UI store | `createUiStore`, `useUiStore` (modal/sheet/keyboard) | stable | opt-in |
| Persistent state | `createStore({ persist })`, `PersistConfig` | stable | opt-in |
| State hydration | `hydrationResult`, `INITIAL_HYDRATION`, `isHydrated`, `HydrationState` | stable | — |
| State reset | `createStore(...).reset` | stable | — |
| Storage adapter | `createZustandStorage`, `resetStateStorage`, `STATE_STORAGE_PREFIX` | stable | — |
| Form error mapping | `mapFieldErrors`, `FieldErrors` | stable | — |
| Normalized API errors | `ApiError`, `normalizeApiError`, `normalizeNetworkError` | stable | — |
| Authentication headers | client `getToken` + `Authorization`/`Accept-Language` | stable | — |
| Token refresh | client `refreshToken` (retries once on 401) | stable | opt-in |
| Request timeout | `timeoutMs` per request / client | stable | 15s |
| Retry + backoff | `RetryPolicy`, `runWithRetry`, `backoffDelay`, `shouldRetry`, `DEFAULT_RETRY` | stable | 2 attempts |
| Request cancellation | `AbortSignal` (`REQUEST_ABORTED`) | stable | — |
| Request / correlation ID | `createRequestId`, `REQUEST_ID_HEADER`, `CORRELATION_ID_HEADER` | stable | — |
| Upload / Multipart | `toFormData`, `uploadWithProgress`, `UploadFile`, `uploadRatio` | stable | opt-in |
| Download | `downloadBlob` | stable | opt-in |
| SSE / streaming | `subscribeToSSE`, `streamResponse`, `parseSSEChunk`, `ServerSentEvent` | stable | opt-in |
| WebSocket | `createWebSocketClient`, `WebSocketClient` (reconnect, JSON) | stable | opt-in |
| Network status | `useNetwork`, `NetworkProvider`, `toNetworkState` | stable | yes |
| Offline / connectivity | `useIsOffline`, `connectivityStatus`, `isOnline`, `isMetered`, `NetworkState` | stable | yes |
| API context | `ApiProvider`, `useApiClient` | stable | opt-in |
| Auth session | `AuthProvider`, `useAuth`, `createSessionManager`, `isSessionExpired` | stable | opt-in |
| Login / logout / register | `useAuth().login/logout/register` | stable | opt-in |
| Password reset / email verification | `requestPasswordReset`, `confirmPasswordReset`, `verifyEmail` | stable | opt-in |
| Session restore / token refresh | `restore`, `refresh` (401 refresh in API client too) | stable | opt-in |
| Auth guard | `AuthGuard`, `useAuthGuard`, `useIsAuthenticated` | stable | opt-in |
| User profile | `useUser`, `updateProfile` | stable | opt-in |
| Role / permission / RBAC | `can`, `canAny`, `hasRole`, `hasAnyRole`, `hasPermission`, `hasAllPermissions`, `useCan`, `useHasRole`, `useHasPermission` | stable | opt-in |
| OAuth / OIDC abstraction | `buildAuthorizationUrl`, `toSession`, `OAuthProviderConfig`, `AuthClient.loginWithOAuth` | stable | opt-in |
| Biometric unlock | `createExpoBiometricAdapter`, `unlockWithBiometrics`, `BiometricAdapter` | contract | opt-in |
| Secure key-value storage | `secureStorage`, `createSecureKV` | stable | opt-in |
| Token / credential storage | `createSessionManager`, `createCredentialStore` | stable | opt-in |
| Encryption abstraction | `Cipher`, `passthroughCipher`, `createEncryptedStorageCipher` | contract | identity |
| Key rotation | `createKeyRotation`, `isRotationDue`, `rotationKey` | stable | opt-in |
| Secure delete | `Storage.remove`, `secureStorage.clear()`, `KeyRotation.remove` | stable | — |
| In-memory storage | `createMemoryStorage` | stable | tests |
| Storage contract | `Storage` | contract | — |
| Key-value backend adapter | `createKeyValueStorage`, `createMemoryKeyValueBackend`, `KeyValueBackend` | stable | opt-in |
| Typed preferences | `createPreferences`, `Preferences`, `PreferencesOptions` | stable | opt-in |
| TTL cache | `createStorageCache`, `isExpired`, `CacheEntry` | stable | opt-in |
| Versioned storage + migration | `createVersionedStorage`, `migrateStoredValue`, `StorageMigration` | stable | opt-in |
| SQLite contract | `SqlDatabase`, `createExpoSqliteDatabase`, `ExpoSqliteDriver` | contract | opt-in |
| SQLite migrations | `migrate`, `Migration`, `runSqlMigrations`, `createSqlVersionTracker`, `SqlMigration` | stable | opt-in |
| Local repository | `createRepository`, `TableAdapter`, `createMemoryTableAdapter` | stable | opt-in |
| Conflict handling | `resolveConflict`, `lastWriteWins`, `resolveWith` | stable | opt-in |
| Sync engine | `createSyncEngine`, `SyncEngine`, `SyncStatus` | stable | opt-in |
| Background sync | `createBackgroundSync`, `BACKGROUND_SYNC_TASK` | stable | opt-in |
| Security configuration | `normalizeSecurityConfig`, `auditSecurityConfig`, `SecurityConfig` | stable | opt-in |
| Network security | `NetworkSecurityAdapter`, `evaluateNetworkSecurity`, `isHostPinned` | contract | opt-in |
| Sensitive log filtering | `createSensitiveKeyMatcher`, `filterSensitive`, `redactSensitive` | stable | opt-in |
| Deep link validation | `validateDeepLink`, `DeepLinkError` | stable | opt-in |
| Permission minimization | `minimalPermissionSet`, `excessPermissions` | stable | opt-in |
| Dependency audit | `auditDependencies`, `DependencyPolicy` | stable | opt-in |

## Navigation

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| Expo Router facade | `Link`, `Stack`, `Tabs`, `Slot`, `Redirect`, router hooks | stable | yes |
| Navigation helpers | `navigation`, `buildPath`, `routeKey` | stable | — |
| Tab navigation | `AppTabs`, `AppTab` | stable | opt-in |
| Modal navigation | `modalScreenOptions`, `openModal` | stable | opt-in |
| Route guard | `RouteGuard` | stable | opt-in |
| Auth navigation | `AuthGuard` | stable | opt-in |
| Navigation state | `NavigationStateProvider`, `useNavigationState`, `RouteChangeHandler` | stable | opt-in |
| Deep links | `parseDeepLink`, `handleDeepLink`, `subscribeToDeepLinks`, `buildDeepLink`, `isAllowedExternalUrl` | stable | opt-in |
| Universal / App Links | `buildUniversalLink`, `isUniversalLink`, `isAppLink`, `appLinkPath`, config plugin `universalLinks` / `appLinks` | stable | opt-in |
| External URL validation | `isAllowedUrl`, `UrlPolicy`, `urlScheme` | stable | opt-in |
| App-to-App integration | `LinkingAdapter`, `createAppLinker`, `createMemoryLinkingAdapter` | contract | no |
| Share intent / incoming file | `ShareIntentAdapter`, `parseShareIntent`, `parseIncomingFiles`, `IncomingFile` | contract | no |

## Platform

| Capability | Public API | Status | Default |
| --- | --- | --- | --- |
| Device info | `device`, `readDeviceInfo`, `DeviceInfo` | stable | yes |
| Platform detection | `platform`, `describePlatform`, `PlatformInfo` | stable | yes |
| OS information | `readOsInfo`, `OsInfo` | stable | opt-in |
| App state | `getLifecycleState`, `subscribeToLifecycle`, `createAppStateAdapter` | stable | yes |
| Battery | `BatteryAdapter`, `createMemoryBattery`, `noopBattery`, `batteryLevelPercent`, `isLowBattery` | contract | no |
| Clipboard | `ClipboardAdapter`, `createMemoryClipboard` | contract | no |
| Haptics | `HapticsAdapter`, `noopHaptics`, `createMemoryHaptics`, `HapticFeedback` | contract | no |
| Screen orientation | `OrientationAdapter`, `toScreenOrientation`, `isLandscape` | contract | no |
| Brightness | `BrightnessAdapter`, `createMemoryBrightness`, `clampBrightness`, `DEFAULT_BRIGHTNESS` | contract | no |
| Device security state | `readDeviceSecurityState`, `DeviceSecurityState`, `DeviceSecurityAdapter` | stable | opt-in |
| Notification payload parsing | `parseNotificationPayload`, `NotificationPayload`, `toPushToken`, `PushToken` | stable | opt-in |
| Notification routing | `notificationPath`, `createNotificationRouter`, `notificationDeepLink` | stable | opt-in |
| Foreground / background handling | `subscribeToNotifications`, `consumeInitialNotification`, `NotificationHandlers` | stable | opt-in |
| Push token sync | `createPushTokenManager`, `PushTokenRegistrar` | stable | opt-in |
| Local notifications | `LocalNotification`, `NotificationTrigger`, adapter `schedule`/`cancel` | contract | opt-in |
| Notification preferences | `createNotificationPreferences`, `isNotificationTypeEnabled` | stable | opt-in |
| Notifications adapter | `NotificationAdapter` | contract | no |
| Permissions | `createPermissionService`, `requestPermission`, `requestPermissionStatus`, `isGranted`, `PermissionName` | stable | opt-in |
| Permission explanation gate | `createPermissionGate`, `PermissionExplainer` | stable | opt-in |
| Permission states | `readPermissionStates`, `PermissionStates`, `createMemoryPermissionHandle` | stable | opt-in |
| Filesystem | `FileSystemAdapter`, `createMemoryFileSystem`, `joinPath`, `fileNameFromUrl`, `fileExtension`, `temporaryFileName` | stable | opt-in |
| File picker / share / open | `FilePickerAdapter`, `ShareAdapter`, `OpenFileAdapter`, memory adapters | contract | no |
| File import / export | `importFile`, `importTextFile`, `exportFile`, `writeTextFile` | stable | opt-in |
| File cache | `createFileCache`, `FILE_CACHE_KEY` | stable | opt-in |
| File store | `FileStore`, `FileKind` | contract | no |
| Media / camera | `MediaAdapter` (image/video pick, photo capture), `MediaAsset`, `MediaKind` | contract | no |
| Image processing | `ImageAdapter`, `scaledDimensions`, `clampQuality`, `IMAGE_SIZE_DIMENSIONS` | contract | no |
| Media / file cache | `createMediaCache`, `createFileCache` | stable | opt-in |
| File upload / download | `toUploadFile`, `toMediaFormData`, `toFormData`, `uploadWithProgress`, `downloadBlob` | stable | opt-in |
| Background tasks | `BackgroundTaskAdapter`, `createTaskScheduler`, `BackgroundTaskOptions` | contract | no |
| Background fetch | `BackgroundFetchAdapter`, `BackgroundFetchOptions` | contract | no |
| Background location | `BackgroundLocationAdapter`, `BackgroundLocationOptions`, `LocationSample` | contract | no |
| Background sync | `createBackgroundSync`, `BACKGROUND_SYNC_TASK` | stable | opt-in |
| Local authentication / biometrics | `BiometricAdapter`, `createExpoBiometricAdapter`, `unlockWithBiometrics` | contract | no |
| Native module adapter | `NativeModuleAdapter`, `createMemoryNativeModule` | contract | no |
| Native event bridge | `NativeEventBridge`, `createMemoryEventBridge` | contract | no |
| Native configuration | `normalizeNativeConfig`, `NativeConfig`, `requestedNativePermissions` | contract | opt-in |

## UI / Design System

| Capability | Public API | Status |
| --- | --- | --- |
| Theme (light / dark / system) | `ThemeProvider`, `useTheme`, `ThemePreference`, `resolveColorScheme` | stable |
| Design tokens | `createTokens`, `lightTokens`, `darkTokens`, `spacing`, `radius`, `fontSize`, `fontWeight`, `lineHeight`, `shadow`, `palette`, `typography` | stable |
| Themed hooks | `useColors`, `useSpacing`, `useRadius`, `useShadow`, `useTypography`, `useThemedStyle` | stable |
| Typography | `Text` (`variant`, `tone`) | stable |
| Button | `Button` (variant, size, loading, icon) | stable |
| Input / Textarea | `Input`, `Textarea` (label, error, helper, prefix/suffix) | stable |
| Select (search + free input) | `Select`, `filterOptions`, `findExact` | stable |
| Multi Select (search + free input) | `MultiSelect`, `labelsFor`, `toOption` | stable |
| Checkbox / Radio / Switch / Slider | `Checkbox`, `Radio`, `Switch`, `Slider` | stable |
| Card / Badge / Avatar | `Card`, `Badge`, `Avatar` | stable |
| Spinner / Skeleton | `Spinner`, `Skeleton` | stable |
| List / ListItem | `List`, `ListItem` | stable |
| Dialog / Confirmation | `Dialog`, `ConfirmationDialog` | stable |
| Bottom Sheet | `BottomSheet` | stable |
| Toast / Snackbar | `ToastProvider`, `useToast` | stable |
| Tooltip | `Tooltip` | stable |
| Search | `Search` | stable |
| Pagination | `Pagination`, `computePagination`, `paginate`, `clampPage` | stable |
| Pull to Refresh | `PullToRefresh` | stable |
| Infinite Scroll | `InfiniteList` | stable |
| Safe Area | `Screen`, `SafeAreaView` (re-export) | stable |
| Keyboard handling | `KeyboardAvoidingScreen`, `Screen` (`keyboardShouldPersistTaps`) | stable |
| Layout | `Screen`, `Container` | stable |
| Forms | `FormInput`, `SubmitButton` | stable |
| Feedback states | `StateView`, `EmptyState`, `ErrorState`, `LoadingState`, `OfflineState`, `UnauthorizedState`, `NotFoundState` | stable |
| Class utility | `cx` | stable |

## Utilities

| Capability | Public API | Status |
| --- | --- | --- |
| ID / UUID | `createId`, `createPrefixedId`, `createUuid`, `isUuid` | stable |
| Result / error types | `Result`, `ok`, `err`, `isOk`, `isErr`, `mapResult`, `unwrapOr`, `toResult`, `toResultAsync` | stable |
| Date / time + timezone | `isValidDate`, `toIsoDate`, `addMs`, `diffMs`, `startOfDay`, `formatDate`, `formatInTimeZone`, `deviceTimeZone` | stable |
| Currency / money + number | `Money`, `toMinorUnits`, `toMajorUnits`, `addMoney`, `formatMoney`, `formatNumber`, `clampNumber`, `roundTo` | stable |
| String utilities | `capitalize`, `titleCase`, `truncate`, `slugify`, `isNonEmpty` | stable |
| Validation utilities | `isEmail`, `isUrl`, `isPhoneNumber`, `isNumeric`, `hasMinLength`, `hasMaxLength` | stable |
| Debounce / throttle | `debounce`, `throttle` | stable |
| Pagination utilities | `pageOf`, `computePagination`, `paginate`, `clampPage`, `appendInfinitePage` | stable |
| Retry | `runWithRetry`, `backoffDelay`, `DEFAULT_RETRY` | stable |

## Testing

| Capability | Public API | Status |
| --- | --- | --- |
| Test fixtures | `defineFixture`, `Fixture` | stable |
| Test factories | `createFactory`, `createSequence`, `Factory` | stable |
| Mock API | `createMockFetch`, `jsonResponse`, `MockRequest` | stable |
| Mock storage | `createMockStorage` (records operations) | stable |
| Mock permissions | `createMockPermissionService` (records requests) | stable |
| Mock native modules | `createMockNativeModule`, `createMockEventBridge` | stable |
| Snapshot testing | `stableSnapshot`, `SNAPSHOT_PLACEHOLDER`, `DEFAULT_VOLATILE_KEYS` | stable |
| Accessibility testing | `toAccessibilityProps`, `meetsMinTouchTarget`, `MIN_TOUCH_TARGET` | stable |
| Unit / component / integration / E2E | vitest + `@testing-library/react-native` + playwright (`tests/unit`, `tests/component`, `tests/e2e`) | tool |

## Tooling

| Capability | Public API | Status |
| --- | --- | --- |
| Config plugin (defaults, Universal/App Links, native permissions, build identifiers) | `@your-scope/mobile-template/app.plugin` | tool |
| Diagnostics | `mobile-template-doctor` | tool |
| Framework file migrations | `mobile-template-migrate` | tool |
| Guided update / sync | `mobile-template-update` | tool |
| Project generator | `@your-scope/create-mobile-app` | tool |
| Consumer fixture verification | `pnpm verify:consumer` | tool |

## Deferred (do not depend on)

- Automatic theme persistence wiring inside `ThemeProvider` (the provider still holds the preference in memory; persist it yourself with `createThemePreferenceStore` and feed the value back in).
- A compile step that turns `messages.ts` into hashed ICU ids: `i18n:extract` scans `defineMessages` / `<FormattedMessage>` call sites, which the framework's own catalog does not use (validation covers consistency instead).
- Virtualized Select list for very large option sets (the dropdown uses `ScrollView`).
- Automatic cache hydration ordering across app restarts on top of `ServerStateProvider` (call `createQueryPersister(...).restore` / pass `queryPersister`); the queue and cache both persist, but reconciliation policy is app-owned.
- Migration definitions for real generated files: `mobile-template-migrate` ships the engine and the typed `config`/`dependency`/`template` kinds, but the registry is empty until a breaking file change exists.
- Push notifications, camera, files, background tasks, location, biometrics as runtime deps.
- Analytics/crash/feature-flag vendor integrations and any specific backend or auth provider.
- Remote feature-flag providers; the shipped flags are local overrides only.
- A performance monitor implementation; the package ships the contract and timing helpers.

Adding a deferred capability requires: a real consumer need, an explicit opt-in native
impact note, tests, and a decision to either keep it a contract or bundle it as a runtime
dependency.
