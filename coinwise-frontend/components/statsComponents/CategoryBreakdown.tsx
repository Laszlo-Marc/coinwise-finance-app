import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

type PieCategory = {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
  percentage: number;
};

type Props = {
  pieData: PieCategory[];
  chartWidth: number;
};

export const CategoryBreakdown: React.FC<Props> = ({ pieData, chartWidth }) => {
  if (!pieData.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Category Breakdown</Text>

      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={180}
          chartConfig={{
            backgroundGradientFrom: "#00000000",
            backgroundGradientTo: "#00000000",
            color: () => colors.primary[500],
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
        />
      </View>

      <View style={styles.breakdownList}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.labelRow}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.labelText}>{item.name}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amount}>{item.amount.toFixed(0)} RON</Text>
              <Text style={styles.percent}>{item.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  breakdownList: {
    marginTop: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}80`,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "60%",
    flexShrink: 1,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  labelText: {
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
    overflow: "hidden",
  },
  amountRow: {
    alignItems: "flex-end",
  },
  amount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  percent: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
