import { ActivityIndicator, FlatList, type FlatListProps } from "react-native";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { LoadingState } from "../feedback/LoadingState";

const END_REACHED_THRESHOLD = 0.4;

export type InfiniteListProps<ItemT> = Omit<FlatListProps<ItemT>, "data" | "renderItem" | "onEndReached"> & {
  data: readonly ItemT[];
  keyExtractor: (item: ItemT, index: number) => string;
  renderItem: (item: ItemT, index: number) => React.ReactElement | null;
  loading?: boolean;
  loadingMore?: boolean;
  error?: { message: string } | null;
  onRetry?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyTitle?: string;
};

export function InfiniteList<ItemT>({
  data,
  renderItem,
  loading,
  loadingMore,
  error,
  onRetry,
  onLoadMore,
  hasMore = false,
  emptyTitle = "",
  ...props
}: InfiniteListProps<ItemT>) {
  if (loading) return <LoadingState className="flex-1" />;
  if (error && onRetry) return <ErrorState title={error.message} onRetry={onRetry} />;
  return (
    <FlatList
      data={data as ItemT[]}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListEmptyComponent={<EmptyState title={emptyTitle} />}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      ListFooterComponent={loadingMore ? <ActivityIndicator className="py-4" /> : null}
      {...props}
    />
  );
}
