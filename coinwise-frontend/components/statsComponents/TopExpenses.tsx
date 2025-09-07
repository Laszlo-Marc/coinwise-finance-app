import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  expenses: TransactionModel[];
};

export const TopExpenses: React.FC<Props> = ({ expenses }) => {
  if (!expenses.length) return null;
  const router = useRouter();
  const getIcon = (category?: string) => {
    switch (category) {
      case "Food & Takeout":
        return <MaterialIcons name="fastfood" size={20} color={colors.text} />;
      case "Transportation":
        return <AntDesign name="car" size={20} color={colors.text} />;
      case "Groceries":
        return <Feather name="shopping-cart" size={20} color={colors.text} />;
      case "Entertainment":
        return (
          <Ionicons
            name="game-controller-outline"
            size={20}
            color={colors.text}
          />
        );
      case "Health":
        return <Feather name="heart" size={20} color={colors.text} />;
      case "Utilities":
        return <Ionicons name="water-outline" size={20} color={colors.text} />;
      case "Subscriptions":
        return (
          <MaterialIcons name="subscriptions" size={20} color={colors.text} />
        );
      case "Travel":
        return (
          <Ionicons name="airplane-outline" size={20} color={colors.text} />
        );
      case "Education":
        return <Feather name="book" size={20} color={colors.text} />;
      case "Housing":
        return <Ionicons name="home-outline" size={20} color={colors.text} />;
      default:
        return <MaterialIcons name="payment" size={20} color={colors.text} />;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Expenses</Text>
      <View style={styles.list}>
        {expenses.map((expense) => (
          <TouchableOpacity
            key={expense.id}
            onPress={() => router.push(`./transaction/${expense.id}`)}
          >
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(expense.category)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {expense.merchant || expense.description || "Unknown"}
                </Text>
                <Text style={styles.subtext}>
                  {expense.category || "uncategorized"} •{" "}
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.amount}>
                -{expense.amount.toFixed(0)} RON
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  list: {
    marginTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.backgroundDark}80`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  amount: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
});
