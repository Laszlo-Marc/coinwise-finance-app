// QuickActionsCard.tsx - Redesigned
import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

interface QuickActionsCardProps {
  onAddExpense: () => void;
  onEditBudget: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddExpense,
  onEditBudget,
}) => {
  const handleAddExpense = () => {
    Vibration.vibrate(50);
    onAddExpense();
  };

  const handleEditBudget = () => {
    Vibration.vibrate(50);
    onEditBudget();
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.glassCard}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Quick Actions
          </Text>
          <Feather name="zap" size={18} color={colors.primary[500]} />
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            onPress={handleAddExpense}
            style={[
              styles.primaryAction,
              {
                backgroundColor: colors.primary[500] + "20",
                borderColor: colors.primary[500] + "40",
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                {
                  backgroundColor: colors.primary[500],
                },
              ]}
            >
              <Feather name="plus" size={22} color="white" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text
                style={[styles.actionTitle, { color: colors.primary[500] }]}
              >
                Add Expense
              </Text>
              <Text
                style={[styles.actionSubtitle, { color: colors.primary[400] }]}
              >
                Track new spending
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.primary[500]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEditBudget}
            style={styles.secondaryAction}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Feather name="edit-3" size={20} color={colors.text} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                Edit Budget
              </Text>
              <Text
                style={[styles.actionSubtitle, { color: colors.textSecondary }]}
              >
                Modify settings
              </Text>
            </View>
            <Feather
              name="arrow-right"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  glassCard: {
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },
  actionsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 12,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextContainer: {
    flex: 1,
    fontFamily: "Montserrat",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    fontFamily: "Montserrat",
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
});
export default QuickActionsCard;
