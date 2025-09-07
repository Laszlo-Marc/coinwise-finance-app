// components/budgets/EmptyState.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onCreateFirstBudget: () => void;
};

const EmptyState = ({ onCreateFirstBudget }: Props) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Feather name="pie-chart" size={80} color={colors.secondary[400]} />
      <Text style={styles.emptyStateTitle}>No Budgets Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Track your spending by creating your first budget
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={onCreateFirstBudget}
      >
        <Text style={styles.emptyStateButtonText}>
          Create Your First Budget
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmptyState;
