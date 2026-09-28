# denebola public API

Grouped export inventory of the package root. Import everything from `"denebola"`.

Legend: names are runtime exports unless marked **(type)**. **(contract)** = type/interface only — the app provides the implementation. **(tool)** = CLI binary or config plugin. Deferred items are listed at the end and must not be treated as available.

## Providers & runtime

- **Composition** — `MobileTemplateProvider` (props: `queryClient`, `locale`, `defaultLocale`, `messages`, `apiClient`, `themePreference`, `queryPersister`, `onRouteChange`, `onReconnect`), `AppProviders`, `Bootstrap`, `AppErrorBoundary`
- **Error reporting** — `ErrorReporter` (contract), `reportError`, `installGlobalErrorHandler` (contract)
- **Locale** — `AppIntlProvider`, `useLocale`, `useLocaleController`, `LocaleSwitcher`, `detectLocale`, `canonicalLocale`, `localeTag`, `fallbackMessages`, `supportedLocales`, `deviceLocales`, `createLocaleStore`, `createLocaleLoader`, `LOCALE_STORAGE_KEY`
- **Preferences** — `createThemePreferenceStore`, `toThemePreference`, `THEME_PREFERENCE_KEY`, `createPrivacyPreferences`, `hasConsent`, `updateConsent`, `ConsentKey`, `createAccessibilityPreferences`, `prefersReducedMotion`, `createOnboardingStore`, `trackLaunch`, `isFirstLaunch`, `completeOnboarding`
- **i18n** — `useText`, `mergeMessages`, `messages`, `MessageDescriptor` (type), `useI18nFormatters`, `DATE_STYLE_LONG`, `DATE_STYLE_MEDIUM`, `TIME_STYLE_SHORT`, `TRANS_CURRENCY`, `TRANS_UNIT`, `validateTranslations`, `extractPlaceholders`, `ValidationIssue` (type)
- **App / env / version** — `appConfig`, `normalizeAppConfig`, `AppConfig` (type), `environment`, `isProduction`, `resolveEnvironment`, `appVersion`, `toAppVersion`, `framework`, `templateVersion`
- **Feature flags & lifecycle** — `createPluginRegistry`, `createFeatureFlags`, `defaultFeatureFlags`, `FeatureFlagsProvider`, `useFeatureFlag`, `LifecycleProvider`, `useAppLifecycle`, `subscribeToLifecycle`, `toLifecycleState`, `runStartup`, `orderStartupSteps`, `StartupStep`, `classifyLaunch`, `createLaunchTracker`, `LaunchKind`, `SplashAdapter` (contract), `createMemorySplashAdapter`, `TerminationAdapter` (contract), `createMemoryTerminationAdapter`, `updatePolicy`
- **Analytics / perf** — `Analytics` (contract), `noopAnalytics`, `createConsentedAnalytics`, `createSessionTracker`, `SessionTracker`, `CrashReporter` (contract), `noopCrashReporter`, `createMemoryCrashReporter`, `NetworkTracker`, `createMemoryNetworkTracker`, `createPerformanceNetworkTracker`, `PerformanceMonitor` (contract), `measure`, `measureSync`, `usePerformanceMonitor`
- **Logging** — `createLogger`, `logger`, `Logger` (type), `LogLevel`, `resolveLogLevel`, `LoggerContext`, `serializeError`, `SerializedError`, `LogSink` (contract), `createMemoryLogSink`, `createPersistentLogSink`, `formatLogEntries`, `redact`, `REDACTED`

## Navigation

- **Expo Router re-exports** — `Link`, `Stack`, `Tabs`, `Slot`, `Redirect`, `useRouter`, `useSegments`, `usePathname`, `useLocalSearchParams`, `useGlobalSearchParams`
- **Helpers** — `navigation`, `buildPath`, `routeKey`, `isRouteActive`, `modalScreenOptions`, `openModal`, `AppTabs`, `AppTab`, `RouteGuard`, `AuthGuard`, `NavigationStateProvider`, `useNavigationState`, `RouteChangeHandler`
- **Deep links / links** — `parseDeepLink`, `handleDeepLink`, `subscribeToDeepLinks`, `buildDeepLink`, `isAllowedExternalUrl`, `buildUniversalLink`, `isUniversalLink`, `isAppLink`, `appLinkPath`, `isAllowedUrl`, `UrlPolicy` (type), `urlScheme`
- **App integration** — `LinkingAdapter` (contract), `createAppLinker`, `createMemoryLinkingAdapter`, `ShareIntentAdapter` (contract), `parseShareIntent`, `parseIncomingFiles`, `IncomingFile`

