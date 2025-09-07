import { colors } from "@/constants/colors";
import { useStatsContext } from "@/contexts/StatsContext";
import { formatCurrency } from "@/hooks/goals-helpers";
import { useStatsRange } from "@/hooks/stats-hooks/useStatsRange";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StatsOverviewSection() {
  const { statsOverview, expenseStats, incomeStats } = useStatsContext();
  const { selectedRange } = useStatsRange();

  const currentOverview = statsOverview["this_year"];
  const currentIncomeStats = incomeStats["this_year"];
  const currentExpenseStats = expenseStats["this_year"];

  if (!currentOverview || !currentIncomeStats || !currentExpenseStats)
    return null;

  const avgIncome = currentIncomeStats.averagePerPeriod || 0;
  const avgExpenses = currentExpenseStats.averagePerPeriod || 0;

  const savingsRate =
    currentOverview.totalIncome > 0
      ? Math.round(
          ((currentOverview.totalIncome - currentOverview.totalExpenses) /
            currentOverview.totalIncome) *
            100
        )
      : 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.sectionHeaderButton}>
        <Text style={styles.sectionHeaderText}>Statistics</Text>
        <Entypo name="chevron-right" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Feather name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.statLabel}>Avg Monthly Income</Text>
          <Text style={styles.statValue}>{formatCurrency(avgIncome)}</Text>
        </View>

        <View style={styles.statItem}>
          <Feather name="trending-down" size={24} color="#F44336" />
          <Text style={styles.statLabel}>Avg Monthly Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(avgExpenses)}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons name="savings" size={24} color="#2196F3" />
          <Text style={styles.statLabel}>Savings Rate</Text>
          <Text style={styles.statValue}>{savingsRate}%</Text>
        </View>

        <View style={styles.statItem}>
          <Feather name="calendar" size={24} color="#FF9800" />
          <Text style={styles.statLabel}>Total Transactions</Text>
          <Text style={styles.statValue}>
            {currentOverview.totalTransactions}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: `${colors.backgroundDark}10`,
    borderRadius: 12,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});
