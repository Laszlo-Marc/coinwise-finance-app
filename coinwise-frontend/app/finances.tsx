import TransactionList from "@/components/financesComponents/TransactionList";
import TransactionsFiltersPanel from "@/components/financesComponents/TransactionsFilterPanel";
import TransactionsSummaryCard from "@/components/financesComponents/TransactionsSummaryCard";
import { TransactionTypeSelector } from "@/components/financesComponents/TransactionTypeSelector";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import ActionBar from "@/components/mainComponents/ActionBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { categories } from "@/constants/categories";
import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { useTransactionFilters } from "@/hooks/finances-page/handleFilterChange";

import { useFinancesScreenState } from "@/hooks/finances-page/useFinancesState";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function Finances() {
  const router = useRouter();
  const { transactions, fetchTransactions } = useTransactionContext();
  const { monthlySummary } = useStatsContext();
  const {
    showFilters,
    refreshing,
    modalVisible,
    hasMore,
    isLoadingMore,
    handleEditTransaction,
    handleDeleteTransaction,
    onRefresh,
    toggleFilters,
    handleDeleteConfirm,
    handleDeleteCancel,
    loadMore,
  } = useFinancesScreenState();
  const { filters, handleFilterChange } =
    useTransactionFilters(fetchTransactions);
  const { state } = useAuth();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  return (
    <View style={styles.container}>
      <ActionBar
        title="Transaction History"
        leftButton={{
          icon: "home",
          onPress: () => router.replace("/home"),
          accessibilityLabel: "Home",
        }}
        rightButton={{
          icon: "user",
          onPress: () => router.push("/profile"),
          accessibilityLabel: "View profile",
        }}
        actionButtons={[
          {
            icon: "plus",
            onPress: () => router.replace("/transactions"),
            accessibilityLabel: "Add new transaction",
          },
          {
            icon: "filter",
            onPress: toggleFilters,
            accessibilityLabel: "Filter transactions",
          },
        ]}
      />
      <TransactionsSummaryCard
        totalIncome={monthlySummary?.totalIncome ?? 0}
        totalExpenses={monthlySummary?.totalExpenses ?? 0}
        balance={monthlySummary?.balance ?? 0}
      />

      <View style={styles.contentContainer}>
        <AnimatedCard delay={200}>
          <View style={styles.inlineActions}>
            <TouchableOpacity
              onPress={() => router.replace("/transactions")}
              style={styles.inlineButton}
            >
              <Feather name="plus" size={20} color={colors.text} />
              <Text style={styles.inlineButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleFilters}
              style={[
                styles.inlineButton,
                showFilters && styles.inlineButtonActive,
              ]}
            >
              <Feather name="filter" size={20} color={colors.text} />
              <Text style={styles.inlineButtonText}>
                {showFilters ? "Close" : "Filter"}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {showFilters && (
          <>
            <TransactionTypeSelector
              value={filters.transactionClass ?? "expense"}
              onChange={(type) =>
                handleFilterChange({ transactionClass: type })
              }
            />
            <TransactionsFiltersPanel
              visible={showFilters}
              filters={filters}
              onChange={handleFilterChange}
              categories={categories}
            />
          </>
        )}
        <View style={styles.listContainer}>
          <AnimatedCard delay={300}>
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onRefresh={onRefresh}
              refreshing={refreshing}
              onEndReached={loadMore}
              hasMore={hasMore}
              loadingMore={isLoadingMore}
              currentUser={state.user?.full_name || ""}
            />
          </AnimatedCard>
        </View>
      </View>

      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoadingDelete={isLoadingDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inlineButtonActive: {
    backgroundColor: colors.primary[500],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },

  contentContainer: {
    flex: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  inlineActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inlineButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
});
