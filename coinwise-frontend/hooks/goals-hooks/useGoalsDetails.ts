import { useGoals } from "@/contexts/GoalsContext";
import { calculatePercentage } from "@/hooks/goals-helpers";
import { GoalModel } from "@/models/goal";
import { ContributionModel } from "@/models/goal-contribution";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Animated } from "react-native";

export const useGoalDetails = (goalId: string) => {
  const { goals, contributions } = useGoals();
  const [goal, setGoal] = useState<GoalModel | null>(null);
  const [correspondingContributions, setCorrespondingContributions] = useState<
    ContributionModel[]
  >([]);
  const [progressAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const foundGoal = goals.find((g) => g.id === goalId) ?? null;
      setGoal(foundGoal);
      console.log("Found goal:", foundGoal);
      const filteredContributions = contributions.filter(
        (c) => c.goal_id === String(goalId)
      );
      setCorrespondingContributions(filteredContributions);

      if (foundGoal) {
        const progressPercentage = calculatePercentage(
          foundGoal.current_amount,
          foundGoal.target_amount
        );
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
          toValue: progressPercentage / 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
      setIsLoading(false);
    }, [goalId, goals, contributions])
  );

  const progressPercentage = goal
    ? calculatePercentage(goal.current_amount, goal.target_amount)
    : 0;

  return {
    goal,
    contributions: correspondingContributions,
    progressAnim,
    progressPercentage,
    isLoading,
  };
};
