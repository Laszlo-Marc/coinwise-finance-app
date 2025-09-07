import BudgetDescriptionInput from "@/components/budgetsComponents/budget-form-components/BudgetDescriptionInput";
import BudgetTitleInput from "@/components/budgetsComponents/budget-form-components/BudgetTitleInput";
import RecurringFrequencySelector from "@/components/budgetsComponents/budget-form-components/RecurringFrequencyField";
import BudgetCategoryDropdown from "@/components/budgetsComponents/BudgetCategoryDropdown";
import ThresholdToggle from "@/components/budgetsComponents/ThresholdToggle";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { SwitchField } from "@/components/goalsComponents/goalFormComponents/SwitchField";
import { TargetAmountInput } from "@/components/goalsComponents/goalFormComponents/TargetAmountInput";
import { colors } from "@/constants/colors";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useEditBudgetForm } from "@/hooks/budget-screen/useEditBudgetForm";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EditBudgetScreen = () => {
  const insets = useSafeAreaInsets();
  const { budgets, updateBudget } = useBudgets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetId = params.id as string;

  const budget = budgets.find((b) => b.id === budgetId);

  const {
    formData,
    showSuccess,
    successOpacity,
    showStartDatePicker,
    showTargetDatePicker,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    handleInputChange,
    handleSave,
    isFormValid,
  } = useEditBudgetForm();

  if (!budget) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading budget...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.innerContainer}>
        <LinearGradient
          colors={["rgba(75, 108, 183, 0.8)", "rgba(24, 40, 72, 0.8)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Budget</Text>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormValid}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.form}>
          <BudgetTitleInput
            value={formData.title}
            onChange={(value) => handleInputChange("title", value)}
          />

          <BudgetDescriptionInput
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
          />

          <View style={styles.formGroup}>
            <BudgetCategoryDropdown
              selectedCategory={formData.category}
              onSelectCategory={(category) =>
                handleInputChange("category", category)
              }
            />
          </View>

          <TargetAmountInput
            value={formData.amount}
            onChange={(value) => handleInputChange("amount", value)}
          />

          <DatePickerField
            label="Start Date"
            date={formData.start_date}
            onChange={(date) => handleInputChange("start_date", date)}
            showPicker={showStartDatePicker}
            setShowPicker={setShowStartDatePicker}
          />

          <DatePickerField
            label="Target Date *"
            date={formData.end_date}
            onChange={(date) => handleInputChange("end_date", date)}
            showPicker={showTargetDatePicker}
            setShowPicker={setShowTargetDatePicker}
            minDate={
              new Date(new Date(formData.start_date).getTime() + 86400000)
            }
          />

          <SwitchField
            value={formData.notificationsEnabled}
            onChange={(value) =>
              handleInputChange("notificationsEnabled", value)
            }
            label="Enable Notifications"
            helperText="Get notified when you reach a certain threshold of your budget"
          />

          {formData.notificationsEnabled && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notification Threshold</Text>
              <ThresholdToggle
                enabled={formData.notificationsEnabled}
                threshold={formData.notificationThreshold}
                onToggle={() =>
                  handleInputChange(
                    "notificationsEnabled",
                    !formData.notificationsEnabled
                  )
                }
                onChangeThreshold={(value) =>
                  handleInputChange("notificationThreshold", value)
                }
              />
            </View>
          )}

          <SwitchField
            value={formData.isRecurring}
            onChange={(value) => handleInputChange("isRecurring", value)}
            label="Recurring Budget"
            helperText="Enable for recurring budgets (e.g. weekly groceries budget)"
          />

          {formData.isRecurring && (
            <RecurringFrequencySelector
              frequency={formData.recurring_frequency}
              onChange={(value) =>
                handleInputChange("recurring_frequency", value)
              }
            />
          )}
        </ScrollView>
        {showSuccess && (
          <Animated.View
            style={[styles.successOverlay, { opacity: successOpacity }]}
          >
            <View style={styles.successContent}>
              <Feather name="check-circle" size={60} color={colors.success} />
              <Text style={styles.successText}>Budget Updated!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditBudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  successOverlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  successContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    color: colors.success,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  saveButton: {
    backgroundColor: colors.primary[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});
