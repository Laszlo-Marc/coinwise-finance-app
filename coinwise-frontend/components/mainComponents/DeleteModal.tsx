import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
interface DeleteConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoadingDelete: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  isLoadingDelete = false,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
              disabled={isLoadingDelete}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.button,
                styles.deleteButton,
                isLoadingDelete && { opacity: 0.7 },
              ]}
              disabled={isLoadingDelete}
            >
              <Text style={styles.deleteText}>
                {isLoadingDelete ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: 300,
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Montserrat",
    color: colors.text,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Montserrat",
    color: colors.textMuted,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    margin: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: colors.primary[500],
  },
  cancelText: {
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: colors.primary[700],
  },
  deleteText: {
    color: colors.textMuted,
  },
});

export default DeleteConfirmModal;
