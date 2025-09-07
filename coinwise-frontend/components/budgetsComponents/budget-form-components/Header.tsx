import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AddBudgetHeaderProps = {
  onCancel: () => void;
  onSave: () => void;
  disabled: boolean;
};

const AddBudgetHeader: React.FC<AddBudgetHeaderProps> = ({
  onCancel,
  onSave,
  disabled,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 10 }]}
    >
      <TouchableOpacity style={styles.backButton} onPress={onCancel}>
        <Feather name="x" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Create a new budget</Text>

      <TouchableOpacity
        style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={disabled}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  },
});

export default AddBudgetHeader;
