import { colors } from "@/constants/colors";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (range: string) => void;
  selectedRange: string;
  options: { label: string; value: string }[];
};

const TimeRangeSelectorModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
  selectedRange,
  options,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Select Time Range</Text>

          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[
                styles.option,
                selectedRange === option.value && styles.selected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedRange === option.value && styles.selectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 2,
  },
  selected: {
    backgroundColor: `${colors.primary[500]}20`,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  selectedText: {
    color: colors.primary[500],
    fontWeight: "600",
  },
});

export default TimeRangeSelectorModal;