## Server state (TanStack Query)

- **Client / hooks** — `createQueryClient`, `QueryClientProvider` (mount via `AppProviders`), re-exported `useQuery`, `useMutation`, `useInfiniteQuery`, `useQueryClient`, …
- **Keys / cache** — `createQueryKeys`, `QueryKey` (type), `isQueryKeyInScope`, `DEFAULT_PAGE_SIZE`, `appendInfinitePage`, `invalidateScope`, `invalidateKeys`, `prefetchQuery`, `snapshotQueries`, `restoreQueries`
- **Optimistic** — `optimisticListUpdate`, `optimisticDetailUpdate`, `rollbackQueries`
- **Defaults** — `refetchOnReconnect`, `refetchOnWindowFocus`, `retryOnApiError`, `QUERY_RETRY_ATTEMPTS`, `queryDefaults`
- **Offline** — `createQueryPersister`, `ServerStateProvider`, `QUERY_CACHE_KEY`, `createSyncQueue`, `SyncQueue` (type)

## Networking / API

- **Client** — `createApiClient`, `ApiClient`, `ApiClientOptions`, `ApiRequestOptions`, `ApiResponse`, `ApiRequestContext`, `HttpMethod`, `ApiResponseInfo`, `AuthTokens`, `toQueryString`
- **Errors** — `ApiError`, `normalizeApiError`, `normalizeNetworkError`
- **Retry / ids** — `RetryPolicy`, `runWithRetry`, `backoffDelay`, `shouldRetry`, `DEFAULT_RETRY`, `delay`, `createRequestId`, `readHeader`, `REQUEST_ID_HEADER`, `CORRELATION_ID_HEADER`, `REQUEST_ABORTED`
- **Transfer / streaming** — `toFormData`, `uploadWithProgress`, `UploadFile` (type), `uploadRatio`, `downloadBlob`, `subscribeToSSE`, `streamResponse`, `parseSSEChunk`, `ServerSentEvent`, `createWebSocketClient`, `WebSocketClient`
- **Context / network** — `ApiProvider`, `useApiClient`, `NetworkProvider`, `useNetwork`, `useIsOffline`, `toNetworkState`, `connectivityStatus`, `isOnline`, `isMetered`, `NetworkState`

## Auth & security

- **Auth** — `AuthProvider`, `useAuth`, `createSessionManager`, `isSessionExpired`, `useAuthGuard`, `AuthGuard`, `useIsAuthenticated`, `useUser`, `updateProfile`, `can`, `canAny`, `hasRole`, `hasAnyRole`, `hasPermission`, `hasAllPermissions`, `useCan`, `useHasRole`, `useHasPermission`
- **OAuth / biometric** — `buildAuthorizationUrl`, `toSession`, `OAuthProviderConfig` (type), `createExpoBiometricAdapter`, `unlockWithBiometrics`, `BiometricAdapter` (contract)
- **Secure storage** — `secureStorage`, `createSecureKV`, `Cipher` (contract), `passthroughCipher`, `createEncryptedStorageCipher`, `createKeyRotation`, `isRotationDue`, `rotationKey`, `createCredentialStore`
- **Storage adapters** — `Storage` (contract), `createMemoryStorage`, `createKeyValueStorage`, `createMemoryKeyValueBackend`, `KeyValueBackend` (contract), `createPreferences`, `PreferencesOptions`, `createStorageCache`, `isExpired`, `CacheEntry`, `createVersionedStorage`, `migrateStoredValue`, `StorageMigration`
- **Security** — `normalizeSecurityConfig`, `auditSecurityConfig`, `SecurityConfig`, `NetworkSecurityAdapter` (contract), `evaluateNetworkSecurity`, `isHostPinned`, `createSensitiveKeyMatcher`, `filterSensitive`, `redactSensitive`, `validateDeepLink`, `DeepLinkError`, `minimalPermissionSet`, `excessPermissions`, `auditDependencies`, `DependencyPolicy`

## Client state

- `createStore`, `useStore` (Zustand re-export), `AppStore`, `createUiStore`, `useUiStore`, `PersistConfig` (type)
- Hydration — `hydrationResult`, `INITIAL_HYDRATION`, `isHydrated`, `HydrationState`
- Persist adapter — `createZustandStorage`, `resetStateStorage`, `STATE_STORAGE_PREFIX`

