# Expo React Native Mobile Application Template

## 1. Goal

Build a reusable, production-oriented Expo + React Native mobile application template/package system.

The goal is:

> Start a new mobile project with the engineering foundation already in place, then spend almost all development time on business features.

A new project should provide:

```text
Expo
React Native
TypeScript
Expo Router
UI system
i18n
API layer
server-state management
forms
validation
persistent storage
secure storage
authentication integration
permissions
notifications
deep links
testing
CI/CD
app build/release/update
```

The template should support:

```text
iOS
Android
```

without making web support a requirement for every project.

Expo officially describes Expo Router as the framework for universal React Native applications and recommends starting new Expo projects with `create-expo-app` where Expo Router is already configured.

---

# 2. Core Principles

## 2.1 Infrastructure, not business logic

The template should include:

```text
navigation
UI primitives
API infrastructure
auth abstraction
storage abstraction
common device capabilities
testing
build/release infrastructure
```

It should NOT contain:

```text
business domains
business API endpoints
database schema
specific backend
specific authentication provider
specific analytics provider
specific payment provider
```

---

## 2.2 Prefer Expo ecosystem packages

Use Expo's maintained modules wherever possible instead of adding arbitrary native dependencies.

Examples:

```text
expo-secure-store
expo-notifications
expo-linking
expo-device
expo-constants
expo-file-system
expo-image-picker
expo-camera
expo-local-authentication
expo-sqlite
```

This reduces custom native maintenance and works well with Expo's config-plugin/CNG workflow. Expo's current architecture specifically uses config plugins to apply native configuration during prebuild.

---

# 3. Recommended Stack

## Core

```text
Expo
React Native
TypeScript
Expo Router
```

Use the current stable Expo SDK, but pin exact versions through the lockfile.

Do not build the template around floating `latest` dependencies.

---

## UI

Recommended:

```text
React Native
StyleSheet
Expo-compatible primitives
NativeWind
```

Do not force a large third-party UI framework into every project.

---

## Navigation

```text
expo-router
```

Expo Router is file-based and maps routes from files under `src/app`. It is the recommended routing framework for Expo applications.

---

## Forms

```text
react-hook-form
zod
```

---

## Server State

```text
@tanstack/react-query
```

Use for:

```text
API queries
mutations
cache
pagination
infinite queries
optimistic updates
background refetch
```

Keep server state separate from local UI state.

---

## Client State

Default:

```text
React state
Context
```

Optional:

```text
zustand
```

Only introduce Zustand when substantial cross-screen client state exists.

Do not use Redux by default.

---

## i18n

Recommended:

```text
react-intl
@formatjs/cli
```

Use ICU messages.

---

## Testing

```text
vitest
@testing-library/react-native
@testing-library/user-event
@playwright/test
```

Use React Native Testing Library for component behavior rather than implementation details.

For device/native E2E, evaluate a dedicated mobile E2E tool when required by the project. Do not make Playwright the only mobile-native testing strategy.

---

# 4. Template Packaging Strategy

Do not create one giant package.

Use:

```text
@your-scope/create-expo-app
```

as the project generator.

Then separate reusable runtime packages:

```text
@your-scope/mobile-core
@your-scope/mobile-api
@your-scope/mobile-auth
@your-scope/mobile-storage
@your-scope/mobile-analytics
```

Optional capability packages:

```text
@your-scope/mobile-notifications
@your-scope/mobile-deeplink
@your-scope/mobile-biometric
@your-scope/mobile-files
@your-scope/mobile-camera
```

The scaffold determines which modules are installed.

---

# 5. Why Not One Giant Package?

Avoid:

```text
@your-scope/mobile-framework
```

containing everything.

That creates:

```text
large dependency graph
forced features
coupled upgrades
harder Expo SDK upgrades
unused native modules
```

Instead:

```text
scaffold
  ↓
choose modules
  ↓
generated project
```

The generated application remains a normal Expo project.

This is particularly important because Expo projects often need native configuration through config plugins and CNG. Keeping capabilities modular makes SDK upgrades and native configuration easier to manage.

---

# 6. Recommended Repository

Use a pnpm workspace:

