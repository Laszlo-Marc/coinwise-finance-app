import { Feather } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: TransactionModel[];
  currentUser?: string;
  onEdit: (id: string, type: TransactionType) => void;
  onDelete: (id: string, type: TransactionType) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onEndReached?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentUser,
  onEdit,
  onDelete,
  onRefresh,
  refreshing,
  onEndReached,
  hasMore,
  loadingMore,
}) => {
  const renderItem: ListRenderItem<TransactionModel> = useCallback(
    ({ item }) => (
      <TransactionItem
        transaction={item}
        currentUser={currentUser ?? ""}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [currentUser, onEdit, onDelete]
  );

  const keyExtractor = useCallback(
    (item: TransactionModel) => item.id ?? "",
    []
  );

  const renderEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No transactions found</Text>
        <Text style={styles.emptySubText}>
          Pull down to refresh or add a new transaction
        </Text>
      </View>
    ),
    []
  );

  const renderFooter = useMemo(
    () =>
      loadingMore ? (
        <View style={{ padding: 20 }}>
          <Text style={{ textAlign: "center", color: colors.textSecondary }}>
            Loading more transactions...
          </Text>
        </View>
      ) : null,
    [loadingMore]
  );

  return (
    <FlatList
      data={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary[500]}
          colors={[colors.primary[500]]}
        />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={hasMore ? onEndReached : undefined}
      onEndReachedThreshold={0.6}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingTop: 8,
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontFamily: "Montserrat",
    marginTop: 16,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: "Montserrat",
    opacity: 0.7,
    marginTop: 8,
  },
});

export default TransactionList;
