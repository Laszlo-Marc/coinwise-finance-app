import { formatCurrency } from "@/hooks/goals-helpers";
import { GoalModel } from "@/models/goal";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";

const computeMonthsLeft = (endDate: string): number => {
  const target = new Date(endDate);
  const today = new Date();
  return (
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth())
  );
};

export const GoalDetailsCard = ({ goal }: { goal: GoalModel }) => {
  const startDate = new Date(goal.start_date).toLocaleDateString();
  const targetDate = new Date(goal.end_date).toLocaleDateString();
  const monthsLeft = computeMonthsLeft(goal.end_date);

  return (
    <View style={styles.detailsCard}>
      <Text style={styles.description}>{goal.description}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Target Amount:</Text>
        <Text style={styles.detailValue}>
          {formatCurrency(goal.target_amount)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Current Progress:</Text>
        <Text style={styles.detailValue}>
          {formatCurrency(goal.current_amount)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Remaining:</Text>
        <Text style={styles.detailValue}>
          {formatCurrency(goal.target_amount - goal.current_amount)}
        </Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.timelinePoint}>
          <Text style={styles.timelineDate}>{startDate}</Text>
          <Text style={styles.timelineLabel}>Start</Text>
        </View>

        <View style={styles.timelineLine} />

        <View style={styles.timelinePoint}>
          <Text style={styles.timelineDate}>{targetDate}</Text>
          <Text style={styles.timelineLabel}>
            {monthsLeft > 0 ? `${monthsLeft} months left` : "Due now"}
          </Text>
        </View>
      </View>

      <View style={styles.categoryTag}>
        <Text style={styles.categoryText}>{goal.category}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  detailsCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    fontFamily: "Montserrat",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: "Montserrat",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },
  timelinePoint: {
    alignItems: "center",
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.secondaryLight,
    marginHorizontal: 10,
  },
  timelineDate: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "Montserrat",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: "Montserrat",
  },
});