```text
.
├── apps/
│   └── example-app/
│
├── packages/
│   ├── create-expo-app/
│   ├── mobile-core/
│   ├── mobile-api/
│   ├── mobile-auth/
│   ├── mobile-storage/
│   ├── mobile-notifications/
│   ├── mobile-deeplink/
│   └── mobile-analytics/
│
├── examples/
│   ├── basic/
│   ├── auth/
│   └── offline/
│
├── tests/
│
├── package.json
├── pnpm-workspace.yaml
├── biome.json
└── README.md
```

The published scaffold and runtime packages can be maintained independently.

---

# 7. Generated Application Structure

Recommended project:

```text
.
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/
│   │   └── (app)/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── forms/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   └── settings/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── storage/
│   │   ├── i18n/
│   │   ├── permissions/
│   │   └── utils/
│   │
│   ├── providers/
│   │
│   ├── schemas/
│   │
│   ├── types/
│   │
│   └── config/
│
├── assets/
│
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
│
├── app.config.ts
├── eas.json
├── package.json
├── tsconfig.json
├── metro.config.js
├── vitest.config.ts
├── playwright.config.ts
└── biome.json
```

---

# 8. Routing Architecture

Use Expo Router.

Example:

```text
src/app/
├── _layout.tsx
├── index.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
│
└── (app)/
    ├── _layout.tsx
    ├── home.tsx
    ├── settings.tsx
    └── profile.tsx
```

Use route groups to separate:

```text
authentication
main application
onboarding
settings
```

without necessarily affecting URL/deep-link structure.

Expo Router's file-system routing model is designed specifically for this structure.

---

# 9. Navigation Rules

Keep navigation concerns separate from business logic.

Prefer:

```text
feature
 ↓
navigation action
 ↓
router
```

Avoid:

```text
business logic
 ↓
direct manipulation of navigation tree
```

For deep links:

```text
OS
 ↓
Expo Linking
 ↓
Expo Router
 ↓
route
```

---

# 10. Application Providers

Centralize global providers:

```text
src/providers/
  AppProviders.tsx
  QueryProvider.tsx
  IntlProvider.tsx
  ThemeProvider.tsx
  AuthProvider.tsx
```

Recommended ordering:

```text
Gesture/Native infrastructure
        ↓
Theme
        ↓
Query
        ↓
i18n
        ↓
Auth
        ↓
Application
```

Avoid provider nesting becoming unnecessarily deep.

---

# 11. UI Foundation

Build a small design system.

Core primitives:

```text
Button
Text
Input
Card
Avatar
Badge
Separator
Switch
Checkbox
Radio
Select
Modal
BottomSheet
Toast
Spinner
Skeleton
```

Common application components:

```text
Screen
PageHeader
EmptyState
ErrorState
LoadingState
OfflineState
ConfirmDialog
ListItem
Section
```

Avoid building a 100-component design system before actual projects demonstrate the need.

---

# 12. Styling Strategy

Prefer:

```text
StyleSheet
```

for stable foundational components.

Optional:

```text
NativeWind
```

for rapid application-level development.

Do not mix five styling paradigms.

Choose one primary approach per generated project.

---

# 13. Theme System

Support:

```text
light
dark
system
```

Define semantic tokens:

```text
background
foreground
primary
secondary
muted
destructive
border
card
```

Centralize:

```text
colors
spacing
typography
radii
shadows
```

Theme changes should not require editing every component.

---

# 14. Responsive Layout

React Native layout should primarily use:

```text
Flexbox
Dimensions
useWindowDimensions
safe areas
platform-specific layout
```

Avoid excessive device-specific conditionals.

Prefer adaptive layouts.

---

# 15. Safe Areas

Use Expo's supported safe-area facilities.

Every screen should correctly handle:

```text
status bar
notch
Dynamic Island
navigation area
home indicator
```

Do not hard-code top/bottom paddings for individual devices.

---

# 16. Forms

Standardize:

```text
React Hook Form
+
Zod
```

Pattern:

```text
schema
 ↓
form
 ↓
validation
 ↓
API mutation
 ↓
success/error
```

Common reusable components:

```text
FormField
FormInput
FormSelect
FormCheckbox
FormError
SubmitButton
```

---

# 17. API Layer

