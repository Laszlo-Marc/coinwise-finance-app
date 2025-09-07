// BudgetTransactionsChart.tsx
import { colors } from "@/constants/colors";
import { TransactionModel } from "@/models/transaction";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface BudgetTransactionsChartProps {
  transactions: TransactionModel[];
  showPlaceholder?: boolean;
}

const BudgetTransactionsChart: React.FC<BudgetTransactionsChartProps> = ({
  transactions,
  showPlaceholder = false,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 80; 

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // Group transactions by day and sum amounts
    const dailyTotals = transactions.reduce((acc, transaction) => {
      const dateKey = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }

      // Only count expenses for budget tracking
      if (transaction.type === "expense") {
        acc[dateKey] += transaction.amount;
      }

      return acc;
    }, {} as Record<string, number>);

    // Sort by date and get last 7 days
    const sortedEntries = Object.entries(dailyTotals)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7);

    const labels = sortedEntries.map(([date]) => date);
    const data = sortedEntries.map(([, amount]) => amount);

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [0],
        },
      ],
    };
  }, [transactions]);

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 172, 254, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary[500],
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "rgba(255,255,255,0.1)",
    },
    fillShadowGradient: colors.primary[500],
    fillShadowGradientOpacity: 0.3,
  };

  if (showPlaceholder || !transactions || transactions.length === 0) {
    return (
      <View style={styles.container}>
        <BlurView intensity={15} tint="light" style={styles.glassCard}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Spending Trends
            </Text>
          </View>
          <View style={styles.placeholderContainer}>
            <Feather
              name="bar-chart-2"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.placeholderText, { color: colors.textSecondary }]}
            >
              Chart will appear when you have
            </Text>
            <Text
              style={[styles.placeholderText, { color: colors.textSecondary }]}
            >
              transactions on multiple days
            </Text>
          </View>
        </BlurView>
      </View>
    );
  }

  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const avgDaily = totalSpent / Math.max(chartData.labels.length, 1);

  return (
    <View style={styles.container}>
      <BlurView intensity={15} tint="light" style={styles.glassCard}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Daily Spending
          </Text>
          <View style={styles.statsContainer}>
            <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>
              Avg/day
            </Text>
            <Text style={[styles.avgAmount, { color: colors.primary[500] }]}>
              ${avgDaily.toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero
            withInnerLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            yAxisSuffix=""
            yAxisInterval={1}
            yAxisLabel={""}
          />
        </View>

        <View style={styles.insightContainer}>
          <Feather name="trending-up" size={16} color={colors.primary[500]} />
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {chartData.datasets[0].data.length > 1
              ? `Tracking ${chartData.datasets[0].data.length} days of spending`
              : "Start tracking your daily spending patterns"}
          </Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },
  statsContainer: {
    alignItems: "flex-end",
  },
  avgLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  avgAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  insightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  insightText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default BudgetTransactionsChart;
