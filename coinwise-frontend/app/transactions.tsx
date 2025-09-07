import ProcessingModal from "@/components/financesComponents/ProcessingModal";
import TransactionClassModal from "@/components/financesComponents/TransactionClasssModal";
import TransactionList from "@/components/financesComponents/TransactionList";
import { TransactionTypeSelector } from "@/components/financesComponents/TransactionTypeSelector";
import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import MainSection from "@/components/mainComponents/MainSection";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { useTransactionFilters } from "@/hooks/finances-page/handleFilterChange";
import { useDocumentUpload } from "@/hooks/transactions-page/useDocumentUpload";
import { useTransactionUIState } from "@/hooks/transactions-page/useTransactionUIState";
import { AntDesign, Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/colors";

export default function TransactionsListScreen() {
  const router = useRouter();
  const {
    transactions,
    uploadBankStatement,
    deleteTransaction,
    fetchTransactions,
  } = useTransactionContext();
  const { state } = useAuth();
  const { fetchBudgets, fetchBudgetTransactions } = useBudgets();
  const { refreshBudgetStats, refreshSummary } = useStatsContext();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const {
    classModalVisible,
    setClassModalVisible,
    modalVisible,
    setModalVisible,
    selectedTransactionId,
    setSelectedTransactionId,
    showFilters,
    setShowFilters,
  } = useTransactionUIState();
  const { uploadDocument, isLoading, processingStage } =
    useDocumentUpload(uploadBankStatement);

  const { filters, handleFilterChange } =
    useTransactionFilters(fetchTransactions);

  const [refreshing, setRefreshing] = useState(false);

  const toggleFilters = () => setShowFilters((prev) => !prev);

  useEffect(() => {
    fetchTransactions(1, filters);
  }, []);

  const handleOpenModal = useCallback(() => {
    setClassModalVisible(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTransactions(1, filters);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh transactions.");
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchTransactions, filters]);

  const handleEditTransaction = useCallback(
    (id: string) => {
      router.push(`/transaction/edit-transaction/${id}`);
    },
    [router]
  );
  const handleDeleteTransaction = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setModalVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTransactionId) return;
    try {
      setIsLoadingDelete(true);
      await deleteTransaction(selectedTransactionId);
      await Promise.all([
        fetchBudgetTransactions(),
        await fetchBudgets(),
        await refreshBudgetStats("this_month"),
        await refreshSummary(),
      ]);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setModalVisible(false);
      setSelectedTransactionId(null);
      setIsLoadingDelete(false);
    }
  }, [selectedTransactionId]);
  return (
    <View style={styles.container}>
      <View>
        <MainSection
          actionButtons={
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenModal}
              >
                <View style={styles.actionIconContainer}>
                  <AntDesign name="plus" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={uploadDocument}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name="upload" size={24} color={colors.text} />
                </View>
                <Text style={styles.actionText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleFilters}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name={showFilters ? "close" : "filter"}
                    size={24}
                    color={colors.text}
                  />
                </View>
                <Text style={styles.actionText}>
                  {showFilters ? "Close" : "Filter"}
                </Text>
              </TouchableOpacity>
            </>
          }
        />

        {showFilters && (
          <TransactionTypeSelector
            value={filters.transactionClass ?? "expense"}
            onChange={(type) => handleFilterChange({ transactionClass: type })}
          />
        )}
      </View>

      <TransactionList
        currentUser={state.user?.full_name ?? ""}
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <TransactionClassModal
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        onSelect={(type) => {
          setClassModalVisible(false);
          router.push(`/transaction/add-transaction?type=${type}`);
        }}
      />

      <ProcessingModal visible={isLoading} currentStage={processingStage} />

      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        isLoadingDelete={isLoadingDelete}
      />

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionButton: {
    alignItems: "center",
    width: 100,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
});
