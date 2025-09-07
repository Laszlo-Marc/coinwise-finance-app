import { colors } from "@/constants/colors";
import { ExpenseStats, IncomeStats, StatsOverview } from "@/models/stats";
import { useMemo } from "react";

const formatPeriodLabel = (period: string): string => {
  if (period.length === 10) {
    const date = new Date(period);
    if (isNaN(date.getTime())) return "Invalid";
    return `${date.getDate()} ${date.toLocaleDateString("en-US", {
      month: "short",
    })}`;
  } else if (period.length === 7) {
    const date = new Date(period + "-01");
    if (isNaN(date.getTime())) return "Invalid";
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  return period;
};

export const useTransformedStats = ({
  activeTab,
  expenseStats,
  incomeStats,
  statsOverview,
  cashFlowData,
}: {
  activeTab: "spending" | "income" | "savings";
  expenseStats: ExpenseStats | undefined;
  incomeStats: IncomeStats | undefined;
  statsOverview: StatsOverview | undefined;
  cashFlowData: { period: string; net_flow: number }[];
}) => {
  const trendData = useMemo(() => {
    if (activeTab === "spending") return expenseStats?.trend || [];
    if (activeTab === "income") return incomeStats?.trend || [];
    if (activeTab === "savings" && incomeStats && expenseStats) {
      const incomeMap = new Map(
        incomeStats.trend.map((i) => [i.period, i.amount])
      );
      const expenseMap = new Map(
        expenseStats.trend.map((e) => [e.period, e.amount])
      );

      const allPeriods = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
      return Array.from(allPeriods).map((period) => ({
        period,
        amount: (incomeMap.get(period) || 0) - (expenseMap.get(period) || 0),
        count: 0,
      }));
    }
    return [];
  }, [activeTab, expenseStats, incomeStats, cashFlowData]);

  const chartData = useMemo(() => {
    if (!trendData.length) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [0],
            color: () => colors.primary[400],
            strokeWidth: 2,
          },
        ],
      };
    }
    const labelStep = trendData.length > 7 ? 2 : 1;
    return {
      labels: trendData.map((item, index) =>
        index % labelStep === 0 ? formatPeriodLabel(item.period) : ""
      ),

      datasets: [
        {
          data: trendData.map((item) => Math.abs(item.amount)),
          color: () => colors.primary[400],
          strokeWidth: 2,
        },
      ],
    };
  }, [trendData]);

  const currentStats = useMemo(() => {
    if (!statsOverview) return { total: 0, change: 0 };

    switch (activeTab) {
      case "spending":
        return { total: statsOverview.totalExpenses, change: 0 };
      case "income":
        return { total: statsOverview.totalIncome, change: 0 };
      case "savings":
        return { total: statsOverview.balance, change: 0 };
      default:
        return { total: 0, change: 0 };
    }
  }, [statsOverview, activeTab]);

  const pieData = useMemo(() => {
    const palette = [
      colors.primary[300],
      colors.secondary[300],
      "#E1B733",
      "#336060",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
    ];

    return (
      expenseStats?.topCategories?.slice(0, 8).map((category, index) => ({
        name: category.category,
        amount: category.totalSpent,
        color: palette[index % palette.length],
        legendFontColor: colors.text,
        legendFontSize: 12,
        percentage: Math.round(category.percentageOfTotal),
      })) || []
    );
  }, [expenseStats]);

  return {
    chartData,
    pieData,
    currentStats,
  };
};