Create a typed API abstraction:

```text
src/lib/api/
  client.ts
  errors.ts
  types.ts
```

Responsibilities:

```text
base URL
headers
authentication
serialization
timeout
error normalization
request ID
```

Do not scatter raw HTTP requests across components.

---

# 18. API Contract

Preferred:

```text
OpenAPI
```

Backend:

```text
openapi.json
```

Frontend:

```text
generated types/client
```

Alternative:

```text
shared Zod schema package
```

Avoid manually maintaining large duplicated API types.

---

# 19. Authentication

Do not embed one authentication provider into the template.

Create:

```text
src/lib/auth/
  types.ts
  session.ts
  client.ts
```

Concepts:

```text
User
Session
AccessToken
RefreshToken
```

The template should support:

```text
login
logout
restore session
refresh session
authenticated requests
```

but leave the actual backend/provider implementation replaceable.

---

# 20. Token Storage

Sensitive tokens must not be stored in plain AsyncStorage-like storage.

Use:

```text
expo-secure-store
```

for sensitive values.

Expo documents SecureStore specifically for encrypted key-value storage on the device.

Example separation:

```text
SecureStore
  access token
  refresh token

regular storage
  theme
  locale
  UI preferences
```

---

# 21. Persistent Storage

Provide a storage interface:

```text
Storage
  get()
  set()
  remove()
  clear()
```

Allow implementations such as:

```text
SecureStore
AsyncStorage-compatible store
expo-sqlite
```

Do not couple application code directly to one storage implementation.

---

# 22. Local Database / Offline

Make SQLite optional.

Use:

```text
expo-sqlite
```

for projects requiring:

```text
offline-first
large local datasets
relational data
full-text search
local cache
```

Expo's current SQLite package provides persistent SQLite storage and also exposes a key-value store; it supports configuration through config plugins when using CNG.

Do not add SQLite to every simple CRUD application.

---

# 23. Server State

Use TanStack Query:

```text
useQuery
useMutation
useInfiniteQuery
queryClient
```

Example:

```text
screen
 ↓
query
 ↓
API client
 ↓
backend
```

Benefits:

```text
cache
deduplication
retry
refetch
mutation lifecycle
offline handling
```

Keep:

```text
TanStack Query
```

for server state.

Keep:

```text
React/Zustand
```

for client state.

---

# 24. Offline Strategy

Define a common offline model:

```text
online
offline
connecting
error
retrying
```

TanStack Query can provide server-state handling, but application-specific offline writes should have an explicit strategy.

For simple applications:

```text
read cache
+
retry
```

For offline-first applications:

```text
SQLite
+
sync queue
+
conflict handling
```

Do not pretend all apps need offline-first synchronization.

---

# 25. i18n

Use:

```text
react-intl
@formatjs/cli
```

Structure:

```text
messages/
  en.json
  zh-CN.json
```

Support:

```text
locale detection
fallback locale
pluralization
interpolation
date formatting
number formatting
relative time
```

Keep all user-facing strings externalized.

---

# 26. Device Capabilities

Create optional modules for:

```text
Device Info
Battery
Network State
App Version
Platform
Locale
```

Use Expo modules where possible.

---

# 27. Permissions

Centralize permission handling.

Examples:

```text
camera
photos
notifications
location
microphone
contacts
bluetooth
```

Do not ask for permissions at application startup unless absolutely necessary.

Preferred:

```text
user action
 ↓
explain why permission is needed
 ↓
request permission
 ↓
handle granted/denied/restricted
```

Permission logic should live outside UI components where practical.

---

# 28. Notifications

Optional module:

```text
expo-notifications
```

Support:

```text
push token
permission
receive
foreground handling
background response
notification navigation
local notifications
```

Expo Notifications provides APIs for fetching tokens, presenting notifications, scheduling local notifications, and responding to notifications.

For production push notifications, use a development build rather than relying on Expo Go where the required native functionality is unavailable.

---

# 29. Notification Architecture

Do not let arbitrary notification payloads directly navigate to arbitrary application logic.

Use:

```text
notification
 ↓
validate payload
 ↓
map event type
 ↓
router
 ↓
screen
```

Example:

```text
type: "message"
id: "123"
```

