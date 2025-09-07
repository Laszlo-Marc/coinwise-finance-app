import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ContributionHistoryList } from "@/components/goalsComponents/ContributionHistoryList";
import { GoalDetailsCard } from "@/components/goalsComponents/GoalDetailsCard";
import { ProgressCircle } from "@/components/goalsComponents/ProgressCircle";

import { HeaderBar } from "@/components/goalsComponents/HeaderBar";
import { colors } from "@/constants/colors";
import { useGoalDetails } from "@/hooks/goals-hooks/useGoalsDetails";

const GoalDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { goal, contributions, progressAnim, progressPercentage, isLoading } =
    useGoalDetails(String(id));

  const getProgressColor = (percentage: number): string => {
    if (percentage < 30) return colors.error;
    if (percentage < 70) return colors.primary[400];
    return colors.success;
  };

  const handleAddContribution = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (goal?.id) router.push(`./add-contribution/${goal.id}`);
  };

  const handleEditGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (goal?.id) router.push(`../edit-goal/${goal.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Goal not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/financial-goals")}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progressColor = getProgressColor(progressPercentage);

  const isDataCorrupted =
    typeof goal.target_amount !== "number" ||
    typeof goal.current_amount !== "number" ||
    isNaN(goal.target_amount) ||
    isNaN(goal.current_amount);

  if (isDataCorrupted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Goal data is corrupted. Please edit the goal to fix missing or invalid
          values.
        </Text>
        <TouchableOpacity onPress={handleEditGoal}>
          <Text style={styles.retryText}>Edit Goal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerWrapper}
      >
        <HeaderBar
          title={goal.title}
          onBack={() => router.replace("/financial-goals")}
          onEdit={handleEditGoal}
        />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <ProgressCircle
          progressAnim={progressAnim}
          percentage={progressPercentage}
          color={progressColor}
        />

        <GoalDetailsCard goal={goal} />

        <TouchableOpacity
          style={styles.addContributionButton}
          onPress={handleAddContribution}
        >
          <Feather name="plus" size={20} color={colors.text} />
          <Text style={styles.addContributionText}>Add Contribution</Text>
        </TouchableOpacity>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Contribution History</Text>
          {contributions.length === 0 ? (
            <>
              <Text style={styles.emptyText}>No contributions yet.</Text>
              <TouchableOpacity onPress={handleAddContribution}>
                <Text style={styles.retryText}>Add one now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ContributionHistoryList contributions={contributions} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    paddingBottom: 16,
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    color: colors.primary[400],
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  addContributionButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  addContributionText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});

export default GoalDetailsScreen;
