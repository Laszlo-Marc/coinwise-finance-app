import { colors } from "@/constants/colors";
import { GoalModel } from "@/models/goal";
import { calculatePercentage, formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GoalsItemProps {
  goal: GoalModel;
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void;
}

const getProgressColor = (percentage: number) => {
  if (percentage < 30) return colors.error;
  if (percentage < 70) return colors.primary[400];
  return colors.success;
};

const GoalsItem: React.FC<GoalsItemProps> = ({
  goal,
  onEdit,
  onDelete,
  onPress,
}) => {
  const progressPercentage = calculatePercentage(
    goal.current_amount,
    goal.target_amount
  );
  const progressColor = getProgressColor(progressPercentage);

  return (
    <TouchableOpacity style={styles.goalCard} onPress={onPress}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <View style={styles.goalActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Feather name="edit-2" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Feather name="trash" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      <View style={styles.goalDetails}>
        <Text style={styles.goalAmount}>
          {formatCurrency(goal.current_amount)} /{" "}
          {formatCurrency(goal.target_amount)}
        </Text>
        <Text style={styles.goalDate}>
          Target: {new Date(goal.end_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    fontFamily: "Montserrat",
  },
  goalActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary[500],
    fontFamily: "Montserrat",
  },
  goalDate: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: "Montserrat",
  },
});

export default GoalsItem;
