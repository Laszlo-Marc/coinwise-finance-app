import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  label: string;
  value: string;
  onChange: (val: string ) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  maxLength?: number;
}

const TransactionTextField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  keyboardType = "default",
  multiline = false,
  maxLength,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TransactionTextField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.backgroundLight,
    backgroundColor: colors.backgroundDark,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  error: {
    marginTop: 4,
    color: colors.error,
    fontSize: 13,
  },
});
