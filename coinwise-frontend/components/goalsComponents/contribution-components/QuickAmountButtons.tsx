import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onSelect: (amount: number) => void;
}

const quickAmounts = [50, 100, 200, 500, 1000, 5000];

export const QuickAmountButtons = ({ onSelect }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>Quick Add:</Text>
    <View style={styles.buttons}>
      {quickAmounts.map((amt) => (
        <TouchableOpacity
          key={amt}
          style={styles.button}
          onPress={() => {
            onSelect(amt);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.text}>{amt} RON</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    width: "30%",
    marginBottom: 12,
  },
  text: { color: colors.text, fontSize: 16 },
});
