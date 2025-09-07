import { categories } from "@/constants/categories";
import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

const CategoryDropdown = ({ selectedCategory, onSelectCategory }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.formGroup}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView style={{ maxHeight: 200 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.dropdownItem,
                  selectedCategory === category && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onSelectCategory(category);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCategory === category &&
                      styles.dropdownItemTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 16, color: colors.text, marginBottom: 8 },
  dropdownButton: {
    backgroundColor: colors.backgroundLight,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: { color: colors.text, fontSize: 16 },
  dropdownMenu: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary[900],
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: colors.primary[400],
    fontWeight: "600",
  },
});

export default CategoryDropdown;
