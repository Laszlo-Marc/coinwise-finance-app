import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

type Props = {
  chartType: "line" | "bar";
  onChartTypeChange: (type: "line" | "bar") => void;
  chartData: {
    labels: string[];
    datasets: {
      data: number[];
      color: () => string;
      strokeWidth: number;
    }[];
  };
  total: number;
  change: number;
  width: number;
};

export const StatsChartCard: React.FC<Props> = ({
  chartType,
  onChartTypeChange,
  chartData,
  total,
  change,
  width,
}) => {
  const chartConfig = {
    backgroundGradientFrom: colors.backgroundLight,
    backgroundGradientTo: colors.backgroundLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: colors.primary[500],
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: `${colors.backgroundDark}80`,
    },
  };
  const barWidthPerItem = 60;
  const minWidth = width;
  const computedWidth = Math.max(
    minWidth,
    chartData.labels.length * barWidthPerItem
  );
  if (chartData.labels.length === 1) {
    chartData.labels.push("");
    chartData.datasets[0].data.push(0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Total</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              chartType === "line" && styles.activeToggle,
            ]}
            onPress={() => onChartTypeChange("line")}
          >
            <Feather name="trending-up" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              chartType === "bar" && styles.activeToggle,
            ]}
            onPress={() => onChartTypeChange("bar")}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color:
                  chartType === "bar"
                    ? colors.primary[500]
                    : colors.textSecondary,
              }}
            >
              ≡
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>
          {new Intl.NumberFormat("ro-RO").format(total)} RON{" "}
        </Text>
        {change !== 0 && (
          <View
            style={[
              styles.changeBadge,
              {
                backgroundColor:
                  change > 0 ? "rgba(16,185,129,0.2)" : "rgba(220,38,38,0.2)",
              },
            ]}
          >
            <Text
              style={[
                styles.changeText,
                { color: change > 0 ? colors.success : colors.error },
              ]}
            >
              {change > 0 ? "+" : ""}
              {change.toFixed(2)}% vs last
            </Text>
          </View>
        )}
      </View>

      {chartType === "line" ? (
        <LineChart
          data={chartData}
          width={width}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <ScrollView horizontal contentContainerStyle={{ paddingRight: 16 }}>
          <BarChart
            data={chartData}
            width={computedWidth}
            height={220}
            chartConfig={chartConfig}
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: colors.backgroundLight,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  totalText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginRight: 12,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
  },
});