## Data / SQLite / offline

- `SqlDatabase` (contract), `createExpoSqliteDatabase`, `ExpoSqliteDriver`, `migrate`, `Migration`, `runSqlMigrations`, `createSqlVersionTracker`, `SqlMigration`
- `createRepository`, `TableAdapter` (contract), `createMemoryTableAdapter`, `resolveConflict`, `lastWriteWins`, `resolveWith`
- `createSyncEngine`, `SyncEngine`, `SyncStatus`, `createBackgroundSync`, `BACKGROUND_SYNC_TASK`

## Forms

- `FormInput`, `SubmitButton`, `mapFieldErrors`, `FieldErrors` (type). `react-hook-form`, `@hookform/resolvers` and `zod` are dependencies.

## Build / release

- `RELEASE_PROFILES`, `RELEASE_PROFILE_CONFIG`, `resolveReleaseProfile`, `isReleaseProfile`, `resolveRuntimeVersion`, `isRuntimeCompatible`, `DEFAULT_RUNTIME_VERSION_POLICY`, `decideUpdate`, `OtaUpdate`, `UpdateChannel`, `UpdateDecision`, `selectRollbackTarget`, `PublishedUpdate`, `RollbackTarget`, `signingConfig`, `DEFAULT_SIGNING_CONFIG`, `PlatformSigningConfig`
- EAS: `eas.json` profiles + `pnpm build:*` / `submit:*` / `update:*`; CI in `.github/workflows/ci.yml`

## Update / sync / version

- `frameworkVersion`, `templateVersion`, `framework`, `MODULE_VERSIONS`, `moduleVersion`, `listModuleVersions`, `VERSION_MATRIX`, `checkCompatibility`, `latestCompatibleLine`, `upgradeAvailable`
- Migrations — `FrameworkMigration`, `MigrationFile`, `MigrationKind`, `migrationSummary`, `Codemod`, `codemodById`, `DEFAULT_CODEMODS`
- Semver — `parseSemver`, `compareSemver`, `isNewer`, `classifyChange`, `isBreaking`

## Platform & native

- **Device / platform** — `device`, `readDeviceInfo`, `DeviceInfo`, `platform`, `describePlatform`, `PlatformInfo`, `readOsInfo`, `OsInfo`, `getLifecycleState`, `subscribeToLifecycle`, `createAppStateAdapter`
- **Hardware contracts** — `BatteryAdapter`, `createMemoryBattery`, `noopBattery`, `batteryLevelPercent`, `isLowBattery`, `ClipboardAdapter`, `createMemoryClipboard`, `HapticsAdapter`, `noopHaptics`, `createMemoryHaptics`, `HapticFeedback`, `OrientationAdapter`, `toScreenOrientation`, `isLandscape`, `BrightnessAdapter`, `createMemoryBrightness`, `clampBrightness`, `DEFAULT_BRIGHTNESS`, `readDeviceSecurityState`, `DeviceSecurityState`, `DeviceSecurityAdapter`
- **Notifications** — `parseNotificationPayload`, `NotificationPayload`, `toPushToken`, `PushToken`, `notificationPath`, `createNotificationRouter`, `notificationDeepLink`, `subscribeToNotifications`, `consumeInitialNotification`, `NotificationHandlers`, `createPushTokenManager`, `PushTokenRegistrar`, `LocalNotification`, `NotificationTrigger`, `createNotificationPreferences`, `isNotificationTypeEnabled`, `NotificationAdapter` (contract)
- **Permissions** — `createPermissionService`, `requestPermission`, `requestPermissionStatus`, `isGranted`, `PermissionName`, `createPermissionGate`, `PermissionExplainer`, `readPermissionStates`, `PermissionStates`, `createMemoryPermissionHandle`
- **Files / media** — `FileSystemAdapter`, `createMemoryFileSystem`, `joinPath`, `fileNameFromUrl`, `fileExtension`, `temporaryFileName`, `FilePickerAdapter`, `ShareAdapter`, `OpenFileAdapter`, `importFile`, `importTextFile`, `exportFile`, `writeTextFile`, `createFileCache`, `FILE_CACHE_KEY`, `FileStore` (contract), `FileKind`, `MediaAdapter` (contract), `MediaAsset`, `MediaKind`, `ImageAdapter` (contract), `scaledDimensions`, `clampQuality`, `IMAGE_SIZE_DIMENSIONS`, `createMediaCache`, `toUploadFile`, `toMediaFormData`
- **Background** — `BackgroundTaskAdapter` (contract), `createTaskScheduler`, `BackgroundTaskOptions`, `BackgroundFetchAdapter`, `BackgroundFetchOptions`, `BackgroundLocationAdapter`, `BackgroundLocationOptions`, `LocationSample`
- **Native extension** — `NativeModuleAdapter` (contract), `createMemoryNativeModule`, `NativeEventBridge` (contract), `createMemoryEventBridge`, `normalizeNativeConfig`, `NativeConfig`, `requestedNativePermissions`

