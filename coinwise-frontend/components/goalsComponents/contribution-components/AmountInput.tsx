import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  amount: string;
  onChange: (val: string) => void;
}

export const AmountInput = ({ amount, onChange }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>Amount</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.currency}>RON</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={onChange}
        placeholder="0.00"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        autoFocus
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currency: { fontSize: 24, color: colors.text, marginRight: 4 },
  input: { flex: 1, fontSize: 24, color: colors.text, padding: 16 },
});
