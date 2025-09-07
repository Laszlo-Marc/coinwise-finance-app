import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  budget: BudgetModel;
  onEdit: (budget: BudgetModel) => void;
  onDelete: (budgetId: string) => void;
}

const BudgetItem = ({ budget, onEdit, onDelete }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const remaining = budget.amount - budget.spent;
  const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(budget.end_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  useEffect(() => {
    const progress = Math.min(budget.spent / budget.amount, 1);

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [budget.spent, budget.amount]);

  const getProgressColor = () => {
    if (percentage < 50) return ["#10B981", "#34D399"];
    if (percentage < 75) return ["#3B82F6", "#60A5FA"];
    if (percentage < 90) return ["#F59E0B", "#FBBF24"];
    return ["#EF4444", "#F87171"];
  };

  const getStatusInfo = (): {
    icon: typeof Feather.defaultProps.name;
    color: string;
  } => {
    if (percentage >= 100) return { icon: "alert-triangle", color: "#EF4444" };
    if (percentage >= 90) return { icon: "alert-circle", color: "#F59E0B" };
    if (percentage >= 75) return { icon: "info", color: "#3B82F6" };
    return { icon: "check-circle", color: "#10B981" };
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const statusInfo = getStatusInfo();
  const progressColors = getProgressColor();

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ]}
    >
      {/* Glassmorphic Background */}
      <View style={styles.glassBackground}>
        {/* Gradient Overlay */}
        <View
          style={[
            styles.gradientOverlay,
            { backgroundColor: `${progressColors[0]}08` },
          ]}
        />

        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.push(`/budgets/budget-details/${budget.id}`)}
          activeOpacity={0.9}
          style={styles.cardContent}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {budget.title}
                </Text>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: statusInfo.color },
                  ]}
                >
                  <Feather name={statusInfo.icon} size={12} color="white" />
                </View>
              </View>

              {budget.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {budget.description}
                </Text>
              )}

              {/* Badges */}
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${progressColors[0]}15` },
                  ]}
                >
                  <Text
                    style={[styles.categoryText, { color: progressColors[0] }]}
                  >
                    {budget.category}
                  </Text>
                </View>

                {budget.is_recurring && (
                  <View style={styles.recurringBadge}>
                    <Feather name="refresh-cw" size={10} color="#6B7280" />
                    <Text style={styles.recurringText}>
                      {budget.recurring_frequency}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => onEdit(budget)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Feather name="edit-2" size={14} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(budget.id || "")}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Feather name="trash-2" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <View style={styles.percentageContainer}>
                <Text
                  style={[styles.percentageText, { color: progressColors[0] }]}
                >
                  {percentage.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Enhanced Progress Bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    progressColors as [
                      import("react-native").ColorValue,
                      import("react-native").ColorValue
                    ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
                {/* Progress glow effect */}
                <Animated.View
                  style={[
                    styles.progressGlow,
                    {
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                      backgroundColor: progressColors[1],
                    },
                  ]}
                />
              </Animated.View>
            </View>
          </View>

          {/* Financial Summary */}
          <View style={styles.financialGrid}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Budget</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(budget.amount)}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Spent</Text>
              <Text
                style={[styles.financialValue, { color: progressColors[0] }]}
              >
                {formatCurrency(budget.spent)}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Remaining</Text>
              <Text
                style={[
                  styles.financialValue,
                  { color: remaining >= 0 ? "#10B981" : "#EF4444" },
                ]}
              >
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.timeContainer}>
              <Feather name="clock" size={12} color="#6B7280" />
              <Text style={styles.timeText}>
                {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 12,
  },
  glassBackground: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  cardContent: {
    padding: 24,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    gap: 4,
  },
  recurringText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  editButton: {},
  deleteButton: {},
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  percentageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    position: "relative",
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  progressGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 6,
    opacity: 0.3,
  },
  financialGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  financialItem: {
    alignItems: "center",
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default BudgetItem;
