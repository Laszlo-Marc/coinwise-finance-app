import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RecurringFrequencySelectorProps = {
  frequency: string;
  onChange: (newFrequency: string) => void;
};

const RecurringFrequencySelector: React.FC<RecurringFrequencySelectorProps> = ({
  frequency,
  onChange,
}) => {
  const cycleFrequency = () => {
    const frequencies = ["monthly", "weekly", "daily"];
    const currentIndex = frequencies.indexOf(frequency);
    const nextIndex = (currentIndex + 1) % frequencies.length;
    const next = frequencies[nextIndex];
    onChange(next);
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Frequency</Text>
      <TouchableOpacity style={styles.selectButton} onPress={cycleFrequency}>
        <Text style={styles.selectText}>
          {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        </Text>
        <Feather name="repeat" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Tap to cycle through: Monthly → Weekly → Daily
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});

export default RecurringFrequencySelector;
