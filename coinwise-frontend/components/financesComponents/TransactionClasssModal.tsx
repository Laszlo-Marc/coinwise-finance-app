import { colors } from "@/constants/colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: "expense" | "income" | "transfer" | "deposit") => void;
};

const TransactionClassModal = ({ visible, onClose, onSelect }: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>Select Transaction Type</Text>

          {["expense", "income", "transfer", "deposit"].map((type) => (
            <TouchableOpacity
              key={type}
              style={modalStyles.optionButton}
              onPress={() => {
                onSelect(type as "expense" | "income" | "transfer" | "deposit");
              
                onClose();
              }}
            >
              <Text style={modalStyles.optionText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={onClose} style={modalStyles.cancelButton}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
    fontFamily: "Montserrat",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default TransactionClassModal;
