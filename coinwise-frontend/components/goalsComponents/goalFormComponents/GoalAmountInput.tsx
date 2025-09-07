import { colors } from "@/constants/colors";
import { StyleSheet, Text, TextInput, View } from "react-native";
interface GoalAmountInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}
export const GoalAmountInput: React.FC<GoalAmountInputProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Target Amount *</Text>
      <View style={styles.amountInputContainer}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={[styles.amountInput, error && styles.errorBorder]}
          value={value}
          onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ""))}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: {
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
  errorBorder: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
});
