import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  label: string;
  date: string;
  onChange: (date: string) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  minDate?: Date;
  error?: string;
}

export const DatePickerField: React.FC<Props> = ({
  label,
  date,
  onChange,
  showPicker,
  setShowPicker,
  minDate,
  error,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
      <Text style={styles.text}>{new Date(date).toLocaleDateString()}</Text>
      <Feather name="calendar" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
    {showPicker && (
      <DateTimePicker
        value={new Date(date)}
        mode="date"
        display="default"
        onChange={(_, selected) => {
          setShowPicker(false);
          if (selected) onChange(selected.toISOString());
        }}
        minimumDate={minDate}
      />
    )}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: { color: colors.text, fontSize: 16 },
  errorText: { color: colors.error, fontSize: 13, marginTop: 4 },
});
