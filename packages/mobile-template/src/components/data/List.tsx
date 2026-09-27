import { FlatList, type FlatListProps } from "react-native";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { LoadingState } from "../feedback/LoadingState";
import { ListItem } from "./ListItem";

export type ListProps<ItemT> = Omit<FlatListProps<ItemT>, "data" | "renderItem"> & {
  data: readonly ItemT[];
  keyExtractor: (item: ItemT, index: number) => string;
  renderItem: (item: ItemT, index: number) => React.ReactElement | null;
  loading?: boolean;
  error?: { message: string } | null;
  onRetry?: () => void;
  emptyTitle?: string;
};

export function List<ItemT>({ data, renderItem, loading, error, onRetry, emptyTitle = "", ...props }: ListProps<ItemT>) {
  if (loading) return <LoadingState className="flex-1" />;
  if (error && onRetry) return <ErrorState title={error.message} onRetry={onRetry} />;
  return (
    <FlatList
      data={data as ItemT[]}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListEmptyComponent={<EmptyState title={emptyTitle} />}
      {...props}
    />
  );
}

List.Item = ListItem;
