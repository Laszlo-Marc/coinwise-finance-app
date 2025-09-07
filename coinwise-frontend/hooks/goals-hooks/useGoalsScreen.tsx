import { useGoals } from "@/contexts/GoalsContext";
import { GoalModel } from "@/models/goal";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const useFinancialGoalsScreen = () => {
  const { goals, deleteGoal } = useGoals();
  const router = useRouter();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;

  const totalGoals = goals.length;
  const totalSaved = goals.reduce((acc, goal) => acc + goal.current_amount, 0);
  const averageCompletionRate =
    goals.length > 0
      ? (goals.reduce(
          (acc, goal) => acc + goal.current_amount / goal.target_amount,
          0
        ) /
          goals.length) *
        100
      : 0;

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("./goals/add-goal");
  };

  const handleSelectGoal = (goal: GoalModel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`./goals/goal-details/${goal.id}`);
  };

  const handleDeleteGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoalId(goalId);
    setModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGoalId) return;
    try {
      setIsLoadingDelete(true);
      await deleteGoal(selectedGoalId);
    } catch (error) {
      console.error("Error deleting goal:", error);
    } finally {
      setModalVisible(false);
      setSelectedGoalId(null);
      setIsLoadingDelete(false);
    }
  };

  const handleDeleteCancel = () => {
    setModalVisible(false);
    setSelectedGoalId(null);
  };

  const animateFAB = (scale: number) => {
    Animated.spring(fabAnimation, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  useEffect(() => {
    Animated.spring(headerAnimation, {
      toValue: 1,
      useNativeDriver: true,
      delay: 100,
    }).start();
    Animated.spring(fabAnimation, {
      toValue: 1,
      useNativeDriver: true,
      delay: 400,
    }).start();
  }, []);

  return {
    goals,
    modalVisible,
    selectedGoalId,
    fabAnimation,
    headerAnimation,
    totalGoals,
    totalSaved,
    averageCompletionRate,
    handleAddGoal,
    handleSelectGoal,
    handleDeleteGoal,
    handleDeleteConfirm,
    handleDeleteCancel,
    animateFAB,
    isLoadingDelete,
  };
};
