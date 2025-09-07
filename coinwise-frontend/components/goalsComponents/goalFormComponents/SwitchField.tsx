import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helperText?: string;
}

export const SwitchField: React.FC<Props> = ({
  label,
  value,
  onChange,
  helperText,
}) => (
  <View style={styles.formGroup}>
    <View style={styles.switchRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.backgroundDark, true: colors.primary[600] }}
        thumbColor={value ? colors.primary[400] : colors.textSecondary}
      />
    </View>
    {helperText && <Text style={styles.helperText}>{helperText}</Text>}
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 24 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 16, color: colors.text },
  helperText: { color: colors.textSecondary, fontSize: 14, marginTop: 8 },
});
