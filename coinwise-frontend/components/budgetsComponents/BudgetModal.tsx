// components/budgets/BudgetModal.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CategoryDropdown from "./BudgetCategoryDropdown";
import PeriodSelector from "./PeriodSelector";
import ThresholdToggle from "./ThresholdToggle";

type Props = {
  visible: boolean;
  isEditMode: boolean;
  budgetName: string;
  budgetAmount: string;
  budgetCategory: string;
  budgetPeriod: "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  showNotificationThreshold: boolean;
  notificationThreshold: number;
  showSubBudgets: boolean;
  modalAnimation: Animated.Value;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeName: (text: string) => void;
  onChangeAmount: (text: string) => void;
  onChangeCategory: (category: string) => void;
  onChangePeriod: (period: "weekly" | "monthly" | "custom") => void;
  onChangeStartDate: (date: Date) => void;
  onChangeEndDate: (date: Date) => void;
  onToggleNotification: (value: boolean) => void;
  onChangeThreshold: (value: number) => void;
  onToggleRecuringBudget: (value: boolean) => void;
  showRecuringBudget: boolean;
  reccuringFrequency: "daily" | "weekly" | "monthly";
  onChangeReccuringFrequency: (freq: "daily" | "weekly" | "monthly") => void;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BudgetModal = ({
  visible,
  isEditMode,
  budgetName,
  budgetAmount,
  budgetCategory,
  budgetPeriod,
  startDate,
  endDate,
  showNotificationThreshold,
  notificationThreshold,
  modalAnimation,
  showStartDatePicker,
  showEndDatePicker,
  onClose,
  onSave,
  onChangeName,
  onChangeAmount,
  onChangeCategory,
  onChangePeriod,
  onChangeStartDate,
  onChangeEndDate,
  onToggleNotification,
  onChangeThreshold,
  onToggleRecuringBudget,
  showRecuringBudget,
  reccuringFrequency,
  onChangeReccuringFrequency,
}: Props) => {
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const isFormValid = () => {
    return (
      budgetName.trim() !== "" &&
      budgetAmount.trim() !== "" &&
      parseFloat(budgetAmount) > 0 &&
      budgetCategory !== ""
    );
  };

  const formatAmountInput = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmountInput(text);
    onChangeAmount(formatted);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: opacityAnimation,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnimation },
                { translateY: slideAnimation },
              ],
              opacity: opacityAnimation,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Feather
                  name={isEditMode ? "edit-2" : "plus"}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? "Edit Budget" : "Create Budget"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditMode
                    ? "Update your budget details"
                    : "Set up a new budget to track your spending"}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Budget Name */}
            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="tag"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={budgetName}
                    onChangeText={onChangeName}
                    placeholder="e.g., Groceries, Entertainment"
                    placeholderTextColor={colors.textSecondary}
                    maxLength={50}
                  />
                </View>
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <CategoryDropdown
                  selectedCategory={budgetCategory}
                  onSelectCategory={onChangeCategory}
                />
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount </Text>
                <View style={styles.currencyInputContainer}>
                  <View style={styles.currencySymbolContainer}>
                    <Text style={styles.currencySymbol}>RON</Text>
                  </View>
                  <TextInput
                    style={styles.currencyInput}
                    value={budgetAmount}
                    onChangeText={handleAmountChange}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                {budgetAmount && parseFloat(budgetAmount) > 0 && (
                  <Text style={styles.amountHelper}>
                    You're budgeting RON{budgetAmount} for this period
                  </Text>
                )}
              </View>
            </View>

            {/* Period Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Budget Period</Text>
              <PeriodSelector
                period={budgetPeriod}
                startDate={startDate}
                endDate={endDate}
                showStartDatePicker={showStartDatePicker}
                showEndDatePicker={showEndDatePicker}
                onChangePeriod={onChangePeriod}
                onChangeStartDate={onChangeStartDate}
                onChangeEndDate={onChangeEndDate}
              />
            </View>

            {/* Notifications Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <ThresholdToggle
                enabled={showNotificationThreshold}
                threshold={notificationThreshold}
                onToggle={onToggleNotification}
                onChangeThreshold={onChangeThreshold}
              />
            </View>

            {/* Recurring Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Recurring</Text>

              {/* Toggle Switch */}
              <View style={styles.toggleRow}>
                <Text style={styles.formLabel}>Enable Recurring Budget</Text>
                <Switch
                  value={showRecuringBudget}
                  onValueChange={onToggleRecuringBudget}
                  thumbColor={showRecuringBudget ? colors.primary[500] : "#ccc"}
                  trackColor={{ false: "#ccc", true: colors.primary[300] }}
                />
              </View>

              {/* Frequency Selector */}
              {showRecuringBudget && (
                <View style={styles.frequencyContainer}>
                  {["daily", "weekly", "monthly"].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        reccuringFrequency === freq &&
                          styles.frequencyButtonActive,
                      ]}
                      onPress={() =>
                        onChangeReccuringFrequency(
                          freq as "daily" | "weekly" | "monthly"
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          reccuringFrequency === freq &&
                            styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isFormValid() && styles.saveButtonDisabled,
                ]}
                onPress={onSave}
                disabled={!isFormValid()}
                activeOpacity={0.8}
              >
                <Feather
                  name={isEditMode ? "check" : "plus"}
                  size={18}
                  color="#FFFFFF"
                  style={styles.saveButtonIcon}
                />
                <Text style={styles.saveButtonText}>
                  {isEditMode ? "Update Budget" : "Create Budget"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark + "40",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark + "60",
    alignItems: "center",
  },

  frequencyButtonActive: {
    backgroundColor: colors.primary[500] + "40",
  },

  frequencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  frequencyButtonTextActive: {
    color: colors.primary[500],
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark + "60",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
    paddingLeft: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundDark + "60",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: "500",
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundDark + "60",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  currencySymbolContainer: {
    backgroundColor: colors.primary[500] + "20",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  currencySymbol: {
    color: colors.primary[500],
    fontSize: 18,
    fontWeight: "700",
  },
  currencyInput: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: "600",
  },
  amountHelper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    paddingLeft: 4,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundDark + "80",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default BudgetModal;
