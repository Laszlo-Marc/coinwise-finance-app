import { colors } from "@/constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import BudgetList from "@/components/budgetsComponents/BudgetList";
import EnhancedBudgetOverviewCard from "@/components/budgetsComponents/BudgetOverviewCard";
import OneTimeBudgetResetModal from "@/components/budgetsComponents/OneTimeBudgetResetModal";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import AnimatedHeader from "@/components/mainComponents/AnimatedHeader";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { useBudgetsScreen } from "@/hooks/budget-screen/useBudgetScreen";
import { BudgetModel } from "@/models/budget";
import { useRouter } from "expo-router";
import BottomBar from "../components/mainComponents/BottomBar";

const BudgetsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateBudget, deleteBudget } = useBudgets();
  const { budgetStats, refreshBudgetStats } = useStatsContext();
  const {
    budgets,
    budgetCountLabel,
    handleDeleteBudget,
    handleEditBudget,
    fetchBudgets,
    animateFAB,
    headerAnimation,
    fabAnimation,
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    handleDeleteConfirm,
    isDeleting,
    progressAnim,
  } = useBudgetsScreen();

  const [showResetModal, setShowResetModal] = useState(false);
  const [expiredOneTimes, setExpiredOneTimes] = useState<
    BudgetModel[] | undefined
  >([]);
  const thisMonthStats = budgetStats?.["this_month"];

  const handleResetSingleBudget = async (budget: BudgetModel) => {
    try {
      const newStartDate = new Date();
      const newEndDate = new Date();

      const originalStart = new Date(budget.start_date);
      const originalEnd = new Date(budget.end_date);
      const durationMs = originalEnd.getTime() - originalStart.getTime();
      newEndDate.setTime(newStartDate.getTime() + durationMs);

      const newBudget = {
        ...budget,
        start_date: newStartDate.toISOString().split("T")[0],
        end_date: newEndDate.toISOString().split("T")[0],
        spent: 0,
        remaining: budget.amount,
      };

      if (budget.id) await updateBudget(budget.id, newBudget);

      setExpiredOneTimes((prev) => prev?.filter((b) => b.id !== budget.id));
      Toast.show({
        type: "success",
        text1: "Budget Reset",
        text2: budget.title,
      });
      await handleRefresh();
    } catch (error) {
      console.error("Failed to reset budget:", error);
      Toast.show({ type: "error", text1: "Reset Failed", text2: budget.title });
    }
  };

  const handleMakeRecurringBudget = async (budget: BudgetModel) => {
    try {
      const newBudget = {
        ...budget,
        is_recurring: true,
        recurring_frequency: "monthly",
      };

      if (budget.id) await updateBudget(budget.id, newBudget);

      setExpiredOneTimes((prev) => prev?.filter((b) => b.id !== budget.id));
      Toast.show({
        type: "success",
        text1: "Made Recurring",
        text2: budget.title,
      });
      await handleRefresh();
    } catch (error) {
      console.error("Failed to make budget recurring:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: budget.title,
      });
    }
  };

  const handleDeleteSingleBudget = async (budget: BudgetModel) => {
    try {
      if (budget.id) await deleteBudget(budget.id);
      setExpiredOneTimes((prev) => prev?.filter((b) => b.id !== budget.id));
      Toast.show({ type: "info", text1: "Deleted", text2: budget.title });
      await handleRefresh();
    } catch (error) {
      console.error("Failed to delete budget:", error);
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: budget.title,
      });
    }
  };

  useEffect(() => {
    if (thisMonthStats?.expiredRecurringBudgets?.length) {
      Toast.show({
        type: "info",
        text1: "Recurring budgets reset",
        text2: "Your recurring budgets have been reset automatically.",
      });
    }

    if (thisMonthStats?.expiredOneTimeBudgets?.length) {
      setExpiredOneTimes(thisMonthStats.expiredOneTimeBudgets);
      setShowResetModal(true);
    }
  }, [budgetStats]);

  const handleRefresh = async () => {
    await fetchBudgets();
    await refreshBudgetStats("this_month");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[500]}
      />

      <AnimatedHeader
        title="BUDGETS"
        subtitle={budgetCountLabel}
        animatedValue={headerAnimation}
        leftIcon={
          <TouchableOpacity onPress={() => router.replace("/transactions")}>
            <Ionicons name="wallet-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
        onProfilePress={() => router.push("/profile")}
        gradientColors={["rgba(75, 108, 183, 0.8)", "rgba(24, 40, 72, 0.8)"]}
      />

      <BudgetList
        budgets={budgets}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
        onRefresh={handleRefresh}
        headerComponent={
          <AnimatedCard delay={100}>
            <EnhancedBudgetOverviewCard
              budgetStats={budgetStats["this_month"]}
              progressAnim={progressAnim}
            />
          </AnimatedCard>
        }
      />

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabAnimation }],
            bottom: insets.bottom + 100,
            opacity: fabAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/budgets/add-budget")}
          onPressIn={() => animateFAB(0.9)}
          onPressOut={() => animateFAB(1)}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This cannot be undone."
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        isLoadingDelete={isDeleting}
      />

      <OneTimeBudgetResetModal
        visible={showResetModal}
        budgets={expiredOneTimes}
        onClose={() => setShowResetModal(false)}
        onReset={handleResetSingleBudget}
        onMakeRecurring={handleMakeRecurringBudget}
        onDelete={handleDeleteSingleBudget}
      />

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary[500],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.secondaryLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default BudgetsScreen;
