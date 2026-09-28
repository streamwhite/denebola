import { fireEvent, render } from "@testing-library/react-native";
import { Text as RNText } from "react-native";
import { InfiniteList } from "@/components/data/InfiniteList";
import { List } from "@/components/data/List";
import { AppIntlProvider, DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

type Item = { id: string; label: string };

const items: Item[] = [
  { id: "1", label: "One" },
  { id: "2", label: "Two" },
];

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppIntlProvider locale={DEFAULT_LOCALE} setLocale={() => undefined}>
        {children}
      </AppIntlProvider>
    </ThemeProvider>
  );
}

const keyExtractor = (item: Item) => item.id;
const renderLabel = (item: Item) => <RNText>{item.label}</RNText>;

describe("List", () => {
  it("renders the loading, error-with-retry and empty states", async () => {
    const loading = await render(<Providers><List data={[]} keyExtractor={keyExtractor} renderItem={() => null} loading /></Providers>);
    expect(loading.getByLabelText("Loading")).toBeTruthy();

    const onRetry = jest.fn();
    const failed = await render(<Providers><List data={[]} keyExtractor={keyExtractor} renderItem={() => null} error={{ message: "Nope" }} onRetry={onRetry} /></Providers>);
    expect(failed.getByText("Nope")).toBeTruthy();
    await fireEvent.press(failed.getByText("Try again"));
    expect(onRetry).toHaveBeenCalled();

    const empty = await render(<Providers><List data={[]} keyExtractor={keyExtractor} renderItem={renderLabel} emptyTitle="Nothing here" /></Providers>);
    expect(empty.getByText("Nothing here")).toBeTruthy();
  });

  it("renders the provided data", async () => {
    const view = await render(<Providers><List data={items} keyExtractor={keyExtractor} renderItem={renderLabel} /></Providers>);

    expect(view.getByText("One")).toBeTruthy();
    expect(view.getByText("Two")).toBeTruthy();
  });
});

describe("InfiniteList", () => {
  it("renders items and an empty state", async () => {
    const view = await render(<Providers><InfiniteList data={items} keyExtractor={keyExtractor} renderItem={renderLabel} /></Providers>);
    expect(view.getByText("One")).toBeTruthy();

    const empty = await render(<Providers><InfiniteList data={[]} keyExtractor={keyExtractor} renderItem={renderLabel} emptyTitle="No more" /></Providers>);
    expect(empty.getByText("No more")).toBeTruthy();
  });

  it("shows a footer spinner while loading more", async () => {
    const view = await render(<Providers><InfiniteList data={items} keyExtractor={keyExtractor} renderItem={renderLabel} loadingMore /></Providers>);

    const spinners = view.container.queryAll((node) => node.type === "ActivityIndicator");
    expect(spinners.length).toBeGreaterThan(0);
  });
});
