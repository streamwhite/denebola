import type { ConfigPlugin } from "expo/config-plugins";

const withTemplateDefaults: ConfigPlugin = (config) => ({ ...config, extra: { ...config.extra, template: { version: "1" } } });
export default withTemplateDefaults;
