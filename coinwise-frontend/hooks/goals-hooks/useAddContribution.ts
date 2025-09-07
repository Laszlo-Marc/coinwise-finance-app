import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const useAddContribution = (goalId: string) => {
  const router = useRouter();
  const { goals, addContribution } = useGoals();

  const [goalData, setGoalData] = useState<GoalModel | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const foundGoal = goals.find((g) => g.id === goalId) || null;
    setGoalData(foundGoal);
  }, [goalId, goals]);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateAmount = () => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1_000_000;
  };

  const handleAddContribution = async () => {
    if (!validateAmount()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const contribution = {
      goal_id: goalId,
      amount: parseFloat(amount),
      date: date.toISOString().split("T")[0],
    };

    try {
      await addContribution(contribution);
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
        router.replace(`../${goalId}`);
      });
    } catch (err) {
      console.error("Failed to add contribution:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return {
    goalData,
    amount,
    setAmount,
    date,
    setDate,
    showDatePicker,
    setShowDatePicker,
    handleDateChange,
    handleAddContribution,
    validateAmount,
    showSuccess,
    successOpacity,
  };
};
