import { StatsRange, useStatsContext } from "@/contexts/StatsContext";
import React, { useEffect } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomBar from "@/components/mainComponents/BottomBar";
import { CategoryBreakdown } from "@/components/statsComponents/CategoryBreakdown";
import { SavingsSummary } from "@/components/statsComponents/SavingsSummary";
import { StatsChartCard } from "@/components/statsComponents/StatsChartCard";
import { StatsHeader } from "@/components/statsComponents/StatsHeader";
import TimeRangeSelectorModal from "@/components/statsComponents/TimeRangeSelectorModal";
import { TopExpenses } from "@/components/statsComponents/TopExpenses";
import { TransferOverview } from "@/components/statsComponents/TransferOverview";
import { colors } from "@/constants/colors";
import { useStatsRange } from "@/hooks/stats-hooks/useStatsRange";
import { useStatsTabs } from "@/hooks/stats-hooks/useStatsTab";
import { useTransformedStats } from "@/hooks/stats-hooks/useTransformedStats";
import { Entypo, Feather } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width * 0.9;

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();

  const {
    statsOverview,
    expenseStats,
    incomeStats,
    transferStats,
    loading,
    error,
    refreshStats,
  } = useStatsContext();

  const { activeTab, setActiveTab, chartType, setChartType } = useStatsTabs();
  const {
    selectedRange,
    setSelectedRange,
    modalVisible,
    setModalVisible,
    ranges,
    label: rangeLabel,
  } = useStatsRange();
  const currentStatsOverview = statsOverview[selectedRange];
  const currentExpenseStats = expenseStats[selectedRange];
  const currentIncomeStats = incomeStats[selectedRange];
  const currentTransferStats = transferStats[selectedRange];
  const [refreshing, setRefreshing] = React.useState(false);
  const cashFlowData = React.useMemo(() => {
    const incomeTrend = currentIncomeStats?.trend || [];
    const expenseTrend = currentExpenseStats?.trend || [];

    const incomeMap = new Map(incomeTrend.map((i) => [i.period, i.amount]));
    const expenseMap = new Map(expenseTrend.map((e) => [e.period, e.amount]));

    const allPeriods = Array.from(
      new Set([...incomeMap.keys(), ...expenseMap.keys()])
    ).sort();

    return allPeriods.map((period) => ({
      period,
      net_flow: (incomeMap.get(period) || 0) - (expenseMap.get(period) || 0),
    }));
  }, [currentIncomeStats, currentExpenseStats]);

  const { chartData, pieData, currentStats } = useTransformedStats({
    activeTab,
    expenseStats: currentExpenseStats,
    incomeStats: currentIncomeStats,
    statsOverview: currentStatsOverview,
    cashFlowData,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshStats(selectedRange);
    setRefreshing(false);
  };
  const isStatsCached = (range: StatsRange) => {
    return (
      statsOverview[range] &&
      expenseStats[range] &&
      incomeStats[range] &&
      transferStats[range]
    );
  };
  useEffect(() => {
    if (!isStatsCached(selectedRange)) {
      refreshStats(selectedRange);
    }
  }, [selectedRange]);

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <StatusBar barStyle="light-content" />
        <View>
          <Text style={{ color: colors.text, fontSize: 18 }}>
            Loading statistics...
          </Text>
        </View>
      </View>
    );
  }
  const isEmptyStats =
    !currentStatsOverview ||
    currentStatsOverview.totalTransactions === 0 ||
    (!currentIncomeStats?.trend?.length && !currentExpenseStats?.trend?.length);

  if (isEmptyStats) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" />

        <StatsHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Time Range Selector */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.backgroundLight,
              padding: 10,
              borderRadius: 20,
              alignSelf: "flex-start",
            }}
          >
            <Feather name="calendar" size={18} color={colors.primary[400]} />
            <Text style={{ color: colors.primary[400], marginHorizontal: 8 }}>
              {rangeLabel}
            </Text>
            <Entypo name="chevron-down" size={18} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Feather name="bar-chart-2" size={64} color={colors.primary[400]} />
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No statistics available
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            There are no transactions recorded for {rangeLabel}.
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            Try selecting another range or add some transactions to get started.
          </Text>
        </View>

        {/* Time Range Modal */}
        <TimeRangeSelectorModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={(val) => {
            setSelectedRange(val as StatsRange);
            setModalVisible(false);
          }}
          selectedRange={selectedRange}
          options={ranges}
        />

        <BottomBar />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <StatsHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Range Selector */}
        <View
          style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 16 }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.backgroundLight,
              padding: 10,
              borderRadius: 20,
              alignSelf: "flex-start",
            }}
          >
            <Feather name="calendar" size={18} color={colors.primary[400]} />
            <Text style={{ color: colors.primary[400], marginHorizontal: 8 }}>
              {rangeLabel}
            </Text>
            <Entypo name="chevron-down" size={18} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <StatsChartCard
          chartType={chartType}
          onChartTypeChange={setChartType}
          chartData={chartData}
          total={currentStats.total}
          change={currentStats.change}
          width={screenWidth - 32}
        />

        {/* Spending Tab Components */}
        {activeTab === "spending" && (
          <>
            <CategoryBreakdown
              pieData={pieData}
              chartWidth={screenWidth - 32}
            />
            <TopExpenses expenses={currentExpenseStats?.top5Expenses || []} />
          </>
        )}

        {/* Income Tab Components */}
        {activeTab === "income" && currentTransferStats && (
          <TransferOverview data={currentTransferStats} />
        )}

        {/* Savings Tab Components */}
        {activeTab === "savings" && currentStatsOverview && (
          <SavingsSummary overview={currentStatsOverview} />
        )}
      </ScrollView>

      {/* Time Range Modal */}
      <TimeRangeSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(val) => {
          setSelectedRange(val as StatsRange);
          setModalVisible(false);
        }}
        selectedRange={selectedRange}
        options={ranges}
      />

      <BottomBar />
    </View>
  );
}
