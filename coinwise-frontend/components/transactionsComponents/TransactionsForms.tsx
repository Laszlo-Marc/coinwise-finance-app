import { CategorySelector } from "@/components/goalsComponents/goalFormComponents/CategorySelector";
import { DatePickerField } from "@/components/goalsComponents/goalFormComponents/DatePickerInput";
import { colors } from "@/constants/colors";
import { useAddTransactionForm } from "@/hooks/transactions-page/useAddTransactionForm";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  type: "expense" | "income" | "transfer" | "deposit";
  onSuccess: () => void;
}

const TransactionForm: React.FC<Props> = ({ type, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const {
    formData,
    errors,
    showDatePicker,
    successOpacity,
    showSuccess,
    handleInputChange,
    handleSave,
    isFormValid,
    setShowDatePicker,
    setShowCategoryPicker,
    showCategoryPicker,
    isSubmitting,
  } = useAddTransactionForm(type, onSuccess);
  const router = useRouter();
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
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.replace("/transactions")}
            >
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitle}>Add a new transaction</Text>
            </View>

            {isSubmitting ? (
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
          </View>
        </LinearGradient>

        <ScrollView style={styles.form}>
          <TextInput
            placeholder="Description"
            value={formData.description}
            onChangeText={(val) => handleInputChange("description", val)}
            style={styles.input}
          />
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            value={formData.amount.toString()}
            onChangeText={(val) =>
              handleInputChange("amount", parseFloat(val) || 0)
            }
            style={styles.input}
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

          {type === "expense" && (
            <>
              <TextInput
                placeholder="Merchant"
                value={formData.merchant || ""}
                onChangeText={(val) => handleInputChange("merchant", val)}
                style={styles.input}
              />
              <CategorySelector
                selected={formData.category}
                onChange={(val) => handleInputChange("category", val)}
                isExpanded={showCategoryPicker}
                toggleExpand={() => setShowCategoryPicker((prev: any) => !prev)}
              />
            </>
          )}

          {type === "transfer" && (
            <>
              <TextInput
                placeholder="Sender"
                value={formData.sender || ""}
                onChangeText={(val) => handleInputChange("sender", val)}
                style={styles.input}
              />
              <TextInput
                placeholder="Receiver"
                value={formData.receiver || ""}
                onChangeText={(val) => handleInputChange("receiver", val)}
                style={styles.input}
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
              <Text style={styles.successText}>Transaction Added!</Text>
            </View>
          </Animated.View>
        )}
      </View>
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
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 16,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    fontFamily: "Montserrat",
  },
  saveButton: {
    backgroundColor: colors.primary[400],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  spinnerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[400],
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: colors.backgroundLight,
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    color: colors.text,
    fontSize: 16,
    fontFamily: "Montserrat",
  },

  saveButtonDisabled: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontFamily: "Montserrat",
    fontSize: 16,
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

export default TransactionForm;
