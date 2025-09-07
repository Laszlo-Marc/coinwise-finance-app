import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  budgets: BudgetModel[] | undefined;
  onClose: () => void;
  onReset: (budget: BudgetModel) => void;
  onDelete: (budget: BudgetModel) => void;
  onMakeRecurring: (budget: BudgetModel) => void;
}

const OneTimeBudgetResetModal: React.FC<Props> = ({
  visible,
  budgets,
  onClose,
  onReset,
  onDelete,
  onMakeRecurring,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Expired One-Time Budgets</Text>
          <Text style={styles.subtitle}>
            These budgets have ended. What do you want to do with them?
          </Text>
          <FlatList
            data={budgets}
            keyExtractor={(item, index) => item.id ?? `budget-${index}`}
            renderItem={({ item }) => (
              <View style={styles.budgetItem}>
                <Text style={styles.budgetTitle}>{item.title}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#fbc531" }]}
                    onPress={() => onReset(item)}
                  >
                    <Text style={styles.buttonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#218c74" }]}
                    onPress={() => onMakeRecurring(item)}
                  >
                    <Text style={styles.buttonText}>Make Recurring</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.error }]}
                    onPress={() => onDelete(item)}
                  >
                    <Feather name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  budgetItem: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default OneTimeBudgetResetModal;
