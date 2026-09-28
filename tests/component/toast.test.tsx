import { act, render } from "@testing-library/react-native";
import { ToastProvider, useToast, type ToastApi } from "@/components/overlays/ToastProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function Probe({ onApi }: { onApi: (api: ToastApi) => void }) {
  const api = useToast();
  onApi(api);
  return null;
}

async function renderToast() {
  let api: ToastApi | undefined;
  const utils = await render(
    <ThemeProvider>
      <ToastProvider>
        <Probe onApi={(value) => { api = value; }} />
      </ToastProvider>
    </ThemeProvider>,
  );
  return { ...utils, api: () => api as ToastApi };
}

describe("ToastProvider", () => {
  it("throws when useToast is used outside ToastProvider", async () => {
    await expect(render(<Probe onApi={() => undefined} />)).rejects.toThrow(/ToastProvider/);
  });

  it("assigns an id, renders the message and auto-dismisses after the duration", async () => {
    const view = await renderToast();

    jest.useFakeTimers();
    const id = await act(async () => view.api().show({ message: "Saved", tone: "success", durationMs: 1_000 }));

    expect(id).toBe("toast-0");
    expect(view.getByText("Saved")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    jest.useRealTimers();

    expect(view.queryByText("Saved")).toBeNull();
  });

  it("dismisses a single toast by id and clears the rest", async () => {
    const view = await renderToast();

    let first = "";
    await act(async () => {
      first = view.api().show({ message: "First" });
      view.api().show({ message: "Second" });
    });
    expect(view.getByText("First")).toBeTruthy();

    await act(async () => view.api().dismiss(first));
    expect(view.queryByText("First")).toBeNull();
    expect(view.getByText("Second")).toBeTruthy();

    await act(async () => view.api().clear());
    expect(view.queryByText("Second")).toBeNull();
  });
});
