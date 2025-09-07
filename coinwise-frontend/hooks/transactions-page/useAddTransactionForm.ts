import { useTransactionContext } from "@/contexts/AppContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

export const useAddTransactionForm = (
  type: "expense" | "income" | "transfer" | "deposit",
  onSuccess: () => void
) => {
  const { addTransaction } = useTransactionContext();
  const successOpacity = useRef(new Animated.Value(0)).current;
  const { fetchBudgetTransactions, fetchBudgets } = useBudgets();
  const { refreshBudgetStats, refreshSummary } = useStatsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Groceries",
    merchant: "",
    currency: "RON",
    sender: "",
    receiver: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!formData.description.trim())
      errs.description = "Description is required.";
    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) errs.amount = "Enter a valid amount.";
    if (!formData.date) errs.date = "Date is required.";
    if (formData.type === "expense") {
      if (!formData.category) errs.category = "Category is required.";
      if (!formData.merchant.trim()) errs.merchant = "Merchant is required.";
    }
    if (formData.type === "transfer") {
      if (!formData.sender.trim()) errs.sender = "Sender is required.";
      if (!formData.receiver.trim()) errs.receiver = "Receiver is required.";
    }
    return errs;
  }, [formData]);

  const isFormValid = useMemo(
    () => Object.keys(validationErrors).length === 0,
    [validationErrors]
  );

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});

    try {
      setIsSubmitting(true);
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      await Promise.all([
        fetchBudgetTransactions(),
        fetchBudgets(),
        refreshBudgetStats("this_month"),
        refreshSummary(),
      ]);
      setIsSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false);
        onSuccess();
      });
    } catch (err) {
      console.error("Error saving transaction:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [formData, isFormValid, validationErrors, addTransaction]);

  return {
    formData,
    errors,
    handleInputChange,
    handleSave,
    showSuccess,
    successOpacity,
    showDatePicker,
    setShowDatePicker,
    showCategoryPicker,
    setShowCategoryPicker,
    isFormValid,
    isSubmitting,
  };
};
