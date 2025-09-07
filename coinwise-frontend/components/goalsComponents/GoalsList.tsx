import { GoalModel } from "@/models/goal";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoalsItem from "./GoalsItem";

interface GoalsListProps {
  goals: GoalModel[];
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onSelect: (goal: GoalModel) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 180 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {goals.map((item) => (
        <View key={item.id}>
          <GoalsItem
            goal={item}
            onEdit={() => onEdit(item.id ?? "")}
            onDelete={() => onDelete(item.id ?? "")}
            onPress={() => onSelect(item)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default GoalsList;
