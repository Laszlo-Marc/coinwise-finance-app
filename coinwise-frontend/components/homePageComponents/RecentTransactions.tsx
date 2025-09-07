import { colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/hooks/home-page/formatHooks";
import { TransactionModel } from "@/models/transaction";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  transactions: TransactionModel[];
}

const RecentTransactionsCard: React.FC<Props> = ({ transactions }) => {
  const router = useRouter();
  const { state } = useAuth();
  const getDayDifference = (txDate: Date, today: Date): number => {
    const tx = new Date(
      today.getFullYear(),
      txDate.getMonth(),
      txDate.getDate()
    );
    const diff = Math.abs(tx.getTime() - today.getTime());
    return diff;
  };

  const today = new Date();

  const processedTransactions = [...transactions]
    .map((tx) => ({
      ...tx,
      dayDiff: getDayDifference(new Date(tx.date), today),
    }))
    .sort((a, b) => a.dayDiff - b.dayDiff)
    .slice(0, 5);

  const getIsPositive = (tx: TransactionModel) => {
    if (tx.type === "income" || tx.type === "deposit") return true;
    if (
      tx.type === "transfer" &&
      typeof tx.receiver === "string" &&
      typeof state?.user?.full_name === "string" &&
      tx.receiver.toLowerCase().includes(state.user.full_name.toLowerCase())
    )
      return true;
    return false;
  };

  const getIconColor = (tx: TransactionModel) =>
    getIsPositive(tx) ? colors.success || "#4CAF50" : colors.error || "#F44336";

  const getIconName = (tx: TransactionModel) =>
    getIsPositive(tx) ? "arrow-down" : "arrow-up";

  const getAmountPrefix = (tx: TransactionModel) =>
    getIsPositive(tx) ? "+" : "-";

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.sectionHeaderButton}
        onPress={() => router.replace("./transactions")}
      >
        <Text style={styles.sectionHeaderText}>Recent Transactions</Text>
        <Entypo name="chevron-right" size={24} color={colors.text} />
      </TouchableOpacity>

      {processedTransactions.length > 0 ? (
        <View>
          {processedTransactions.map((transaction, index) => (
            <TouchableOpacity
              key={transaction.id || index}
              style={styles.transactionItem}
              onPress={() => router.push(`/transaction/${transaction.id}`)}
            >
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: getIconColor(transaction) },
                  ]}
                >
                  <Ionicons
                    name={getIconName(transaction)}
                    size={16}
                    color="white"
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.description || transaction.category}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: getIconColor(transaction) },
                ]}
              >
                {getAmountPrefix(transaction)}
                {formatCurrency(transaction.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.transactionsEmptyState}>
          <View style={styles.emptyStateIcon}>
            <Text style={styles.emptyStateIconText}>🧩</Text>
          </View>
          <Text style={styles.emptyStateText}>No transactions yet</Text>
        </View>
      )}
    </View>
  );
};

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
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}20`,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  transactionDate: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Montserrat",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  transactionsEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateIconText: {
    fontSize: 28,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default RecentTransactionsCard;
