import { colors } from "@/constants/colors";
import { formatCurrency } from "@/hooks/goals-helpers";
import { BudgetModel } from "@/models/budget";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface BudgetOverviewCardProps {
  budget: BudgetModel;
  progressAnim: Animated.Value;
}

const BudgetDetailsOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  budget,
  progressAnim,
}) => {
  const spentPercentage = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;

  const isOverBudget = budget.spent > budget.amount;
  const isFullyUsed = budget.spent === budget.amount;
  const isOnTrack = !isOverBudget && !isFullyUsed;

  const getProgressColor = () => {
    if (isOverBudget) return "#FF4757";
    if (spentPercentage > 80) return "#FFA726";
    if (spentPercentage > 60) return "#FFCA28";
    return colors.primary[500];
  };

  // Determine status visuals
  const getStatusMeta = () => {
    if (isOverBudget) {
      return {
        backgroundColor: "#FF475720",
        icon: "alert-triangle",
        iconColor: "#FF4757",
        text: "Over Budget",
        textColor: "#FF4757",
      };
    } else if (isFullyUsed) {
      return {
        backgroundColor: "#FFA72620",
        icon: "info",
        iconColor: "#FFA726",
        text: "Fully Used",
        textColor: "#FFA726",
      };
    } else {
      return {
        backgroundColor: "#4ECDC420",
        icon: "check-circle",
        iconColor: "#4ECDC4",
        text: "On Track",
        textColor: "#4ECDC4",
      };
    }
  };

  const { backgroundColor, icon, iconColor, text, textColor } = getStatusMeta();

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.glassCard}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Budget Overview
          </Text>
          <View style={[styles.statusBadge, { backgroundColor }]}>
            <Feather name={icon as any} size={12} color={iconColor} />
            <Text style={[styles.statusText, { color: textColor }]}>
              {text}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <View style={styles.mainAmount}>
            <Text style={[styles.spentAmount, { color: colors.text }]}>
              {formatCurrency(parseFloat(budget.spent.toFixed(2)))}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.textSecondary }]}>
              of {formatCurrency(parseFloat(budget.amount.toFixed(2)))}
            </Text>
          </View>
          <View style={styles.remainingContainer}>
            <Text
              style={[styles.remainingLabel, { color: colors.textSecondary }]}
            >
              {isOverBudget ? "Over by" : "Remaining"}
            </Text>
            <Text
              style={[
                styles.remainingAmount,
                { color: isOverBudget ? "#FF4757" : colors.primary[500] },
              ]}
            >
              {formatCurrency(parseFloat(Math.abs(remaining).toFixed(2)))}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.backgroundLight },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getProgressColor(),
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", `${Math.min(100, spentPercentage)}%`],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </View>
          <Text
            style={[styles.percentageText, { color: colors.textSecondary }]}
          >
            {spentPercentage.toFixed(1)}% used
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Period
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {budget.is_recurring ? budget.recurring_frequency : "One-time"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Feather name="tag" size={16} color={colors.textSecondary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Category
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {budget.category}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  glassCard: {
    padding: 24,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  amountContainer: {
    marginBottom: 24,
  },
  mainAmount: {
    marginBottom: 12,
  },
  spentAmount: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Montserrat",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  remainingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Montserrat",
    color: colors.text,
    textTransform: "capitalize",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export default BudgetDetailsOverviewCard;