maps to:

```text
/messages/123
```

after validation.

---

# 30. Deep Linking

Provide:

```text
expo-linking
expo-router
```

Support:

```text
myapp://profile/123
```

and Universal Links / App Links where required.

Architecture:

```text
external URL
 ↓
validate
 ↓
router
 ↓
screen
```

Never trust arbitrary deep-link payloads.

---

# 31. Secure External URL Handling

Validate:

```text
scheme
host
path
parameters
```

before opening external URLs.

Prefer explicit allowlists:

```text
https
mailto
your-app-scheme
```

Avoid accepting arbitrary schemes.

---

# 32. Biometric Authentication

Optional module:

```text
expo-local-authentication
```

Use for:

```text
unlock
sensitive action
local app protection
```

Do not treat biometrics as a replacement for backend authentication.

Use them as:

```text
local user-presence verification
```

---

# 33. File System

Optional:

```text
expo-file-system
```

Use an abstraction for:

```text
download
upload
cache
temporary files
local documents
```

Separate:

```text
cache
temporary
persistent user files
```

Never store sensitive files in public/shared locations unless required.

---

# 34. Camera / Media

Optional modules:

```text
expo-camera
expo-image-picker
expo-image
```

Potential capabilities:

```text
camera
photo selection
image display
compression
upload
```

Do not add camera dependencies to applications that do not use them.

---

# 35. Clipboard / Haptics

Common lightweight capabilities:

```text
expo-clipboard
expo-haptics
```

Provide small wrappers:

```text
clipboard.copy()
haptics.success()
haptics.error()
```

Do not spread direct native calls throughout feature code.

---

# 36. App Lifecycle

Create an application lifecycle abstraction.

Handle:

```text
cold start
foreground
background
inactive
app opened from notification
app opened from deep link
```

This becomes especially important for:

```text
auth restoration
notification routing
data refresh
analytics
sync
```

---

# 37. Startup Flow

Standardize startup:

```text
Native startup
      ↓
load configuration
      ↓
restore secure session
      ↓
initialize i18n
      ↓
initialize storage
      ↓
initialize query client
      ↓
resolve initial route
      ↓
render application
```

Avoid showing an authenticated application before the session state is known.

---

# 38. Splash Screen

Use:

```text
expo-splash-screen
```

for controlled startup behavior.

The splash screen should remain visible while essential initialization occurs.

Expo recommends testing final splash-screen behavior on an actual release build because Expo Go/development builds do not fully reproduce the standalone experience.

---

# 39. Error Handling

Provide standard states:

```text
Loading
Empty
Error
Offline
Unauthorized
Forbidden
Not Found
```

Reusable components:

```text
LoadingState
EmptyState
ErrorState
OfflineState
UnauthorizedState
NotFoundState
```

---

# 40. Error Boundaries

Provide application-level error boundaries.

Separate:

```text
expected API errors
```

from:

```text
unexpected application crashes
```

Show users:

```text
safe message
retry
go home
contact support
```

Do not expose internal stack traces.

---

# 41. Networking Errors

Normalize:

```text
timeout
network unavailable
DNS failure
401
403
404
409
422
429
5xx
```

into a common error model.

Example:

```text
ApiError
  status
  code
  message
  details
  retryable
```

---

# 42. Accessibility

Baseline:

```text
semantic roles
accessible labels
screen reader support
dynamic text
minimum touch target
color contrast
keyboard support where applicable
reduced motion consideration
```

Accessibility should be part of reusable primitives rather than added afterward.

---

# 43. Performance

Default principles:

```text
avoid unnecessary re-renders
memoize only where measured
virtualize long lists
optimize images
avoid huge JS payloads
avoid unnecessary state
lazy-load expensive features
```

Use:

```text
FlatList
FlashList if justified
```

for large lists.

Do not automatically add performance libraries everywhere.

---

# 44. Images

Use Expo's image facilities where appropriate.

Establish:

```text
thumbnail
medium
full
```

image sizing conventions.

Avoid loading original high-resolution images into list screens.

---

# 45. Analytics

Do not hard-code an analytics vendor.

Create:

```text
analytics.track()
analytics.identify()
analytics.screen()
```

Optional implementations:

