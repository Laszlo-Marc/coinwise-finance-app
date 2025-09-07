import TransactionForm from "@/components/transactionsComponents/TransactionsForms";
import { colors } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  return (
    <View style={styles.container}>
      <TransactionForm
        type={type as "expense" | "income" | "transfer" | "deposit"}
        onSuccess={() => router.replace("/transactions")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
