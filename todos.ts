export const content = {
  fully_currently_essential: [
    `这个项目使用nativewind`,
    `我主要使用emulator来本地开发,Android studio等相关工具很久没更新了,告诉我怎么更新`,
    `还有因为没法通过wifi连接,如果要使用安卓真机,告诉我怎么配置,添加到md`,
    `使用nativewind替换现有所有的ui`,
    `https://developer.android.com/studio/run/emulator-acceleration?utm_source=android-studio-app&utm_medium=app#vm-windows 写一个shell来启用加速,只要linux的.本机是Ubuntu`,
    `给这个项目给予合适的git ignore尤其是安全方面的`,
    `这个项目能作为一个package发布吗?我想在创建新项目的时候直接当成package来使用,直接成为package`,
    `10. Native Update Rules 不太清楚.native packages应该作为这个package的依赖.就像其他package包含很多依赖一样.只要这个package更新对应的依赖也会更新.`,
    `'pnpm add @your-scope/mobile-template works in a clean Expo project'.consumer项目不需要另外expo,expo作为这个package的依赖,可以通过create-react-app那样直接创建一个项目`,
    `继续按照计划实现并验证,并添加consumer项目的用法示例.`,
    `确保整个项目作为一个普通package下载发布更新等等,其他所有像expo作为它的依赖,就像其他package包含很多依赖一样.只要这个package更新对应的依赖也会更新.发布的时候只要npm publish即可.`,
    [
      `目标:构建 opinioned移动端开发框架(导出接口),基于expo(react native),易于新项目开发(只要便于功能快速开发都可以),整个作为一个package用到新项目(后续如果更新可以快速同步到项目里边),需要你建议一些需要的常用功能,列出这些功能即可
`,
      `目标:构建 opinioned移动端开发框架(导出接口),基于expo(react native),易于新项目开发(只要便于功能快速开发都可以),整个作为一个package用到新项目(后续如果更新可以快速同步到项目里边),需要你建议一些需要的常用功能,列出这些功能即可
`,
      [
        `筛选`,
        `添加skills`,
        `支持App 生命周期管理,App 配置管理,Environment 配置
        * Feature Flags
* Platform 检测
* Device 信息
* App Version / Build Version
* 全局 Provider 管理
* Error Boundary
* 全局错误处理
* 性能监控接口
`,
        `支持:* Expo Router 封装
* Tab Navigation
* Modal Navigation
* Auth Navigation
* Route Guard
* Deep Link
* Universal Links
* Android App Links
* Navigation helper
* Navigation state 管理`,
        `支持 `,
      ],
      `## 核心基础

* App 生命周期管理
* App 配置管理
* Environment 配置
* Feature Flags
* Platform 检测
* Device 信息
* App Version / Build Version
* 全局 Provider 管理
* Error Boundary
* 全局错误处理
* 性能监控接口
*
* 日志
* Debug 工具

## Navigation

* Expo Router 封装
* Tab Navigation
* Modal Navigation
* Auth Navigation
* Route Guard
* Deep Link
* Universal Links
* Android App Links
* Navigation helper
* Navigation state 管理

## UI / Design System

* Theme
* Dark / Light / System
* Design Tokens
* Typography
* Spacing
* Border Radius
* Button
* Input
* Textarea
* * Select(allow input and filter)
* Multi Select(allow input and filter)
* Checkbox
* Radio
* Switch
* Slider
* Card
* Badge
* Avatar
* List
* Dialog
* Bottom Sheet
* Toast
* Snackbar
* Tooltip
* Skeleton
* Spinner
* Empty State
* Error State
* Loading State
* Offline State
* Confirmation Dialog
* Search
* Pagination
* Pull to Refresh
* Infinite Scroll
* Safe Area
* Keyboard handling

## i18n

* Locale 管理
* Locale Detection
* Locale Switching
* Fallback Locale
* ICU Message
* Pluralization
* Date Formatting
* Number Formatting
*currency formatting
* Translation Loading
* Translation Validation
* Translation Extraction

## API / Networking

* HTTP Client
* Request / Response Types
* API Error 标准化
* Authentication Headers
* Token Refresh
* Request Timeout
* Retry
* Request Cancellation
* Network Status
* Offline Detection
* Connectivity Handling
* Upload
* Download
* Multipart
* SSE / Streaming
* WebSocket
* Request ID / Correlation ID

## Server State

* TanStack Query Provider
* Query
* Mutation
* Infinite Query
* Pagination
* Cache
* Cache Invalidation
* Prefetch
* Optimistic Update
* Background Refetch
* Retry Policy
* Offline Cache

## Client State

* Local State
* Global UI State
* Persistent State
* Zustand integration
* State Reset
* State Hydration

## Forms / Validation

* React Hook Form integration
* Zod integration
* Form Field
* Form Error
* Async Validation
* Server Validation Error
* Submit State
* Dirty State
* Unsaved Changes
* Form Reset
* Form Persistence

## Authentication

* Session
* Login
* Logout
* Register
* Password Reset
* Email Verification
* Session Restore
* Token Refresh
* Auth Guard
* User Profile
* Role
* Permission
* RBAC
* OAuth / OIDC abstraction
* Biometric Unlock

## Secure Storage

* Secure Key-Value Storage
* Token Storage
* Credential Storage
* Encryption abstraction
* Key Rotation
* Secure Delete

## Normal Storage

* Key-Value Storage
* Preferences
* Cache
* Persistence
* Versioned Storage
* Migration

## Database / Offline

* SQLite
* Database Migration
* Local Repository
* Local Cache
* Offline Queue
* Sync
* Conflict Handling
* Background Sync

## Notifications

* Push Notification
* Local Notification
* Push Token
* Permission
* Foreground Notification
* Background Notification
* Notification Routing
* Notification Deep Link
* Notification Preferences

## Permissions

* Permission Abstraction
* Camera Permission
* Microphone Permission
* Location Permission
* Notification Permission
* Photo Permission
* Bluetooth Permission
* Contacts Permission
* Permission State
* Permission Request
* Permission Explanation

## Device / Native

* Device Information
* OS Information
* App State
* Battery
* Network
* Clipboard
* Haptics
* Screen Orientation
* Brightness
* Local Authentication
* Device Security State

## Media

* Camera
* Image Picker
* Video Picker
* Image Compression
* Image Resize
* Image Cache
* Image Upload
* File Upload
* File Download
* File Cache

## Files

* File System Abstraction
* File Picker
* File Save
* File Cache
* Temporary Files
* Share
* Open File
* Export
* Import

## Background

* Background Task
* Background Fetch
* Background Location
* Background Sync
* Task Scheduling
* Task Cancellation

## Linking / Integration

* Deep Link
* Universal Link
* Android App Link
* Custom URL Scheme
* External URL Validation
* Share Intent
* Incoming File
* App-to-App Integration

## App Lifecycle

* Startup
* Initialization Pipeline
* Splash Screen
* Foreground
* Background
* Resume
* Cold Start
* Warm Start
* App Termination
* Startup Dependency Management

## UX / User Preferences

* Theme Preference
* Language Preference
* Notification Preference
* Privacy Preference
* Accessibility Preference
* Onboarding State
* First Launch Detection

## Analytics / Observability

* Analytics abstraction
* Event Tracking
* Screen Tracking
* User Identification
* Crash Reporting abstraction
* Error Reporting
* Performance Tracking
* Network Tracking
* Session Tracking
* Privacy / Consent

## Security

* Secure Storage
* Secret Redaction
* URL Validation
* Deep Link Validation
* Permission Minimization
* Sensitive Log Filtering
* Certificate / Network Security abstraction
* Dependency Audit
* Security Configuration

## Common Business Utilities

* UUID / ID
* Date / Time
* Timezone
* Currency / Money
* Number Formatting
* String Utilities
* Validation Utilities
* Pagination Utilities
* Debounce
* Throttle
* Retry
* Result / Error Types

## Native Extension

* Expo Config Plugin
* Native Module Integration
* iOS Native Module
* Android Native Module
* Native Event Bridge
* Native Configuration
* Native Permission Configuration
* Native Build Configuration

## Testing

* Unit Testing
* Component Testing
* Integration Testing
* E2E Testing
* Test Fixtures
* Test Factories
* Mock API
* Mock Storage
* Mock Native Modules
* Mock Permissions
* Snapshot Testing
* Accessibility Testing

## Build / Release

* Development Build
* Development / Preview / Production Profiles
* EAS Build
* EAS Submit
* EAS Update
* Runtime Version
* Update Channel
* Build Version
* Release Version
* Environment Separation
* OTA Update
* Rollback
* Release Configuration
* iOS Signing
* Android Signing
* CI/CD

Expo 当前的 EAS 工作流本身覆盖 Build、Submit、Update、开发构建、内部测试和 runtime/channel 管理，因此这些能力值得作为模板的发布基础设施接口保留。([Expo documentation][1])

## Developer Experience(放弃暂时)

* Project Config CLI
* Module Enable / Disable
* App Configuration Generator
* Environment Generator
* i18n Generator
* Feature Generator
* Screen Generator
* Component Generator
* API Generator
* Hook Generator
* Migration Generator
* Build Command Helpers
* Release Command Helpers
* Diagnostics Command
* Health Check Command

## Package 更新 / 同步

* Framework Version
* Module Version
* Migration System
* Breaking Change Detection
* Project Compatibility Check
* Update CLI
* Config Migration
* Dependency Migration
* Template Migration
* Codemod
* Changelog
* Upgrade Guide
* Version Compatibility Matrix
* doctor / Project Health Check

尤其建议把**Migration + Codemod + Compatibility Check + Update CLI**作为这个 package 的核心能力之一，否则 package 后续升级时很容易变成“升级依赖但项目代码只能手工修改”。

[1]: https://docs.expo.dev/build/introduction/?utm_source=chatgpt.com "EAS Build - Expo documentation"
`,
    ],
    [
      `这个项目,还遗留一些项目代码(不是作为Opinionated Expo(react native) based mobile framework需要的部分,之前测试expo留下来),删除他们`,
    ],
  ],
};
