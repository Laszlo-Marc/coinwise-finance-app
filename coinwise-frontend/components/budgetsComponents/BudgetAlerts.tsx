import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BudgetThresholdBannerProps {
  titles: string[];
  visible: boolean;
  onClose: () => void;
}

export const BudgetThresholdBanner: React.FC<BudgetThresholdBannerProps> = ({
  titles,
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <BlurView intensity={50} tint="dark" style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>⚠️ Budgets Alert</Text>
          <Text style={styles.message}>
            You've exceeded the set thresholds on:
          </Text>
          <Text style={styles.list}>
            {titles.map((title) => `• ${title}`).join("\n")}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
            <Feather name="x" size={20} color="#fff" />
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.backgroundLight,
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 32,
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.error,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  list: {
    fontSize: 14,
    color: colors.text,
    textAlign: "left",
    alignSelf: "stretch",
    marginBottom: 16,
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dismissText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
