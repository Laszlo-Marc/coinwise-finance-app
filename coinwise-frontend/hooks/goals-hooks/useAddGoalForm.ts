import { useGoals } from "@/contexts/GoalsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

type ContributionFrequency = "daily" | "weekly" | "monthly";

export const useAddGoalForm = () => {
  const router = useRouter();
  const { addGoal } = useGoals();
  const successOpacity = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    current_amount: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 6))
      .toISOString()
      .split("T")[0],
    category: "Housing",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleInputChange = useCallback(
    (field: string, value: string | boolean | Date | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) errs.title = "Title is required.";
    if (!formData.description.trim())
      errs.description = "Description is required.";

    const amount = Number(formData.target_amount);
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

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});

    const goalData = {
      title: formData.title,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount || "0"),
      current_amount: 0,
      start_date: formData.start_date,
      end_date: formData.end_date,
      category: formData.category,
      is_active: true,
    };

    try {
      await addGoal(goalData);
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
      console.error("Error saving goal:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [
    formData,
    isFormValid,
    validationErrors,
    addGoal,
    router,
    successOpacity,
  ]);

  return {
    formData,
    errors,
    handleInputChange,
    handleSave,
    showSuccess,
    successOpacity,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    showCategoryPicker,
    setShowCategoryPicker,
    isFormValid,
  };
};
