import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ContributionFieldsProps {
  contributionAmount: string;
  contributionFrequency: "daily" | "weekly" | "monthly";
  onAmountChange: (value: string) => void;
  onFrequencyChange: (value: "daily" | "weekly" | "monthly") => void;
  error?: string;
}

const ContributionFields: React.FC<ContributionFieldsProps> = ({
  contributionAmount,
  contributionFrequency,
  onAmountChange,
  onFrequencyChange,
  error,
}) => {
  const handleCycleFrequency = () => {
    const next =
      contributionFrequency === "monthly"
        ? "weekly"
        : contributionFrequency === "weekly"
        ? "daily"
        : "monthly";
    onFrequencyChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Contribution Amount</Text>
      <View style={styles.amountInputContainer}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={styles.amountInput}
          value={contributionAmount.toString()}
          onChangeText={(value) =>
            onAmountChange(value.replace(/[^0-9.]/g, ""))
          }
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Contribution Frequency</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleCycleFrequency}
      >
        <Text style={styles.selectText}>
          {contributionFrequency.charAt(0).toUpperCase() +
            contributionFrequency.slice(1)}
        </Text>
        <Feather name="repeat" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Tap to cycle through: Monthly → Weekly → Daily
      </Text>
    </View>
  );
};

export default ContributionFields;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
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
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  error: {
    color: colors.error,
    marginTop: 4,
    fontSize: 13,
  },
});
