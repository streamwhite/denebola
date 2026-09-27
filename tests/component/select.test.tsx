import { fireEvent, render } from "@testing-library/react-native";
import { useState } from "react";
import { Select } from "@/components/forms/Select";
import { AppIntlProvider, DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const options = [
  { value: "ada", label: "Ada Lovelace" },
  { value: "alan", label: "Alan Turing" },
];

function Harness({ onChange }: { onChange: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      options={options}
      value={value}
      searchable
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

test("select opens, filters options and reports the chosen value", async () => {
  const onChange = jest.fn();
  const { getByRole, findByText } = await render(
    <ThemeProvider>
      <AppIntlProvider locale={DEFAULT_LOCALE} setLocale={() => undefined}>
        <Harness onChange={onChange} />
      </AppIntlProvider>
    </ThemeProvider>,
  );

  fireEvent.press(getByRole("button"));
  fireEvent.press(await findByText("Ada Lovelace"));

  expect(onChange).toHaveBeenCalledWith("ada");
});