```text
Sentry
PostHog
Amplitude
Firebase
```

The application should depend on your interface, not directly on the vendor.

---

# 46. Observability

Provide integration points for:

```text
crash reporting
performance monitoring
analytics
structured events
```

Recommended abstraction:

```text
logger
analytics
errorReporter
```

Avoid scattering vendor-specific calls throughout the application.

---

# 47. Security

Security baseline:

```text
no secrets in source control
no secrets in public environment variables
secure token storage
minimum permissions
validated deep links
validated external URLs
safe logging
dependency auditing
current Expo/RN versions
```

Treat the mobile client as an untrusted environment.

Backend authorization remains authoritative.

---

# 48. Environment Configuration

Separate:

```text
development
preview
production
```

Example:

```text
EXPO_PUBLIC_API_URL
```

for non-secret client configuration.

Never put:

```text
API_SECRET
PRIVATE_KEY
DATABASE_PASSWORD
```

in Expo public/client environment variables.

Use build-time/CI secret management for sensitive values.

---

# 49. App Configuration

Prefer:

```text
app.config.ts
```

rather than hard-coding platform-specific values across the project.

Centralize:

```text
name
slug
scheme
bundleIdentifier
package
version
icons
splash
permissions
plugins
```

---

# 50. Config Plugins

Any custom native configuration should preferably be expressed through config plugins rather than manually editing generated native projects when using CNG.

Expo explicitly recommends config plugins for applying native changes predictably during prebuild.

Examples:

```text
withNotifications
withBiometrics
withDeepLink
withCustomEntitlements
withAppExtensions
```

---

# 51. CNG Strategy

Use Continuous Native Generation where practical.

Concept:

```text
app.config.ts
       ↓
config plugins
       ↓
Expo prebuild
       ↓
ios/android
       ↓
build
```

Keep customization definitions in source control rather than relying on undocumented manual modifications to generated native projects.

Expo explicitly recommends CNG/prebuild for managing generated native projects and config plugins for persistent customizations.

---

# 52. Native Escape Hatch

The template must still support native development.

When Expo does not provide the required capability:

```text
React Native native module
or
Expo Modules API
```

can be used.

The project should not prevent:

```text
Swift
Kotlin
Objective-C
Java
```

integration.

Expo Modules API is designed to let libraries expose native modules, while config plugins automate native project configuration.

---

# 53. Development Builds

Treat development builds as the normal development environment for production-oriented applications.

Use:

```text
expo-dev-client
```

when native functionality/custom modules are needed.

Expo describes development builds as customizable versions of Expo Go that support custom native code and are intended for full-fledged application development.

Do not design the template around:

```text
Expo Go only
```

---

# 54. Build Profiles

Provide:

```text
development
preview
production
```

Example:

```text
development
→ development client

preview
→ internal distribution

production
→ store release
```

Use `eas.json`.

EAS Build supports named profiles and can build Android/iOS binaries; EAS also integrates with signing and internal distribution.

---

# 55. EAS

Use:

```text
EAS Build
EAS Submit
EAS Update
```

as the default release path.

EAS provides managed build/signing, App Store/Google Play submission, and OTA updates for non-native application changes.

---

# 56. OTA Update Policy

Use EAS Update carefully.

Suitable for:

```text
JS changes
styling
images
non-native changes
```

Not suitable for assuming that native changes can be shipped without a new binary.

Use release channels:

```text
development
staging
production
```

EAS Update supports channels associated with build profiles.

---

# 57. Version Management

Separate:

```text
marketing version
build number
runtime/update compatibility
```

Automate version increments in CI.

Never manually edit version numbers in multiple files.

---

# 58. Testing Strategy

Use a pyramid.

## Unit

Vitest:

```text
utilities
schemas
formatters
state logic
API mapping
business rules
```

## Component

React Native Testing Library:

```text
screen behavior
forms
buttons
loading
error
empty
accessibility
```

Testing Library emphasizes testing public/user behavior rather than implementation details.

## Integration

Test:

```text
component
+
API abstraction
+
state
```

with mocked network responses.

## E2E

Test:

```text
login
onboarding
main workflow
critical CRUD
deep links
notification flows
logout
```

Keep E2E focused on critical user journeys.

