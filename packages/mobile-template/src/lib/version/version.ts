import manifest from "../../../package.json";

export const templateVersion: string = manifest.version;

export type FrameworkInfo = { name: string; version: string; expo: string; react: string; reactNative: string };

export const framework: FrameworkInfo = {
  name: manifest.name,
  version: manifest.version,
  expo: manifest.dependencies.expo,
  react: manifest.peerDependencies.react,
  reactNative: manifest.peerDependencies["react-native"],
};
