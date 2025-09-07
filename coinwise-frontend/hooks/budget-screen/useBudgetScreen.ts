import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const useBudgetsScreen = () => {
  const { budgets, deleteBudget, fetchBudgets } = useBudgets();
  const router = useRouter();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const { refreshBudgetStats, budgetStats } = useStatsContext();
  const budgetCountLabel = `${budgets.length} ${
    budgets.length === 1 ? "budget" : "budgets"
  } active`;
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { budgetUtilization } = budgetStats["this_month"] || {};
  const safeBudgetUtilization = budgetUtilization ?? 0;

  const handleDeleteConfirm = async () => {
    if (!selectedBudgetId) return;
    try {
      setIsDeleting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await deleteBudget(selectedBudgetId);
      await refreshBudgetStats("this_month");
      await fetchBudgets();
    } catch (error) {
      console.error("Failed to delete budget", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setSelectedBudgetId(null);
    }
  };

  const handleDeleteBudget = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
    setIsDeleteModalVisible(true);
  };

  const handleEditBudget = (budgetId: string) => {
    router.push(`/budgets/edit-budget/${budgetId}`);
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
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: Math.min(safeBudgetUtilization / 100, 1),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, []);
  const animateFAB = (scale: number) => {
    Animated.spring(fabAnimation, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return {
    budgets,
    budgetCountLabel,
    handleDeleteBudget,
    handleEditBudget,
    fetchBudgets,
    animateFAB,
    headerAnimation,
    fabAnimation,
    selectedBudgetId,
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    isDeleting,
    setIsDeleting,
    handleDeleteConfirm,
    progressAnim,
  };
};
