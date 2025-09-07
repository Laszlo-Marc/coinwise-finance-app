import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BudgetDetailsHeaderProps {
  budget: BudgetModel;
}

const BudgetDetailsHeader: React.FC<BudgetDetailsHeaderProps> = ({
  budget,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const getCategoryIcon = (
    category: string
  ): React.ComponentProps<typeof Feather>["name"] => {
    const iconMap: Record<
      string,
      React.ComponentProps<typeof Feather>["name"]
    > = {
      Food: "coffee",
      Transport: "truck",
      Entertainment: "music",
      Groceries: "shopping-cart",
      Health: "heart",
      Education: "book",
      Bills: "file-text",
      Travel: "map-pin",
      Other: "more-horizontal",
    };
    return iconMap[category] || "folder";
  };

  return (
    <LinearGradient
      colors={[colors.primary[400], colors.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 16 }]}
    >
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <BlurView intensity={20} tint="light" style={styles.navButtonBlur}>
            <Feather name="arrow-left" size={20} color="white" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Budget Details</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.navButton}
        >
          <BlurView intensity={20} tint="light" style={styles.navButtonBlur}>
            <Feather name="user" size={20} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Budget Info */}
      <View style={styles.budgetInfo}>
        <View style={styles.budgetTitleRow}>
          <View style={styles.categoryIcon}>
            <Feather
              name={getCategoryIcon(budget.category)}
              size={24}
              color="white"
            />
          </View>
          <View style={styles.budgetTitleContainer}>
            <Text style={styles.budgetTitle}>{budget.title}</Text>
            <View style={styles.budgetMeta}>
              <Text style={styles.budgetCategory}>{budget.category}</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.budgetType}>
                {budget.is_recurring ? "Recurring" : "One-time"}
              </Text>
            </View>
          </View>
        </View>

        {budget.description && (
          <Text style={styles.budgetDescription}>{budget.description}</Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  navButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  navButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  navCenter: {
    flex: 1,
    alignItems: "center",
  },
  navTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Montserrat",
  },
  budgetInfo: {
    zIndex: 2,
  },
  budgetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  budgetTitleContainer: {
    flex: 1,
  },
  budgetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    fontFamily: "Montserrat",
    marginBottom: 4,
  },
  budgetMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 8,
  },
  budgetType: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  budgetDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    fontWeight: "400",
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingCircle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
  },
  circle1: {
    width: 80,
    height: 80,
    top: "20%",
    right: -20,
  },
  circle2: {
    width: 120,
    height: 120,
    top: "60%",
    left: -40,
  },
  circle3: {
    width: 60,
    height: 60,
    top: "10%",
    left: "30%",
  },
});

export default BudgetDetailsHeader;
