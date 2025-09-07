import { colors } from "@/constants/colors";
import { formatCurrency } from "@/hooks/goals-helpers";
import { HistoricalSummary } from "@/models/stats";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SummaryOverviewSection(summaryData: HistoricalSummary) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.sectionHeaderButton}>
        <Text style={styles.sectionHeaderText}>Summary</Text>
      </TouchableOpacity>

      <View style={styles.summaryContainer}>
        {renderPeriod("All Time", summaryData.allTime)}
        {renderPeriod("Last Month", summaryData.lastMonth)}
        {renderPeriod("Last 3 Months", summaryData.last3Months)}
      </View>
    </View>
  );
}

function renderPeriod(
  label: string,
  data: { income: number; expenses: number }
) {
  return (
    <View style={styles.summaryPeriod} key={label}>
      <Text style={styles.summaryPeriodTitle}>{label}</Text>
      <View style={styles.summaryAmounts}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
            {formatCurrency(data.income)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel]}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: "#F44336" }]}>
            {formatCurrency(data.expenses)}
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
  summaryContainer: {
    gap: 16,
  },
  summaryPeriod: {
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
    paddingBottom: 16,
  },
  summaryPeriodTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "Montserrat",
  },
  summaryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "Montserrat",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});