## UI / design system

- **Theme & tokens** — `ThemeProvider`, `useTheme`, `ThemePreference`, `resolveColorScheme`, `createTokens`, `lightTokens`, `darkTokens`, `spacing`, `radius`, `fontSize`, `fontWeight`, `lineHeight`, `shadow`, `palette`, `typography`, `useColors`, `useSpacing`, `useRadius`, `useShadow`, `useTypography`, `useThemedStyle`
- **Primitives** — `Text` (`variant`/`tone`), `Button` (`variant`/`size`/`loading`/`icon`), `Input`, `Textarea`, `Card`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `Checkbox`, `Radio`, `Switch`, `Slider`
- **Forms / data** — `Select`, `MultiSelect`, `filterOptions`, `findExact`, `labelFor`, `labelsFor`, `toOption`, `SelectOption` (type), `List`, `ListItem`, `Search`, `Pagination`, `computePagination`, `paginate`, `clampPage`, `PullToRefresh`, `InfiniteList`
- **Overlays** — `Dialog`, `ConfirmationDialog`, `BottomSheet`, `Tooltip`, `ToastProvider`, `useToast`, `ToastOptions`/`ToastApi` (type)
- **Layout & feedback** — `Screen`, `Container`, `KeyboardAvoidingScreen`, `SafeAreaView`, `StateView`, `EmptyState`, `ErrorState`, `LoadingState`, `OfflineState`, `UnauthorizedState`, `NotFoundState`, `cx`

## Utilities

- `createId`, `createPrefixedId`, `createUuid`, `isUuid`
- `Result`, `ok`, `err`, `isOk`, `isErr`, `mapResult`, `unwrapOr`, `toResult`, `toResultAsync`
- `isValidDate`, `toIsoDate`, `addMs`, `diffMs`, `startOfDay`, `formatDate`, `formatInTimeZone`, `deviceTimeZone`
- `Money`, `toMinorUnits`, `toMajorUnits`, `addMoney`, `formatMoney`, `formatNumber`, `clampNumber`, `roundTo`
- `capitalize`, `titleCase`, `truncate`, `slugify`, `isNonEmpty`, `isEmail`, `isUrl`, `isPhoneNumber`, `isNumeric`, `hasMinLength`, `hasMaxLength`, `debounce`, `throttle`

## Testing

- `defineFixture`, `Fixture`, `createFactory`, `createSequence`, `Factory`, `createMockFetch`, `jsonResponse`, `MockRequest`, `createMockStorage`, `createMockPermissionService`, `createMockNativeModule`, `createMockEventBridge`, `stableSnapshot`, `SNAPSHOT_PLACEHOLDER`, `DEFAULT_VOLATILE_KEYS`, `toAccessibilityProps`, `meetsMinTouchTarget`, `MIN_TOUCH_TARGET`

## Tooling

- `denebola/app.plugin` (Expo config plugin), `denebola-doctor`, `denebola-migrate` (`--dry-run`), `denebola-update` (`--apply`), `create-denebola`, `pnpm verify:consumer`

## Deferred (do not depend on)

- Automatic theme-preference persistence inside `ThemeProvider` (wire `createThemePreferenceStore` yourself).
- Hash-id message compilation for the framework catalog; `i18n:extract` targets app `defineMessages` / `<FormattedMessage>` calls.
- Virtualized `Select` list for very large option sets (uses `ScrollView`).
- Automatic offline-cache hydration ordering on top of `ServerStateProvider` (call `createQueryPersister(...).restore` / pass `queryPersister`).
- Migration definitions for real generated files (engine ships; registry is empty until a breaking generated-file change exists).
- Push notifications, camera, files, background tasks, location, biometrics as runtime deps; vendor analytics/crash/remote-flag integrations; any specific backend or auth provider; a performance-monitor implementation (contract + timing helpers only).
