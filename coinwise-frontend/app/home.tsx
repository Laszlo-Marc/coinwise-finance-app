import { useTransactionContext } from "@/contexts/AppContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";

import { BudgetThresholdBanner } from "@/components/budgetsComponents/BudgetAlerts";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import ProgressCardSection from "@/components/homePageComponents/GoalsBudgetsCard";
import HomeHeader from "@/components/homePageComponents/HomeHeader";
import RecentTransactionsCard from "@/components/homePageComponents/RecentTransactions";
import StatsOverviewSection from "@/components/homePageComponents/StatsCard";
import SummaryOverviewSection from "@/components/homePageComponents/SummaryCard";
import { useStatsContext } from "@/contexts/StatsContext";
import { useClosestGoals } from "@/hooks/home-page/useClosestGoals";
import { useRecentTransactions } from "@/hooks/home-page/useRecentTransactions";
import { useRiskiestBudgets } from "@/hooks/home-page/useRiskiestBudgets";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import "react-native-gesture-handler";
import BottomBar from "../components/mainComponents/BottomBar";
import { colors } from "../constants/colors";
export default function HomePage() {
  const router = useRouter();

  const { goals } = useGoals();
  const { budgets, budgetTransactions } = useBudgets();
  const { transactions } = useTransactionContext();
  const recentTransactions = useRecentTransactions(transactions);
  const { historicalSummary } = useStatsContext();
  const closestGoals = useClosestGoals(goals);
  const riskiestBudgets = useRiskiestBudgets(budgets, budgetTransactions);
  const [warnedBudgets, setWarnedBudgets] = useState<string[]>([]);

  useEffect(() => {
    const triggered = budgets?.filter((b) => {
      if (!b.notificationsEnabled) return false;
      const utilization = (b.spent / b.amount) * 100;
      return (
        b.notificationsThreshold !== undefined &&
        utilization >= b.notificationsThreshold
      );
    });

    if (triggered?.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setWarnedBudgets(triggered.map((b) => b.title));
    }
  }, [budgets]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.headerWrapper}>
          <HomeHeader />
          <BudgetThresholdBanner
            titles={warnedBudgets}
            visible={warnedBudgets.length > 0}
            onClose={() => setWarnedBudgets([])}
          />
        </View>
        <View style={styles.paddedContent}>
          <AnimatedCard delay={100}>
            <RecentTransactionsCard transactions={recentTransactions} />
          </AnimatedCard>
          <AnimatedCard delay={200}>
            {historicalSummary && (
              <SummaryOverviewSection {...historicalSummary} />
            )}
          </AnimatedCard>
          <AnimatedCard delay={300}>
            <StatsOverviewSection />
          </AnimatedCard>
          <AnimatedCard delay={400}>
            <ProgressCardSection
              title="Financial Goals"
              items={closestGoals}
              type="goal"
              navigateTo="./financial-goals"
              onCreatePress={() => router.push("/goals/add-goal")}
            />
          </AnimatedCard>
          <AnimatedCard delay={500}>
            <ProgressCardSection
              title="Budgets"
              items={riskiestBudgets}
              type="budget"
              navigateTo="./budgets"
              onCreatePress={() => router.push("/budgets/add-budget")}
            />
          </AnimatedCard>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerWrapper: {
    width: "100%",
    backgroundColor: colors.background,
  },
  paddedContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 30 : 20,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },

  bottomPadding: {
    height: 100,
  },
});
