import { colors } from "@/constants/colors";
import { StatsOverview } from "@/models/stats";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  overview: StatsOverview;
};

export const SavingsSummary: React.FC<Props> = ({ overview }) => {
  const isPositive = overview.balance >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Financial Summary</Text>

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Total Income</Text>
          <Text style={[styles.value, { color: colors.success }]}>
            {new Intl.NumberFormat("ro-RO").format(overview.totalIncome)} RON
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Total Expenses</Text>
          <Text style={[styles.value, { color: colors.error }]}>
            {new Intl.NumberFormat("ro-RO").format(overview.totalExpenses)} RON
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Deposits</Text>
          <Text style={[styles.value, { color: colors.primary[400] }]}>
            {new Intl.NumberFormat("ro-RO").format(overview.totalDeposits)} RON
          </Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Net Balance</Text>
          <Text
            style={[
              styles.value,
              { color: isPositive ? colors.success : colors.error },
            ]}
          >
            {new Intl.NumberFormat("ro-RO").format(overview.balance)} RON
          </Text>
        </View>
      </View>

      <View style={styles.insight}>
        <View style={styles.iconWrap}>
          <Feather name="trending-up" size={20} color={colors.text} />
        </View>
        <View style={styles.insightText}>
          <Text style={styles.message}>
            {overview.totalTransactions} transactions in this period.
            {isPositive
              ? " You're maintaining a positive balance!"
              : " Consider reviewing your spending habits."}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  item: {
    width: "48%",
    backgroundColor: `${colors.backgroundDark}40`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  insight: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${colors.primary[500]}10`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
    padding: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[400],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightText: {
    flex: 1,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
