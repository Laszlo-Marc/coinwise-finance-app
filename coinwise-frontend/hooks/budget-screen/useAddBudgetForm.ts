import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated } from "react-native";

export const useAddBudgetForm = () => {
  const { addBudget } = useBudgets();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split("T")[0],
    isRecurring: false,
    category: "Groceries",
    recurring_frequency: "monthly",
    notificationsEnabled: false,
    notificationThreshold: 80,
  });
  const { refreshBudgetStats } = useStatsContext();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return false;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return false;

    if (formData.end_date <= formData.start_date) return false;

    if (formData.notificationsEnabled) {
      const threshold = formData.notificationThreshold;
      if (isNaN(threshold) || threshold <= 0 || threshold > 100) return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    const amount = parseFloat(formData.amount);
    const budgetData = {
      title: formData.title,
      description: formData.description || "",
      amount,
      spent: 0,
      remaining: amount,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_recurring: formData.isRecurring,
      recurring_frequency: formData.recurring_frequency,
      category: formData.category,
      notificationsEnabled: formData.notificationsEnabled,
      notificationsThreshold: formData.notificationThreshold,
    };

    try {
      await addBudget(budgetData);
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
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error("Failed to add budget:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
  };

  return {
    formData,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    handleInputChange,
    handleSave,
    validateForm,
    showSuccess,
    successOpacity,
  };
};
