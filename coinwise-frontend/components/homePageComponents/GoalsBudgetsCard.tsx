import { colors } from "@/constants/colors";
import { useStatsContext } from "@/contexts/StatsContext";
import { formatCurrency } from "@/hooks/goals-helpers";
import { useStatsRange } from "@/hooks/stats-hooks/useStatsRange";
import { BudgetModel } from "@/models/budget";
import { GoalModel } from "@/models/goal";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  title: string;
  items: (GoalModel | BudgetModel)[];
  type: "goal" | "budget";
  navigateTo: string;
  onCreatePress?: () => void;
};

export default function ProgressCardSection({
  title,
  items,
  type,
  navigateTo,
  onCreatePress,
}: Props) {
  const { budgetStats, goalStats } = useStatsContext();
  const { selectedRange } = useStatsRange();
  const currentBudgetStats = budgetStats[selectedRange];
  const currentGoalStats = goalStats[selectedRange];
  const isGoal = type === "goal";

  const renderStatsSummary = () => {
    if (isGoal && currentGoalStats) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollStatsRow}
          contentContainerStyle={styles.statsContainer}
        >
          <StatBox
            icon={<Feather name="target" size={20} color={colors.text} />}
            label="Total Goals"
            value={currentGoalStats?.totalGoals}
          />
          <StatBox
            icon={<Feather name="check-circle" size={20} color={colors.text} />}
            label="Completed"
            value={currentGoalStats?.completedGoals}
          />
          <StatBox
            icon={<Feather name="activity" size={20} color={colors.text} />}
            label="Active"
            value={currentGoalStats?.activeGoals}
          />
          <StatBox
            icon={<Feather name="plus-circle" size={20} color={colors.text} />}
            label="Contributed"
            value={formatCurrency(currentGoalStats?.totalContributions)}
          />
          <StatBox
            icon={<Feather name="dollar-sign" size={20} color={colors.text} />}
            label="Avg Contribution"
            value={formatCurrency(currentGoalStats?.averageContribution)}
          />
        </ScrollView>
      );
    }

    if (!isGoal && currentBudgetStats) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollStatsRow}
          contentContainerStyle={styles.statsContainer}
        >
          <StatBox
            icon={<Feather name="credit-card" size={20} color={colors.text} />}
            label="Total Budget"
            value={formatCurrency(currentBudgetStats.totalBudget)}
          />
          <StatBox
            icon={
              <Feather name="shopping-cart" size={20} color={colors.text} />
            }
            label="Spent"
            value={formatCurrency(currentBudgetStats.totalSpent)}
          />
          <StatBox
            icon={<Feather name="pocket" size={20} color={colors.text} />}
            label="Remaining"
            value={formatCurrency(currentBudgetStats.remainingBudget)}
          />
          <StatBox
            icon={
              <Feather name="alert-circle" size={20} color={colors.error} />
            }
            label="Over Budget"
            value={currentBudgetStats.overBudgetCount}
          />
          <StatBox
            icon={
              <Feather name="check-circle" size={20} color={colors.success} />
            }
            label="Under Budget"
            value={currentBudgetStats.underBudgetCount}
          />
        </ScrollView>
      );
    }

    return null;
  };

  const renderProgress = (item: GoalModel | BudgetModel) => {
    const progress = isGoal
      ? (item as GoalModel).current_amount / (item as GoalModel).target_amount
      : (item as BudgetModel).spent / (item as BudgetModel).amount;

    const percentage = Math.min(progress * 100, 100);
    const isAtRisk = !isGoal && percentage > 80;

    return (
      <View key={item.id} style={styles.cardItem}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={styles.itemTitle}>
              {isGoal
                ? (item as GoalModel).title
                : (item as BudgetModel).category}
            </Text>
            <Text style={styles.itemAmount}>
              {isGoal
                ? `${formatCurrency(
                    (item as GoalModel).current_amount
                  )} of ${formatCurrency((item as GoalModel).target_amount)}`
                : `${formatCurrency(
                    (item as BudgetModel).spent
                  )} of ${formatCurrency((item as BudgetModel).amount)}`}
            </Text>
          </View>
          <Text style={[styles.itemPercentage, isAtRisk && styles.itemAtRisk]}>
            {Math.round(percentage)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: isGoal
                  ? colors.primary[500]
                  : isAtRisk
                  ? colors.error
                  : colors.primary[400],
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderPlaceholder = () => (
    <View style={styles.goalPlaceholder}>
      {isGoal ? (
        <Feather name="target" size={40} color={colors.textSecondary} />
      ) : (
        <AntDesign name="creditcard" size={40} color={colors.textSecondary} />
      )}
      <Text style={styles.statPlaceholderText}>
        {isGoal
          ? "Set your first savings goal"
          : "Create a budget to manage expenses"}
      </Text>
      <TouchableOpacity onPress={onCreatePress} style={styles.createButton}>
        <Text style={styles.createButtonText}>
          {isGoal ? "Create Goal" : "Create Budget"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => router.replace(navigateTo as any)}
        style={styles.sectionHeaderButton}
      >
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Entypo name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      {renderStatsSummary()}

      {items && items.length > 0
        ? items.map(renderProgress)
        : renderPlaceholder()}
    </View>
  );
}

const StatBox = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <View style={styles.statBox}>
    {icon}
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  scrollStatsRow: {
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
    paddingRight: 12,
  },
  statBox: {
    backgroundColor: `${colors.backgroundDark}10`,
    padding: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
    fontFamily: "Montserrat",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  cardItem: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    fontFamily: "Montserrat",
  },
  itemAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: "Montserrat",
    marginBottom: 4,
  },
  itemPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
    fontFamily: "Montserrat",
  },
  itemAtRisk: {
    color: colors.error,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  goalPlaceholder: {
    alignItems: "center",
    marginTop: 16,
  },
  statPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
  createButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});
