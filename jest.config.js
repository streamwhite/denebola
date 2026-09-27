module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/component/**/*.test.ts?(x)"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/packages/mobile-template/src/$1" },
  // pnpm nests packages under node_modules/.pnpm/<pkg>/node_modules/<pkg>; the
  // preset's allowlist must name @formatjs so its ESM polyfills get transformed.
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@formatjs))",
    "/node_modules/react-native-reanimated/plugin/",
    "/node_modules/@react-native/babel-preset/",
  ],
};
