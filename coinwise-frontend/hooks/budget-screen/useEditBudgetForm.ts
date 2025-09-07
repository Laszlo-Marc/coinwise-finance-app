import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";

export const useEditBudgetForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetId = params.id as string;
  const { budgets, updateBudget } = useBudgets();
  const successOpacity = useRef(new Animated.Value(0)).current;
  const { refreshBudgetStats } = useStatsContext();
  const foundBudget = budgets.find((b) => b.id === budgetId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    start_date: "",
    end_date: "",
    isRecurring: false,
    category: "Groceries",
    recurring_frequency: "monthly",
    notificationsEnabled: false,
    notificationThreshold: 80,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDateForInput = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }, []);

  useEffect(() => {
    if (budgetId && budgets.length > 0) {
      const budget = budgets.find((b) => b.id === budgetId);
      if (budget) {
        setFormData({
          title: budget.title,
          description: budget.description || "",
          amount: budget.amount?.toString() || "",
          start_date: formatDateForInput(budget.start_date),
          end_date: formatDateForInput(budget.end_date),
          isRecurring: budget.is_recurring ?? false,
          recurring_frequency: budget.recurring_frequency ?? "monthly",
          category: budget.category ?? "Groceries",
          notificationsEnabled: budget.notificationsEnabled ?? false,
          notificationThreshold: budget.notificationsThreshold ?? 80,
        });
        setIsLoading(false);
      } else {
        Alert.alert("Error", "Budget not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [budgetId, budgets, formatDateForInput]);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) errs.title = "Title is required.";

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) errs.amount = "Enter a valid amount.";

    if (formData.end_date <= formData.start_date)
      errs.end_date = "End date must be after start date.";

    if (formData.notificationsEnabled) {
      const threshold = formData.notificationThreshold;
      if (isNaN(threshold) || threshold <= 0 || threshold > 100)
        errs.notificationThreshold = "Enter a valid threshold (1-100).";
    }

    return errs;
  }, [formData]);

  const isFormValid = useMemo(
    () => Object.keys(validationErrors).length === 0,
    [validationErrors]
  );

  useEffect(() => setErrors(validationErrors), [validationErrors]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const parsedAmount = parseFloat(formData.amount);

    const updatedBudget = {
      title: formData.title,
      description: formData.description,
      amount: parsedAmount,
      spent: foundBudget?.spent || 0,
      remaining: parsedAmount,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_recurring: formData.isRecurring,
      recurring_frequency: formData.recurring_frequency,
      category: formData.category,
      notificationsEnabled: formData.notificationsEnabled,
      notificationsThreshold: formData.notificationThreshold,
    };

    try {
      await updateBudget(budgetId, updatedBudget);
      await refreshBudgetStats("this_month");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      await new Promise((resolve) => {
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
        ]).start(() => resolve(null));
      });
      setShowSuccess(false);
      router.replace("/budgets");
    } catch (err) {
      console.error("Update failed", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isFormValid, formData, budgetId, updateBudget, successOpacity, router]);

  return {
    formData,
    errors,
    isLoading,
    showSuccess,
    successOpacity,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    handleInputChange,
    handleSave,
    isFormValid,
  };
};
