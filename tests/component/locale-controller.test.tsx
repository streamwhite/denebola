import { act, renderHook, waitFor } from "@testing-library/react-native";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";
import { messages } from "@/lib/i18n/messages";
import { useLocaleController } from "@/lib/i18n/useLocaleController";

const source = { en: { hello: "Hello" }, "zh-CN": { hello: "你好" } };
const withFramework = (locale: "en" | "zh-CN", app: Record<string, string>) => ({ ...messages[locale], ...app });

test("resolves the stored locale, persists switches and loads translations", async () => {
  const storage = createMemoryStorage();
  await storage.set("app.locale", "zh-CN");

  const { result } = await renderHook(() => useLocaleController({ source, storage }));

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.locale).toBe("zh-CN");
  expect(result.current.messages).toEqual(withFramework("zh-CN", { hello: "你好" }));

  await act(async () => {
    await result.current.setLocale("en");
  });
  expect(result.current.locale).toBe("en");
  expect(result.current.messages).toEqual(withFramework("en", { hello: "Hello" }));
  expect(await storage.get("app.locale")).toBe("en");
});

test("keeps framework messages available alongside app messages", async () => {
  const { result } = await renderHook(() => useLocaleController({ source }));

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.messages["hello"]).toBe("Hello");
  expect(result.current.messages["common.loading"]).toBe("Loading");
});

test("uses an async loader for translation loading", async () => {
  const load = async (locale: string) => ({ loaded: locale });

  const { result } = await renderHook(() => useLocaleController({ source: ["en"], load }));

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.messages).toEqual({ loaded: "en" });
});
