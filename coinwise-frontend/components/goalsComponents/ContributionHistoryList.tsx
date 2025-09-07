import { colors } from "@/constants/colors";
import { formatCurrency } from "@/hooks/goals-helpers";
import { ContributionModel } from "@/models/goal-contribution";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  contributions: ContributionModel[];
}

export const ContributionHistoryList = ({ contributions }: Props) => {
  if (contributions.length === 0) {
    return (
      <Text style={{ color: colors.textSecondary }}>No contributions yet.</Text>
    );
  }

  return (
    <>
      {contributions.map((c, i) => (
        <View key={i} style={styles.historyItem}>
          <Text style={styles.historyDate}>
            {new Date(c.date).toLocaleDateString()}
          </Text>
          <Text style={styles.historyAmount}>+{formatCurrency(c.amount)}</Text>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  historyDate: {
    fontSize: 14,
    color: colors.text,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
  },
});
