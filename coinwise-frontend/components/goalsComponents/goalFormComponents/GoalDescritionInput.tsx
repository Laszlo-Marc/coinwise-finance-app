import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}

export const GoalDescriptionInput: React.FC<Props> = ({
  value,
  onChange,
  error,
  touched,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Description</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      value={value}
      onChangeText={onChange}
      placeholder="Add some details about your goal"
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={3}
    />
    {error && touched && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
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
  errorText: {
    color: colors.error,
    marginTop: 4,
    fontSize: 13,
  },
});
