import { CategorySelector } from "@/components/goalsComponents/goalFormComponents/CategorySelector";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { GoalDescriptionInput } from "@/components/goalsComponents/goalFormComponents/GoalDescritionInput";
import GoalTitleInput from "@/components/goalsComponents/goalFormComponents/GoalTitleInput";
import { TargetAmountInput } from "@/components/goalsComponents/goalFormComponents/TargetAmountInput";
import { useAddGoalForm } from "@/hooks/goals-hooks/useAddGoalForm";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
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
import { colors } from "../../constants/colors";

type ContributionFrequency = "daily" | "weekly" | "monthly";
const AddGoalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    formData,
    errors,
    showStartDatePicker,
    showTargetDatePicker,
    showCategoryPicker,
    successOpacity,
    showSuccess,
    setShowStartDatePicker,
    setShowTargetDatePicker,
    setShowCategoryPicker,
    handleInputChange,
    handleSave,
    isFormValid,
  } = useAddGoalForm();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.innerContainer}>
        {/* Header with gradient */}
        <LinearGradient
          colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/financial-goals")}
          >
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create a goal</Text>

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
          <GoalTitleInput
            value={formData.title}
            onChange={(val) => handleInputChange("title", val)}
            error={errors.title}
          />

          <GoalDescriptionInput
            value={formData.description}
            onChange={(val) => handleInputChange("description", val)}
            error={errors.description}
          />

          <TargetAmountInput
            value={formData.target_amount}
            onChange={(val) => handleInputChange("target_amount", val)}
            error={errors.targetAmount}
          />

          <DatePickerField
            label="Start Date"
            date={formData.start_date}
            onChange={(date) =>
              handleInputChange("start_date", date.toString().split("T")[0])
            }
            showPicker={showStartDatePicker}
            setShowPicker={setShowStartDatePicker}
          />

          <DatePickerField
            label="Target Date *"
            date={formData.end_date}
            onChange={(date) =>
              handleInputChange("end_date", date.toString().split("T")[0])
            }
            showPicker={showTargetDatePicker}
            setShowPicker={setShowTargetDatePicker}
            minDate={
              new Date(new Date(formData.start_date).getTime() + 86400000)
            }
            error={errors.end_date}
          />
          <CategorySelector
            selected={formData.category}
            onChange={(category) => handleInputChange("category", category)}
            isExpanded={showCategoryPicker}
            toggleExpand={() => setShowCategoryPicker((prev) => !prev)}
          />
        </ScrollView>
        {showSuccess && (
          <Animated.View
            style={[styles.successOverlay, { opacity: successOpacity }]}
          >
            <View style={styles.successContent}>
              <Feather name="check-circle" size={60} color={colors.success} />
              <Text style={styles.successText}>Goal Created!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddGoalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  saveButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
