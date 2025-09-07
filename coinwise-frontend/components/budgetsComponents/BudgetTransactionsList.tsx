import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  transactions: TransactionModel[];
}

const BudgetTransactionsList: React.FC<Props> = ({ transactions }) => {
  const [showAll, setShowAll] = useState(false);

  if (!transactions || transactions.length === 0) return null;

  const visibleTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {showAll ? "All Transactions" : "Recent Transactions"}
        </Text>

        {visibleTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <Text
                style={[
                  styles.transactionDescription,
                  { color: colors.text, fontFamily: "Montserrat" },
                ]}
              >
                {transaction.description}
              </Text>
              <Text
                style={[
                  styles.transactionDate,
                  { color: colors.textSecondary, fontFamily: "Montserrat" },
                ]}
              >
                {new Date(transaction.date).toLocaleDateString()}
                {transaction.merchant && ` • ${transaction.merchant}`}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color: transaction.type === "expense" ? "#FF6B6B" : "#4ECDC4",
                },
              ]}
            >
              {transaction.type === "expense" ? "-" : "+"}
              {transaction.currency} {transaction.amount.toFixed(2)}
            </Text>
          </View>
        ))}

        {transactions.length > 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowAll((prev) => !prev)}
          >
            <Text style={[styles.viewAllText, { color: colors.primary[500] }]}>
              {showAll
                ? "Show Less"
                : `View All Transactions (${transactions.length})`}
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  glassCardBlur: {
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: "Montserrat",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  transactionDate: {
    fontSize: 13,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
    fontFamily: "Montserrat",
  },
  viewAllButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});

export default BudgetTransactionsList;
