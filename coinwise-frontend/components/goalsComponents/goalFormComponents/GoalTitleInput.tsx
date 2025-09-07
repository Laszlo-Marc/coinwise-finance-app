import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  touched?: boolean;
}

const GoalTitleInput: React.FC<Props> = ({
  value,
  onChange,
  error,
  touched,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>Goal Title *</Text>
    <TextInput
      style={[styles.input, error && touched ? styles.inputError : null]}
      value={value}
      onChangeText={onChange}
      placeholder="What are you saving for?"
      placeholderTextColor={colors.textMuted}
    />
    {error && touched && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default GoalTitleInput;

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
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
    fontSize: 13,
  },
});
