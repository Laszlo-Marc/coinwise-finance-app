import { useGoals } from "@/contexts/GoalsContext";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";

export const useEditGoalForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const goalId = params.id as string;
  const { goals, updateGoal } = useGoals();
  const successOpacity = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: 0,
    start_date: "",
    end_date: "",
    category: "Savings",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
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
    if (goalId && goals.length > 0) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        setFormData({
          title: goal.title || "",
          description: goal.description || "",
          target_amount: goal.target_amount?.toString() || "",
          current_amount: goal.current_amount || 0,
          start_date: formatDateForInput(goal.start_date),
          end_date: formatDateForInput(goal.end_date),
          category: goal.category || "Savings",
          is_active: goal.is_active ?? true,
        });
        setIsLoading(false);
      } else {
        Alert.alert("Error", "Goal not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [goalId, goals, formatDateForInput]);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) errs.title = "Title is required.";
    if (!formData.description.trim())
      errs.description = "Description is required.";

    const amount = parseFloat(formData.target_amount);
    if (isNaN(amount) || amount <= 0)
      errs.targetAmount = "Enter a valid target amount.";

    if (formData.end_date <= formData.start_date)
      errs.end_date = "Target date must be after start date.";

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

    const updatedGoal = {
      title: formData.title,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount),
      current_amount: formData.current_amount,
      start_date: formData.start_date,
      end_date: formData.end_date,
      category: formData.category,
      is_active: formData.is_active,
    };

    try {
      await updateGoal(goalId, updatedGoal);
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
        router.replace("/financial-goals");
      });
    } catch (err) {
      console.error("Update failed", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isFormValid, formData, goalId, updateGoal, successOpacity, router]);

  const toggleCategoryPicker = useCallback(() => {
    setShowCategoryPicker((prev) => !prev);
    Haptics.selectionAsync();
  }, []);

  return {
    formData,
    errors,
    isLoading,
    showSuccess,
    successOpacity,
    showStartDatePicker,
    showTargetDatePicker,
    showCategoryPicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    toggleCategoryPicker,
    handleInputChange,
    handleSave,
    isFormValid,
  };
};
