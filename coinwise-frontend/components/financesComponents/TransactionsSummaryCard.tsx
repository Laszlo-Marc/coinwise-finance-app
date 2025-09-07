import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AnimatedCard from "../homePageComponents/AnimatedCard";

type Props = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

const TransactionsSummaryCard: React.FC<Props> = ({
  totalIncome,
  totalExpenses,
  balance,
}) => {
  return (
    <AnimatedCard delay={100}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, styles.incomeText]}>
            {new Intl.NumberFormat("ro-RO").format(totalIncome)} RON
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, styles.expensesText]}>
            {new Intl.NumberFormat("ro-RO").format(totalExpenses)} RON
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text
            style={[
              styles.summaryValue,
              balance >= 0 ? styles.incomeText : styles.expensesText,
            ]}
          >
            {new Intl.NumberFormat("ro-RO").format(balance)} RON
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
    fontFamily: "Montserrat",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  incomeText: {
    color: colors.success,
  },
  expensesText: {
    color: colors.error,
  },
});

export default TransactionsSummaryCard;
