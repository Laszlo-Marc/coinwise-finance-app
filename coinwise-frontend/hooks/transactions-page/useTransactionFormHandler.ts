import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useCallback } from "react";

interface UseTransactionFormHandlerProps {
  transactions: TransactionModel[];
  updateTransaction: (id: string, data: any) => void;
  addTransaction: (data: any) => void;
  deleteTransaction: (id: string) => Promise<void>;
  formType: TransactionType;
  selectedTransaction: TransactionModel | null;
  setFormType: (type: TransactionType) => void;
  setSelectedTransaction: (tx: TransactionModel | null) => void;
  setIsFormVisible: (visible: boolean) => void;
  setModalVisible: (visible: boolean) => void;
  setSelectedTransactionId: (id: string | null) => void;
  selectedTransactionId: string | null;
}

export function useTransactionFormHandler({
  transactions,
  updateTransaction,
  addTransaction,
  deleteTransaction,
  formType,
  selectedTransaction,
  setFormType,
  setSelectedTransaction,
  setIsFormVisible,
  setModalVisible,
  setSelectedTransactionId,
  selectedTransactionId,
}: UseTransactionFormHandlerProps) {
  const { fetchBudgets, fetchBudgetTransactions } = useBudgets();
  const { refreshBudgetStats } = useStatsContext();
  const handleEditTransaction = useCallback(
    (id: string, type: TransactionType) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;
      setSelectedTransaction(transaction);
      setFormType(type);
      setIsFormVisible(true);
    },
    [transactions]
  );

  const handleSubmitForm = useCallback(
    (formData: any) => {
      if (!formType) return;
      if (selectedTransaction?.id) {
        updateTransaction(selectedTransaction.id, formData);
      } else {
        addTransaction(formData);
      }
      setIsFormVisible(false);
      setSelectedTransaction(null);
    },
    [formType, selectedTransaction]
  );

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setModalVisible(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTransactionId) return;
    try {
      await deleteTransaction(selectedTransactionId);
      await fetchBudgetTransactions();
      await fetchBudgets();
      await refreshBudgetStats("this_month");
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setModalVisible(false);
      setSelectedTransactionId(null);
    }
  }, [selectedTransactionId]);

  const handleDeleteCancel = useCallback(() => {
    setModalVisible(false);
    setSelectedTransactionId(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  return {
    handleEditTransaction,
    handleSubmitForm,
    handleDeleteTransaction,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCloseForm,
  };
}
