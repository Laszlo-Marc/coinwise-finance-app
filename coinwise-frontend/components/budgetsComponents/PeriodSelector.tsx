// components/budgets/PeriodSelector.tsx

import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  period: "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  onChangePeriod: (period: "weekly" | "monthly" | "custom") => void;
  onChangeStartDate: (date: Date) => void;
  onChangeEndDate: (date: Date) => void;
};

const PeriodSelector = ({
  period,
  startDate,
  endDate,
  showStartDatePicker,
  showEndDatePicker,
  onChangePeriod,
  onChangeStartDate,
  onChangeEndDate,
}: Props) => {
  return (
    <View style={styles.formGroup}>
      {/* Period Options */}
      <View style={styles.periodSelectorContainer}>
        {["weekly", "monthly", "custom"].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodOption,
              period === p && styles.periodOptionSelected,
            ]}
            onPress={() => onChangePeriod(p as "weekly" | "monthly" | "custom")}
          >
            <Text
              style={[
                styles.periodOptionText,
                period === p && styles.periodOptionTextSelected,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Pickers */}
      {(period === "weekly" || period === "monthly" || period === "custom") && (
        <View style={styles.datePickerContainer}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => onChangePeriod("custom")}
            >
              <Text style={styles.dateInputText}>
                {startDate.toLocaleDateString()}
              </Text>
              <Feather name="calendar" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => onChangePeriod("custom")}
            >
              <Text style={styles.dateInputText}>
                {endDate.toLocaleDateString()}
              </Text>
              <Feather name="calendar" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* External modals for DatePickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) onChangeStartDate(selectedDate);
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={startDate}
              onChange={(event, selectedDate) => {
                if (selectedDate) onChangeEndDate(selectedDate);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 16, color: colors.text, marginBottom: 8 },
  periodSelectorContainer: {
    flexDirection: "row",
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  periodOptionSelected: {
    backgroundColor: colors.primary[500],
  },
  periodOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  periodOptionTextSelected: {
    fontWeight: "600",
  },
  datePickerContainer: { marginTop: 12 },
  dateInputGroup: { marginBottom: 12 },
  dateLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  dateInput: {
    backgroundColor: colors.backgroundDark,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    color: colors.text,
    fontSize: 16,
  },
});

export default PeriodSelector;