---

# 59. Native E2E

For critical apps, add a native-device E2E layer when necessary.

Candidate tools can include:

```text
Maestro

```

Playwright remains useful for web/universal testing, but should not be assumed to cover every native-device behavior.

---

# 60. Mocking

Create centralized test utilities:

```text
tests/
  mocks/
  fixtures/
  factories/
```

Mock:

```text
API
secure storage
notifications
permissions
device APIs
filesystem
```

Unit tests should not depend on actual device state.

---

# 61. Test Environment

Have:

```text
development
test
preview
production
```

and keep test credentials/data separate.

Never run automated destructive tests against production services.

---

# 62. CI

Recommended pipeline:

```text
install
 ↓
format check
 ↓
lint
 ↓
typecheck
 ↓
unit tests
 ↓
component tests
 ↓
build validation
 ↓
E2E
 ↓
EAS build
 ↓
submit/publish
```

Use GitHub Actions or another CI platform.

---

# 63. Code Quality

Use:

```text
Biome
TypeScript strict mode
pnpm
```

Recommended scripts:

```text
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm check
```

---

# 64. Dependency Policy

### Core

```text
expo
react
react-native
expo-router
typescript
```

### Application

```text
react-hook-form
zod
@tanstack/react-query
react-intl
```

### Testing

```text
vitest
@testing-library/react-native
@testing-library/user-event
@playwright/test
```

### Optional

```text
zustand
nativewind
expo-sqlite
expo-notifications
expo-local-authentication
expo-image-picker
expo-camera
expo-file-system
```

Install optional native modules only when needed.

---

# 65. Common Modules

The package ecosystem should eventually provide:

```text
@your-scope/mobile-auth
@your-scope/mobile-api
@your-scope/mobile-storage
@your-scope/mobile-notifications
@your-scope/mobile-deeplink
@your-scope/mobile-permissions
@your-scope/mobile-files
@your-scope/mobile-analytics
@your-scope/mobile-logging
@your-scope/mobile-device
```

Each package should have:

```text
runtime code
TypeScript types
tests
documentation
config plugin if needed
```

---

# 66. Module Design

Every module should expose a small API.

Example:

```text
notifications.register()
notifications.getToken()
notifications.schedule()
```

Avoid:

```text
entire native module exposed globally
```

Keep capabilities narrow.

---

# 67. Plugin / Extension System

The template should support extensions.

Define:

```text
MobilePlugin
  id
  name
  dependencies
  initialize()
  configure()
```

Possible extension points:

```text
navigation
commands
settings
analytics
storage
notifications
```

---

# 68. Capability-Based Extensions

Extensions should request capabilities explicitly.

Example:

```text
plugin:
  notifications
  secureStorage
  deepLinks
```

Avoid giving a plugin unrestricted access to:

```text
filesystem
network
native modules
```

unless explicitly required.

---

# 69. White-Label Support

Central configuration:

```text
src/config/app.ts
```

Include:

```text
appName
appIdentifier
defaultLocale
supportedLocales
theme
features
api
```

Brand-specific values should not require editing infrastructure code.

---

# 70. Feature Flags

Provide local feature flags:

```text
features:
  newHome: true
  notifications: false
  offlineMode: false
```

Optional remote feature flags can later implement the same interface.

Do not add a feature-flag SaaS by default.

---

# 71. App Update / Migration

Whenever persistent storage schemas change:

```text
version
 ↓
migration
 ↓
new schema
```

SQLite projects must have explicit migration strategy.

Do not rely on deleting/recreating the database in production.

---

# 72. Common Screens

Provide example implementations:

```text
Splash
Login
Register
Forgot Password
Home
Settings
Profile
About
Error
Offline
Not Found
```

These are examples only and should remain easy to delete.

---

# 73. Common UX Patterns

Provide examples for:

```text
List
Detail
Create
Edit
Delete
Search
Filter
Pagination
Pull to Refresh
Infinite Scroll
Modal
Bottom Sheet
Confirmation
```

The examples demonstrate the preferred architecture.

---

# 74. Pull to Refresh

Standardize:

```text
refreshing
onRefresh
error
empty
```

and integrate with TanStack Query where appropriate.

---

