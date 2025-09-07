import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type BudgetDescriptionInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const BudgetDescriptionInput: React.FC<BudgetDescriptionInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder="Optional description..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});

export default BudgetDescriptionInput;
