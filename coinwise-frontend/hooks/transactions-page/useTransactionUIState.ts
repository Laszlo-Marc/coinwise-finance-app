import { TransactionModel } from "@/models/transaction";
import { TransactionType } from "@/models/transactionType";
import { useState } from "react";

export function useTransactionUIState() {
  const [refreshing, setRefreshing] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TransactionType>(null);

  return {
    refreshing,
    setRefreshing,
    classModalVisible,
    setClassModalVisible,
    formType,
    setFormType,
    selectedTransaction,
    setSelectedTransaction,
    isFormVisible,
    setIsFormVisible,
    modalVisible,
    setModalVisible,
    selectedTransactionId,
    setSelectedTransactionId,
    showFilters,
    setShowFilters,
    selectedClass,
    setSelectedClass,
  };
}
