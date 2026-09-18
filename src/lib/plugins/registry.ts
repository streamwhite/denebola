import type { MobilePlugin } from "@/lib/plugins/types";

type PluginLogger = { info: (value: string) => void; error?: (value: string) => void };

export function createPluginRegistry({ logger }: { logger: PluginLogger }) {
  const plugins: MobilePlugin[] = [];
  return {
    register(plugin: MobilePlugin) { if (!plugins.some((item) => item.id === plugin.id)) plugins.push(plugin); },
    async initialize() { for (const plugin of plugins) { try { await plugin.initialize(); } catch (error) { logger.error?.(`Plugin ${plugin.id} failed: ${String(error)}`); } } },
    list: () => [...plugins],
  };
}