# 75. Infinite Lists

Use:

```text
useInfiniteQuery
FlatList
```

or an appropriate performant list implementation.

Avoid loading the full dataset into memory.

---

# 76. Forms UX

Standardize:

```text
field error
submit loading
keyboard handling
focus next field
unsaved changes
server validation
success feedback
```

Forms should behave consistently across projects.

---

# 77. Keyboard Handling

Forms should account for:

```text
iOS keyboard
Android keyboard
scrolling
focused field visibility
submit action
```

Do not hard-code offsets for one device.

---

# 78. Background Work

Keep background tasks optional.

Potential capabilities:

```text
background fetch
location
notifications
file transfers
sync
```

Background work must respect platform restrictions.

Do not assume an application can run arbitrary code indefinitely in the background.

---

# 79. Deep Integration with OS

Optional modules:

```text
widgets
share extensions
app shortcuts
universal links
Android intents
iOS extensions
```

These should use config plugins/native modules rather than polluting the core template.

---

# 80. Security Review Checklist

Before each release:

```text
dependencies audited
secrets checked
permissions reviewed
deep links validated
external URLs validated
secure storage used
logs reviewed
production configuration reviewed
EAS credentials reviewed
OTA channels reviewed
```

---

# 81. Upgrade Strategy

Expo SDK upgrades are a first-class maintenance task.

When upgrading:

```text
Expo SDK
 ↓
React Native version
 ↓
Expo modules
 ↓
native dependencies
 ↓
config plugins
 ↓
iOS/Android build
 ↓
E2E
```

Do not upgrade Expo blindly with a generic dependency upgrade.

Use the official Expo upgrade procedure and validate both native platforms.

---

# 82. Example Scaffold Flow

```text
pnpm dlx @your-scope/create-expo-app my-app
```

Interactive setup:

```text
Application name
Bundle identifier
Package name

Default language
Supported languages

Authentication?
TanStack Query?
SQLite?
Notifications?
Deep links?
Biometrics?
Analytics?
Sentry?
NativeWind?
```

Then:

```text
configure
 ↓
install dependencies
 ↓
configure plugins
 ↓
generate project
 ↓
initialize git
 ↓
run checks
```

---

# 83. Generated Development Flow

```text
pnpm dev
```

for normal Metro/Expo development.

When native functionality is required:

```text
pnpm ios
pnpm android
```

using a development build.

For cloud development builds:

```text
eas build --profile development
```

EAS officially supports development builds and internal distribution workflows.

---

# 84. Release Flow

```text
feature
 ↓
PR
 ↓
format/lint/typecheck
 ↓
unit/component
 ↓
E2E
 ↓
preview build
 ↓
internal testing
 ↓
production build
 ↓
sign
 ↓
App Store / Google Play
 ↓
EAS Update for compatible JS-only fixes
```

EAS supports Build, Submit and Update as separate parts of the application lifecycle.

---

# 85. P0 — Must Have

```text
Expo
React Native
TypeScript
Expo Router

React Hook Form
Zod
TanStack Query

react-intl
@formatjs/cli

Biome
Vitest
React Native Testing Library

Expo SecureStore

Expo development build
EAS Build
EAS Submit
EAS Update
```

---

# 86. P1 — High Value

```text
theme
storage abstraction
API client
auth abstraction
error model
loading/empty/error states
device context
permissions abstraction
deep links
notifications
logging
analytics abstraction

CI
E2E
```

---

# 87. P2 — Optional Modules

```text
SQLite
biometrics
camera
image picker
filesystem
offline sync
background tasks
share
app shortcuts
widgets
```

---

# 88. P3 — Advanced

```text
plugin system
native module SDK
signed extensions
offline-first sync engine
advanced telemetry
native iOS extensions
native Android integrations
```

---

# 89. V1 Non-Goals

Do not include by default:

```text
Redux
GraphQL
specific authentication provider
specific backend
specific analytics provider
specific payment provider
large UI framework
database
offline sync engine
remote feature-flag SaaS
plugin marketplace
custom native modules
```

The template should remain lightweight.

---

# 90. Definition of Done

A newly generated application should immediately have:

## Development

```text
Expo
React Native
TypeScript
Expo Router
Fast development workflow
Development build support
```

