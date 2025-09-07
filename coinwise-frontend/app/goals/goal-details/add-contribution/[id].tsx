import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { AmountInput } from "@/components/goalsComponents/contribution-components/AmountInput";
import { HeaderBarX } from "@/components/goalsComponents/contribution-components/HeaderBar";
import { QuickAmountButtons } from "@/components/goalsComponents/contribution-components/QuickAmountButtons";
import { SuccessOverlay } from "@/components/goalsComponents/contribution-components/SuccessOverlay";
import { colors } from "@/constants/colors";
import { useAddContribution } from "@/hooks/goals-hooks/useAddContribution";
import { Feather } from "@expo/vector-icons";

const AddContributionScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const {
    goalData,
    amount,
    setAmount,
    date,
    setShowDatePicker,
    showDatePicker,
    handleDateChange,
    handleAddContribution,
    validateAmount,
    showSuccess,
    successOpacity,
  } = useAddContribution(String(id));

  if (!goalData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Goal not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/financial-goals")}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <HeaderBarX title="Add Contribution" onClose={() => router.back()} />

          <View style={styles.content}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goalData.title}</Text>
              <Text style={styles.goalProgress}>
                Current:{" "}
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(goalData.current_amount)}
              </Text>
            </View>

            <AmountInput amount={amount} onChange={setAmount} />
            <QuickAmountButtons onSelect={(amt) => setAmount(amt.toString())} />

            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Contribution Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                !validateAmount() && styles.addButtonDisabled,
              ]}
              onPress={handleAddContribution}
              disabled={!validateAmount()}
            >
              <Text style={styles.addButtonText}>Add Contribution</Text>
            </TouchableOpacity>
          </View>

          {showSuccess && <SuccessOverlay opacity={successOpacity} />}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  goalInfo: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dateContainer: {
    marginBottom: 32,
  },
  dateLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  retryText: {
    color: colors.primary[400],
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default AddContributionScreen;
