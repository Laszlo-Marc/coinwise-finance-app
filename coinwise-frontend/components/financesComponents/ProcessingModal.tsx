import { colors } from "@/constants/colors";
import { BlurView } from "expo-blur";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

const stages = [
  { key: "anonymizing", label: "Anonymizing sensitive data..." },
  { key: "extracting_sections", label: "Extracting transaction sections..." },
  { key: "normalizing", label: "Normalizing document text..." },
  { key: "extracting_transactions", label: "Extracting transactions..." },
  { key: "done", label: "Finished processing!" },
];

export default function ProcessingModal({
  visible,
  currentStage,
}: {
  visible: boolean;
  currentStage: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Processing Statement</Text>
          {stages.map((stage, index) => (
            <View key={stage.key} style={styles.stage}>
              <Text
                style={[
                  styles.stageText,
                  currentStage === stage.key && styles.active,
                ]}
              >
                {stage.label}
              </Text>
              {currentStage === stage.key && (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              )}
            </View>
          ))}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 16,
    fontWeight: "600",
  },
  stage: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  stageText: {
    color: "#ccc",
    fontSize: 16,
    marginRight: 10,
  },
  active: {
    color: "#fff",
    fontWeight: "bold",
  },
});
