// Config plugin for denebola.
// Applies package-level defaults that are safe to share across consumers and, when given
// options, wires iOS Universal Links, Android App Links, native permission usage descriptions
// and native build identifiers. Consumers list their own native plugins (expo-router,
// expo-secure-store, etc.) in app.config.ts; this plugin only adds template-owned configuration.
//
//   plugins: [["denebola", {
//     universalLinks: ["example.com"],
//     appLinks: ["example.com"],
//     permissions: { camera: "Allow camera access" },
//     build: { bundleIdentifier: "com.example.app", packageName: "com.example.app" },
//   }]]
//
const DEFAULT_USER_INTERFACE_STYLE = "automatic";

const IOS_PERMISSION_KEYS = {
  camera: "NSCameraUsageDescription",
  photos: "NSPhotoLibraryUsageDescription",
  microphone: "NSMicrophoneUsageDescription",
  location: "NSLocationWhenInUseUsageDescription",
  contacts: "NSContactsUsageDescription",
  bluetooth: "NSBluetoothAlwaysUsageDescription",
};

const ANDROID_PERMISSIONS = {
  camera: "android.permission.CAMERA",
  photos: "android.permission.READ_MEDIA_IMAGES",
  microphone: "android.permission.RECORD_AUDIO",
  location: "android.permission.ACCESS_FINE_LOCATION",
  contacts: "android.permission.READ_CONTACTS",
  bluetooth: "android.permission.BLUETOOTH_CONNECT",
  notifications: "android.permission.POST_NOTIFICATIONS",
};

function appLinkIntentFilter(host) {
  return {
    action: "VIEW",
    autoVerify: true,
    data: [{ scheme: "https", host }],
    category: ["BROWSABLE", "DEFAULT"],
  };
}

function iosPatch(config, { universalLinks, permissions, build }) {
  const patch = {};
  if (universalLinks.length > 0) {
    const existing = config.ios?.associatedDomains ?? [];
    patch.associatedDomains = [...existing, ...universalLinks.map((domain) => `applinks:${domain}`)];
  }
  const infoPlist = {};
  for (const [name, description] of Object.entries(permissions)) {
    const key = IOS_PERMISSION_KEYS[name];
    if (key) infoPlist[key] = description;
  }
  if (Object.keys(infoPlist).length > 0) patch.infoPlist = { ...(config.ios?.infoPlist ?? {}), ...infoPlist };
  if (build.bundleIdentifier !== undefined) patch.bundleIdentifier = build.bundleIdentifier;
  if (build.buildNumber !== undefined) patch.buildNumber = build.buildNumber;
  return patch;
}

function androidPatch(config, { appLinks, permissions, build }) {
  const patch = {};
  if (appLinks.length > 0) {
    const existing = config.android?.intentFilters ?? [];
    patch.intentFilters = [...existing, ...appLinks.map(appLinkIntentFilter)];
  }
  const existingPermissions = config.android?.permissions ?? [];
  const additions = Object.keys(permissions)
    .map((name) => ANDROID_PERMISSIONS[name])
    .filter((permission) => permission && !existingPermissions.includes(permission));
  if (additions.length > 0) patch.permissions = [...existingPermissions, ...additions];
  if (build.packageName !== undefined) patch.package = build.packageName;
  if (build.versionCode !== undefined) patch.versionCode = build.versionCode;
  return patch;
}

module.exports = function withMobileTemplate(config, options = {}) {
  const resolved = {
    universalLinks: options.universalLinks ?? [],
    appLinks: options.appLinks ?? [],
    permissions: options.permissions ?? {},
    build: options.build ?? {},
  };
  const next = { ...config, userInterfaceStyle: config.userInterfaceStyle ?? DEFAULT_USER_INTERFACE_STYLE };

  const ios = iosPatch(config, resolved);
  if (Object.keys(ios).length > 0) next.ios = { ...config.ios, ...ios };

  const android = androidPatch(config, resolved);
  if (Object.keys(android).length > 0) next.android = { ...config.android, ...android };

  return next;
};
