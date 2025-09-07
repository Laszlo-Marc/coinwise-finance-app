import { API_BASE_URL } from "@/constants/api";
import {
  BudgetStats,
  DepositStats,
  ExpenseStats,
  GoalStats,
  HistoricalSummary,
  IncomeStats,
  MonthlySummary,
  StatsOverview,
  TransferStats,
} from "@/models/stats";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useState } from "react";

const STATS_API_URL = `${API_BASE_URL}/stats`;

export type StatsRange =
  | "week"
  | "this_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year";
type StatsByRange<T> = { [key in StatsRange]?: T };

interface StatsContextType {
  statsOverview: StatsByRange<StatsOverview>;
  expenseStats: StatsByRange<ExpenseStats>;
  incomeStats: StatsByRange<IncomeStats>;
  transferStats: StatsByRange<TransferStats>;
  depositStats: StatsByRange<DepositStats>;
  budgetStats: StatsByRange<BudgetStats>;
  goalStats: StatsByRange<GoalStats>;
  historicalSummary: HistoricalSummary | null;
  monthlySummary: MonthlySummary | null;
  loading: boolean;
  error: string | null;
  refreshStats: (range: StatsRange) => Promise<void>;
  refreshBudgetStats: (range: StatsRange) => Promise<void>;
  refreshSummary: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [statsOverview, setStatsOverview] = useState<
    StatsByRange<StatsOverview>
  >({});
  const [expenseStats, setExpenseStats] = useState<StatsByRange<ExpenseStats>>(
    {}
  );
  const [incomeStats, setIncomeStats] = useState<StatsByRange<IncomeStats>>({});
  const [transferStats, setTransferStats] = useState<
    StatsByRange<TransferStats>
  >({});
  const [depositStats, setDepositStats] = useState<StatsByRange<DepositStats>>(
    {}
  );
  const [budgetStats, setBudgetStats] = useState<StatsByRange<BudgetStats>>({});
  const [goalStats, setGoalStats] = useState<StatsByRange<GoalStats>>({});
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(
    null
  );
  const [historicalSummary, setHistoricalSummary] =
    useState<HistoricalSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getGranularity = (range: StatsRange) =>
    range === "this_month" || range === "week" ? "daily" : "monthly";

  const refreshStats = async (range: StatsRange = "this_month") => {
    setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const granularity = getGranularity(range);
      const queryParam = `?range=${range}&granularity=${granularity}`;

      const [
        overviewRes,
        expensesRes,
        incomeRes,
        transferRes,
        depositRes,
        goalRes,
      ] = await Promise.all([
        axios.get<StatsOverview>(`${STATS_API_URL}/overview${queryParam}`, {
          headers,
        }),
        axios.get<ExpenseStats>(`${STATS_API_URL}/expenses/full${queryParam}`, {
          headers,
        }),
        axios.get<IncomeStats>(`${STATS_API_URL}/income/full${queryParam}`, {
          headers,
        }),
        axios.get<TransferStats>(
          `${STATS_API_URL}/transfers/full${queryParam}`,
          { headers }
        ),
        axios.get<DepositStats>(`${STATS_API_URL}/deposits/full${queryParam}`, {
          headers,
        }),
        axios.get<GoalStats>(`${STATS_API_URL}/goals`, { headers }),
      ]);
      setStatsOverview((prev) => ({ ...prev, [range]: overviewRes.data }));
      setExpenseStats((prev) => ({ ...prev, [range]: expensesRes.data }));
      setIncomeStats((prev) => ({ ...prev, [range]: incomeRes.data }));
      setTransferStats((prev) => ({ ...prev, [range]: transferRes.data }));
      setDepositStats((prev) => ({ ...prev, [range]: depositRes.data }));
      setGoalStats((prev) => ({ ...prev, [range]: goalRes.data }));

      if (range === "this_month") {
        const [monthlySummaryRes, historicalSummaryRes] = await Promise.all([
          axios.get<MonthlySummary>(`${STATS_API_URL}/summary/month`, {
            headers,
          }),
          axios.get<HistoricalSummary>(`${STATS_API_URL}/summary/history`, {
            headers,
          }),
        ]);
        setMonthlySummary(monthlySummaryRes.data);
        setHistoricalSummary(historicalSummaryRes.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err.message || "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };
  const refreshBudgetStats = async (range: StatsRange = "this_month") => {
    setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const granularity = getGranularity(range);
      const queryParam = `?range=${range}&granularity=${granularity}`;

      const [budgetRes] = await Promise.all([
        axios.get<BudgetStats>(`${STATS_API_URL}/budgets${queryParam}`, {
          headers,
        }),
      ]);

      setBudgetStats((prev) => ({ ...prev, [range]: budgetRes.data }));
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err.message || "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };
  const refreshSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("auth_token");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [monthlySummaryRes, historicalSummaryRes] = await Promise.all([
        axios.get<MonthlySummary>(`${STATS_API_URL}/summary/month`, {
          headers,
        }),
        axios.get<HistoricalSummary>(`${STATS_API_URL}/summary/history`, {
          headers,
        }),
      ]);
      setMonthlySummary(monthlySummaryRes.data);
      setHistoricalSummary(historicalSummaryRes.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err.message || "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StatsContext.Provider
      value={{
        statsOverview,
        expenseStats,
        incomeStats,
        transferStats,
        depositStats,
        budgetStats,
        goalStats,
        historicalSummary,
        monthlySummary,
        loading,
        error,
        refreshStats,
        refreshBudgetStats,
        refreshSummary,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStatsContext must be used within a StatsProvider");
  }
  return context;
};
