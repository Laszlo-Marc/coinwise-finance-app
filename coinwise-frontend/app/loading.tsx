import { LoadingScreen } from "@/components/mainComponents/LoadingScreen";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

const Loading = () => {
  const router = useRouter();

  const { checkSessionValidity, state: authState } = useAuth();
  const { fetchBudgets, fetchBudgetTransactions } = useBudgets();
  const { fetchGoals, fetchContributions } = useGoals();
  const { fetchTransactions } = useTransactionContext();
  const { refreshStats, refreshBudgetStats, refreshSummary } =
    useStatsContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        router.replace("/auth/sign-in");
        return;
      }

      await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
        fetchGoals(),
        refreshStats("this_month"),
        refreshSummary(),
      ]);

      router.replace("/home");

      setTimeout(() => {
        fetchContributions();
        fetchBudgetTransactions();
        refreshBudgetStats("this_month");
      }, 0);

      setLoading(false);
    };

    bootstrap();
  }, []);

  if (loading) return <LoadingScreen />;

  return null;
};

export default Loading;