## UI

```text
theme
navigation
forms
dialogs
loading
empty
error
responsive layout
accessibility baseline
```

## Data

```text
typed API client
TanStack Query
validation
storage
secure token storage
```

## Platform

```text
notifications
deep links
permissions
device information
```

## Quality

```text
Biome
typecheck
Vitest
React Native Testing Library
E2E
CI
```

## Release

```text
EAS Build
EAS Submit
EAS Update
version management
environment separation
```

---

# 91. Final Architecture

```text
                         Expo Mobile App
                                │
                   ┌────────────┴────────────┐
                   │                         │
                 Router                    UI
                   │                         │
             Expo Router              Components
                   │                  Design System
                   │                       │
                   └───────────┬───────────┘
                               │
                         Feature Layer
                               │
              ┌────────────────┼────────────────┐
              │                │                │
             API             State            Forms
              │                │                │
       API Client         TanStack Query    RHF + Zod
              │             Zustand*             │
              │                                   │
              └────────────────┬──────────────────┘
                               │
                     Platform Abstraction
                               │
        ┌──────────────┬───────┼────────┬──────────────┐
        │              │       │        │              │
     SecureStore   SQLite   Notify   Deep Link      Device
        │              │       │        │              │
        └──────────────┴───────┴────────┴──────────────┘
                               │
                         Expo Modules
                               │
                     iOS / Android Native
                               │
                  ┌────────────┴────────────┐
                  │                         │
                Swift                    Kotlin
                  │                         │
                  └────────────┬────────────┘
                               │
                              OS


Cross-cutting:

i18n
  └── React Intl / FormatJS

Testing
  ├── Vitest
  ├── React Native Testing Library
  └── E2E

Security
  ├── SecureStore
  ├── permission minimization
  ├── deep-link validation
  ├── safe logging
  └── dependency auditing

Native configuration
  └── CNG + Config Plugins

Release
  ├── EAS Build
  ├── EAS Submit
  └── EAS Update
```

# 92. Most Important Engineering Rules

## Rule 1

```text
Expo Router
```

is the application navigation foundation.

---

## Rule 3

```text
Renderer/UI code
        ↓
application abstractions
        ↓
Expo modules
```

Do not scatter direct native-module calls throughout features.

---

## Rule 4

```text
Secure data
→ SecureStore

Normal preferences
→ ordinary storage

Structured/offline data
→ SQLite
```

Do not use one storage mechanism for everything. Expo specifically provides SecureStore for secure key-value storage and SQLite for persistent relational storage.

---

## Rule 5

```text
Server state
→ TanStack Query

Local UI state
→ React state / Context

Complex global client state
→ Zustand when necessary
```

---

## Rule 6

```text
Native customization
→ Config Plugin
→ CNG
```

rather than arbitrary repeated manual edits to generated native projects.

---

## Rule 7

```text
Core template
= small

Capabilities
= optional modules
```

Do not force every project to carry every native dependency.

---

## Rule 8

```text
Backend
= independent

Mobile app
= client
```

The mobile application should never be treated as a trusted security boundary.

---

## Rule 9

```text
Template
→ infrastructure

Feature
→ business logic
```

Maintain this separation throughout the lifetime of the template.

---

# 93. Final Package Ecosystem

A mature version should look approximately like:

```text
@your-scope/create-expo-app
          │
          ├── @your-scope/mobile-core
          ├── @your-scope/mobile-api
          ├── @your-scope/mobile-auth
          ├── @your-scope/mobile-storage
          │
          ├── @your-scope/mobile-notifications
          ├── @your-scope/mobile-deeplink
          ├── @your-scope/mobile-permissions
          ├── @your-scope/mobile-biometric
          ├── @your-scope/mobile-files
          ├── @your-scope/mobile-device
          ├── @your-scope/mobile-analytics
          └── @your-scope/mobile-logging
```

The important distinction is:

```text
create-expo-app
→ creates a normal independent Expo application

mobile-core/modules
→ reusable infrastructure

features/
→ owned entirely by each project
```

This gives you the same advantage as the Electron template: **strong conventions around architecture, testing, security and release, while leaving the actual business application free to evolve independently.**
