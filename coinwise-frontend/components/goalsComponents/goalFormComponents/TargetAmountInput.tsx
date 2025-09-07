import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const TargetAmountInput: React.FC<Props> = ({
  value,
  onChange,
  error,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Target Amount *</Text>
    <View style={styles.inputWrapper}>
      <Text style={styles.currency}>RON</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => onChange(text)}
        placeholder="0.00"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currency: { fontSize: 16, color: colors.text, marginRight: 4 },
  input: { flex: 1, paddingVertical: 12, color: colors.text, fontSize: 16 },
  errorText: { color: colors.error, fontSize: 13, marginTop: 4 },
});
