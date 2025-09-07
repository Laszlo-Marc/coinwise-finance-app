import { CategorySelector } from "@/components/goalsComponents/goalFormComponents/CategorySelector";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import TextInputField from "@/components/mainComponents/TextInputField";
import { colors } from "@/constants/colors";
import { useEditTransactionForm } from "@/hooks/transactions-page/useEdittransactionForm";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
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

export default function EditTransactionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    formData,
    errors,
    handleInputChange,
    handleSave,
    isFormValid,
    showSuccess,
    successOpacity,
    showDatePicker,
    setShowDatePicker,
    showCategoryPicker,
    setShowCategoryPicker,
    isSubmiting,
  } = useEditTransactionForm();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.innerContainer}>
        <LinearGradient
          colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
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

          <Text style={styles.headerTitle}>Edit Transaction</Text>
          {isSubmiting ? (
            <View style={styles.spinnerButton}>
              <ActivityIndicator size="small" color={colors.text} />
            </View>
          ) : (
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
          )}
        </LinearGradient>

        <ScrollView style={styles.form}>
          <TextInputField
            label="Amount"
            value={formData.amount.toString()}
            onChange={(val: string) => handleInputChange("amount", val)}
            keyboardType="numeric"
            error={errors.amount}
          />

          <TextInputField
            label="Description"
            value={formData.description}
            onChange={(val: string) => handleInputChange("description", val)}
            error={errors.description}
          />

          <DatePickerField
            label="Date"
            date={formData.date}
            onChange={(date) =>
              handleInputChange("date", date.toString().split("T")[0])
            }
            showPicker={showDatePicker}
            setShowPicker={setShowDatePicker}
            error={errors.date}
          />

          {formData.type === "expense" && (
            <>
              <TextInputField
                label="Merchant"
                value={formData.merchant || ""}
                onChange={(val: string) => handleInputChange("merchant", val)}
              />
              <CategorySelector
                selected={formData.category || "Other"}
                onChange={(val) => handleInputChange("category", val)}
                isExpanded={showCategoryPicker}
                toggleExpand={() => setShowCategoryPicker((prev) => !prev)}
              />
            </>
          )}

          {formData.type === "transfer" && (
            <>
              <TextInputField
                label="Sender"
                value={formData.sender || ""}
                onChange={(val: string) => handleInputChange("sender", val)}
              />
              <TextInputField
                label="Receiver"
                value={formData.receiver || ""}
                onChange={(val: string) => handleInputChange("receiver", val)}
              />
            </>
          )}
        </ScrollView>

        {showSuccess && (
          <Animated.View
            style={[styles.successOverlay, { opacity: successOpacity }]}
          >
            <View style={styles.successContent}>
              <Feather name="check-circle" size={60} color={colors.success} />
              <Text style={styles.successText}>Transaction Updated!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

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
  spinnerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[400],
    justifyContent: "center",
    alignItems: "center",
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
});
