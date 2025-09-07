import { categories } from "@/constants/categories";
import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  selected: string;
  onChange: (category: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export const CategorySelector: React.FC<Props> = ({
  selected,
  onChange,
  isExpanded,
  toggleExpand,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Category</Text>
    <TouchableOpacity style={styles.selectButton} onPress={toggleExpand}>
      <Text style={styles.selectText}>{selected}</Text>
      <Feather
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>

    {isExpanded && (
      <View style={styles.picker}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.option, selected === cat && styles.optionSelected]}
            onPress={() => {
              onChange(cat);
              toggleExpand();
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.optionText,
                selected === cat && styles.optionTextSelected,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, color: colors.text, marginBottom: 8 },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: { color: colors.text, fontSize: 16 },
  picker: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: colors.secondary[800],
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  optionTextSelected: {
    color: colors.primary[300],
    fontWeight: "600",
  },
});
