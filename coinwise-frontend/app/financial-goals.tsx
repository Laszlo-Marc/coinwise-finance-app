import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GoalsList from "@/components/goalsComponents/GoalsList";
import GoalsSummaryCards from "@/components/goalsComponents/GoalSummaryCards";
import AnimatedCard from "@/components/homePageComponents/AnimatedCard";
import AnimatedHeader from "@/components/mainComponents/AnimatedHeader";
import BottomBar from "@/components/mainComponents/BottomBar";
import DeleteConfirmModal from "@/components/mainComponents/DeleteModal";
import { useFinancialGoalsScreen } from "@/hooks/goals-hooks/useGoalsScreen";

const FinancialGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    goals,
    totalGoals,
    totalSaved,
    averageCompletionRate,
    modalVisible,
    handleAddGoal,
    handleDeleteGoal,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleSelectGoal,
    selectedGoalId,
    fabAnimation,
    headerAnimation,
    animateFAB,
    isLoadingDelete,
  } = useFinancialGoalsScreen();

  return (
    <View style={styles.container}>
      <AnimatedHeader
        title="GOALS"
        subtitle={`${goals.length} ${
          goals.length === 1 ? "goal" : "goals"
        } active`}
        animatedValue={headerAnimation}
        leftIcon={
          <TouchableOpacity onPress={() => router.replace("/transactions")}>
            <Ionicons name="wallet-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
        onProfilePress={() => router.push("/profile")}
        gradientColors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
      />

      <AnimatedCard delay={150}>
        <GoalsSummaryCards
          totalGoals={totalGoals}
          totalSaved={totalSaved}
          averageCompletionRate={averageCompletionRate}
        />
      </AnimatedCard>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedCard delay={200}>
          <GoalsList
            goals={goals}
            onEdit={(id) => router.push(`./goals/edit-goal/${id}`)}
            onDelete={handleDeleteGoal}
            onSelect={handleSelectGoal}
          />
        </AnimatedCard>
      </ScrollView>

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabAnimation }],
            bottom: insets.bottom + 100,
            opacity: fabAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddGoal}
          onPressIn={() => animateFAB(0.9)}
          onPressOut={() => animateFAB(1)}
          activeOpacity={0.9}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <BottomBar />

      <DeleteConfirmModal
        visible={modalVisible}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoadingDelete={isLoadingDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default FinancialGoalsScreen;
