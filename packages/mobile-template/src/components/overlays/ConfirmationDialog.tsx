import { useText } from "../../lib/i18n/locale";
import { Button, type ButtonVariant } from "../ui/Button";
import { Dialog } from "./Dialog";

export function ConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  loading = false,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}) {
  const text = useText();
  return (
    <Dialog
      visible={visible}
      onClose={loading ? () => undefined : onClose}
      dismissable={!loading}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" title={cancelLabel ?? text({ id: "common.cancel" })} disabled={loading} onPress={onClose} />
          <Button variant={confirmVariant} title={confirmLabel ?? text({ id: "common.confirm" })} loading={loading} onPress={onConfirm} />
        </>
      }
    />
  );
}
