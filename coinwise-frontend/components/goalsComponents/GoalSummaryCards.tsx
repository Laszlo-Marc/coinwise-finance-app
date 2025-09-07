// components/goalsComponents/GoalsSummaryCards.tsx
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import { colors } from "@/constants/colors";
import { formatCurrency } from "@/utils/formatting";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface GoalsSummaryCardsProps {
  totalGoals: number;
  totalSaved: number;
  averageCompletionRate: number;
}

const GoalsSummaryCards: React.FC<GoalsSummaryCardsProps> = ({
  totalGoals,
  totalSaved,
  averageCompletionRate,
}) => {
  return (
    <AnimatedCard delay={100}>
      <View style={styles.summaryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Goals</Text>
            <Text style={styles.summaryValue}>{totalGoals}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Saved</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalSaved)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Completion Rate</Text>
            <Text style={styles.summaryValue}>
              {averageCompletionRate.toFixed(0)}%
            </Text>
          </View>
        </ScrollView>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundLight,
  },
  summaryCard: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 120,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: "Montserrat",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: "Montserrat",
  },
});

export default GoalsSummaryCards;
