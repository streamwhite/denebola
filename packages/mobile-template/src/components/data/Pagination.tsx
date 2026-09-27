import { View } from "react-native";
import { useText } from "../../lib/i18n/locale";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { computePagination } from "./paginationCore";

export function Pagination({ total, page, pageSize, onPageChange, className }: { total: number; page: number; pageSize: number; onPageChange: (page: number) => void; className?: string }) {
  const text = useText();
  const meta = computePagination(total, { page, pageSize });
  return (
    <View className={className + " flex-row items-center justify-between gap-3 py-2"}>
      <Button size="sm" variant="outline" title={text({ id: "common.prev" })} disabled={!meta.canPrev} onPress={() => onPageChange(page - 1)} />
      <Text variant="caption" tone="muted">
        {text({ id: "common.pageOf" }, { page, count: meta.pageCount })}
      </Text>
      <Button size="sm" variant="outline" title={text({ id: "common.next" })} disabled={!meta.canNext} onPress={() => onPageChange(page + 1)} />
    </View>
  );
}
