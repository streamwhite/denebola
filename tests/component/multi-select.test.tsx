import { fireEvent, render } from "@testing-library/react-native";
import { useState } from "react";
import { MultiSelect } from "@/components/forms/MultiSelect";
import type { SelectOption } from "@/components/forms/selectCore";
import { AppIntlProvider, DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const options: SelectOption[] = [
  { value: "ada", label: "Ada Lovelace" },
  { value: "alan", label: "Alan Turing" },
  { value: "grace", label: "Grace Hopper", disabled: true },
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

function Harness({ onSelect, initial = [], max, allowCustom = false }: { onSelect: (values: string[]) => void; initial?: string[]; max?: number; allowCustom?: boolean }) {
  const [values, setValues] = useState<string[]>(initial);
  return (
    <MultiSelect
      options={options}
      values={values}
      max={max}
      allowCustom={allowCustom}
      onChange={(next) => {
        setValues(next);
        onSelect(next);
      }}
    />
  );
}

// The trigger Pressable is the first button; chip remove buttons follow it.
async function openOptions(view: Awaited<ReturnType<typeof render>>) {
  await fireEvent.press(view.getAllByRole("button")[0]);
}

describe("MultiSelect", () => {
  it("adds a selected option and reports the chosen value", async () => {
    const onSelect = jest.fn();
    const view = await render(<Providers><Harness onSelect={onSelect} /></Providers>);

    await openOptions(view);
    await fireEvent.press(await view.findByText("Ada Lovelace"));

    expect(onSelect).toHaveBeenCalledWith(["ada"]);
  });

  it("removes a value through its chip", async () => {
    const onSelect = jest.fn();
    const view = await render(<Providers><Harness onSelect={onSelect} initial={["ada"]} /></Providers>);

    await fireEvent.press(view.getByLabelText("Remove Ada Lovelace"));

    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it("enforces the max and ignores disabled options", async () => {
    const onSelect = jest.fn();
    const view = await render(<Providers><Harness onSelect={onSelect} initial={["ada"]} max={1} /></Providers>);

    await openOptions(view);
    await fireEvent.press(await view.findByText("Alan Turing"));
    await fireEvent.press(await view.findByText("Grace Hopper"));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("accepts a free-text value when allowCustom is set", async () => {
    const onSelect = jest.fn();
    const view = await render(<Providers><Harness onSelect={onSelect} allowCustom /></Providers>);

    await openOptions(view);
    await fireEvent.changeText(await view.findByPlaceholderText("Search"), "custom");
    await fireEvent.press(await view.findByText('Use "custom"'));

    expect(onSelect).toHaveBeenCalledWith(["custom"]);
  });
});
