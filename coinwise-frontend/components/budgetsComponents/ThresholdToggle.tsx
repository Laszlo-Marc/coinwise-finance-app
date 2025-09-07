import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  enabled: boolean;
  threshold: number;
  onToggle: (value: boolean) => void;
  onChangeThreshold: (value: number) => void;
};

const ThresholdToggle = ({
  enabled,
  threshold,
  onToggle,
  onChangeThreshold,
}: Props) => {
  return (
    <View style={styles.formGroup}>
      {/* Threshold % Options */}
      {enabled && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{threshold}%</Text>

          <View style={styles.slider}>
            {[70, 80, 90].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[
                  styles.sliderOption,
                  threshold === percent && styles.sliderOptionSelected,
                ]}
                onPress={() => onChangeThreshold(percent)}
              >
                <Text style={styles.sliderOptionText}>{percent}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 16, color: colors.text, marginBottom: 8 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderContainer: {
    alignItems: "center",
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  slider: {
    flexDirection: "row",
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  sliderOption: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  sliderOptionSelected: {
    backgroundColor: colors.primary[500],
  },
  sliderOptionText: {
    color: colors.text,
    fontSize: 14,
  },
});

export default ThresholdToggle;
