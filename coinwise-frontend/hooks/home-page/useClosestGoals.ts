import { GoalModel } from "@/models/goal";
import { useMemo } from "react";

export const useClosestGoals = (goals: GoalModel[]) => {
  return useMemo(() => {
    return goals
      .filter((goal: GoalModel) => goal.current_amount < goal.target_amount)
      .sort((a: GoalModel, b: GoalModel) => {
        const progressA = (a.current_amount / a.target_amount) * 100;
        const progressB = (b.current_amount / b.target_amount) * 100;
        return progressB - progressA;
      })
      .slice(0, 3);
  }, [goals]);
};
