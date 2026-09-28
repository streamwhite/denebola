import { fireEvent, render } from "@testing-library/react-native";
import { Text as RNText } from "react-native";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { AppIntlProvider, DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

let shouldThrow = true;

function MaybeBoom() {
  if (shouldThrow) throw new Error("boom");
  return <RNText>Recovered</RNText>;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppIntlProvider locale={DEFAULT_LOCALE} setLocale={() => undefined}>
        {children}
      </AppIntlProvider>
    </ThemeProvider>
  );
}

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("renders its children while no error is thrown", async () => {
    shouldThrow = false;
    const view = await render(<Providers><AppErrorBoundary><RNText>Fine</RNText></AppErrorBoundary></Providers>);

    expect(view.getByText("Fine")).toBeTruthy();
  });

  it("captures a render error, reports it and recovers on retry", async () => {
    const onError = jest.fn((_error: Error, _info: unknown) => {
      shouldThrow = false;
    });

    const view = await render(<Providers><AppErrorBoundary onError={onError}><MaybeBoom /></AppErrorBoundary></Providers>);

    expect(view.getByText("Something went wrong")).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);

    await fireEvent.press(view.getByText("Try again"));

    expect(view.getByText("Recovered")).toBeTruthy();
  });
});
