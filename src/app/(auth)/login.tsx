import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "@/components/layout/Screen";
import { FormInput } from "@/components/forms/FormInput";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Text } from "@/components/ui/Text";
import { loginSchema } from "@/schemas/auth";
import { useText } from "@/lib/i18n/locale";
import type { LoginInput } from "@/schemas/auth";

export default function LoginScreen() {
  const text = useText();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  async function submit() {
    setLoading(true);
    await Promise.resolve();
    setLoading(false);
  }
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">{text({ id: "auth.signIn" })}</Text>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormInput
            label={text({ id: "auth.email" })}
            value={field.value}
            onChangeText={field.onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            error={fieldState.error ? text({ id: "auth.invalid" }) : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormInput
            label={text({ id: "auth.password" })}
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            error={fieldState.error ? text({ id: "auth.invalid" }) : undefined}
          />
        )}
      />
      <SubmitButton label={text({ id: "auth.signIn" })} loading={loading} onPress={() => void handleSubmit(submit)()} />
    </Screen>
  );
}
