import { colors } from "@/constants/colors";
import { BudgetStats } from "@/models/stats";
import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  budgetStats?: BudgetStats;
  progressAnim: Animated.Value;
}

const EnhancedBudgetOverviewCard: React.FC<Props> = ({
  budgetStats,
  progressAnim,
}) => {
  const {
    totalBudget,
    totalSpent,
    remainingBudget,
    budgetUtilization,
    overBudgetCount,
    underBudgetCount,
    budgets,
  } = budgetStats || {};

  const hasBudgets = (budgets?.length ?? 0) > 0;

  const safeBudgetUtilization = budgetUtilization ?? 0;
  useEffect(() => {
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: Math.min(safeBudgetUtilization / 100, 1),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [safeBudgetUtilization]);

  const getStatusColor = () => {
    if (safeBudgetUtilization <= 50) return "#4ECDC4";
    if (safeBudgetUtilization <= 80) return "#FECA57";
    return "#FF6B6B";
  };

  const getStatusText = () => {
    if (safeBudgetUtilization <= 50) return "On Track";
    if (safeBudgetUtilization <= 80) return "Moderate";
    if (safeBudgetUtilization <= 100) return "High Usage";
    return "Over Budget";
  };

  const formatCurrency = (amount: number) =>
    `RON ${Math.abs(amount).toFixed(2)}`;

  if (!hasBudgets) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Feather name="pie-chart" size={48} color={colors.primary[400]} />
          <Text style={styles.emptyTitle}>No Budget Data</Text>
          <Text style={styles.emptySubtitle}>
            Create budgets to see your spending overview
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Budget Overview
          </Text>
          <Text style={styles.budgetCount}>
            {underBudgetCount} On Track • {overBudgetCount} Over Limit
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Total Progress</Text>
          <Text
            style={[styles.progressPercentage, { color: getStatusColor() }]}
          >
            {safeBudgetUtilization.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(),
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    "0%",
                    `${Math.min(100, safeBudgetUtilization)}%`,
                  ],
                }),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.amountsRow}>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Total Budget</Text>
          <Text style={styles.value}>{formatCurrency(totalBudget ?? 0)}</Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={[styles.label, { color: "#FF6B6B" }]}>Spent</Text>
          <Text style={[styles.value, { color: "#FF6B6B" }]}>
            {formatCurrency(totalSpent ?? 0)}
          </Text>
        </View>
        <View style={styles.amountColumn}>
          <Text style={styles.label}>Remaining</Text>
          <Text
            style={[
              styles.value,
              {
                color: (remainingBudget ?? 0) >= 0 ? "#4ECDC4" : "#FF6B6B",
              },
            ]}
          >
            {(remainingBudget ?? 0) >= 0 ? "" : "-"}
            {formatCurrency(remainingBudget ?? 0)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  budgetCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  amountColumn: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default EnhancedBudgetOverviewCard;
