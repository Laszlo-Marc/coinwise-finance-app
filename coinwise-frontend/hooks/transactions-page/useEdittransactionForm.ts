import { useTransactionContext } from "@/contexts/AppContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

export const useEditTransactionForm = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { transactions, updateTransaction } = useTransactionContext();
  const successOpacity = useRef(new Animated.Value(0)).current;
  const { fetchBudgetTransactions, fetchBudgets } = useBudgets();

  const existingTransaction = transactions.find((t) => t.id === id);

  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    merchant: "",
    sender: "",
    receiver: "",
    currency: "RON",
    type: "expense" as "expense" | "income" | "transfer" | "deposit",
  });
  const [isSubmiting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { refreshBudgetStats, refreshSummary } = useStatsContext();
  useEffect(() => {
    if (existingTransaction) {
      setFormData({
        amount: existingTransaction.amount.toString(),
        date: existingTransaction.date,
        description: existingTransaction.description,
        category: existingTransaction.category || "",
        merchant: existingTransaction.merchant || "",
        sender: existingTransaction.sender || "",
        receiver: existingTransaction.receiver || "",
        currency: existingTransaction.currency,
        type: existingTransaction.type,
      });
    }
  }, [existingTransaction]);

  const handleInputChange = useCallback(
    (field: string, value: string | boolean | Date | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) errs.amount = "Enter a valid amount.";

    if (!formData.description.trim())
      errs.description = "Description required.";
    if (!formData.date) errs.date = "Date is required.";

    if (formData.type === "expense" && !formData.category)
      errs.category = "Category required.";

    if (formData.type === "expense" && !formData.merchant)
      errs.merchant = "Merchant required.";

    if (formData.type === "transfer") {
      if (!formData.sender) errs.sender = "Sender required.";
      if (!formData.receiver) errs.receiver = "Receiver required.";
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

    const txData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      setIsSubmitting(true);
      await updateTransaction(id as string, txData);

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
        router.replace("/transactions");
      });
    } catch (err) {
      console.error("Error updating transaction:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [formData, isFormValid, validationErrors, id, updateTransaction, router]);

  return {
    formData,
    errors,
    handleInputChange,
    handleSave,
    showSuccess,
    successOpacity,
    showDatePicker,
    showCategoryPicker,
    setShowDatePicker,
    setShowCategoryPicker,
    isFormValid,
    isSubmiting,
    setIsSubmitting,
  };
};
