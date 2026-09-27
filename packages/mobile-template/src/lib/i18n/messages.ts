export const messages = {
  en: {
    "common.retry": "Try again",
    "common.loading": "Loading",
    "common.errorTitle": "Something went wrong",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.search": "Search",
    "common.selectPlaceholder": "Select…",
    "common.useValue": 'Use "{value}"',
    "common.prev": "Previous",
    "common.next": "Next",
    "common.pageOf": "Page {page} of {count}",
    "common.language": "Language",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
  },
  "zh-CN": {
    "common.retry": "重试",
    "common.loading": "加载中",
    "common.errorTitle": "出错了",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.search": "搜索",
    "common.selectPlaceholder": "请选择…",
    "common.useValue": "使用“{value}”",
    "common.prev": "上一页",
    "common.next": "下一页",
    "common.pageOf": "第 {page} / {count} 页",
    "common.language": "语言",
    "theme.light": "浅色",
    "theme.dark": "深色",
    "theme.system": "跟随系统",
  },
} as const;

export type Locale = keyof typeof messages;
export type AppMessages = Partial<Record<string, Record<string, string>>>;

export function mergeMessages(locale: string, appMessages?: AppMessages): Record<string, string> {
  const framework = messages[locale as Locale] ?? messages.en;
  return { ...framework, ...appMessages?.[locale] };
}
