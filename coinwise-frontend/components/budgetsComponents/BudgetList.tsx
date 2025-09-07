import { colors } from "@/constants/colors";
import { BudgetModel } from "@/models/budget";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BudgetItem from "./BudgetItem";

type Props = {
  budgets: BudgetModel[];
  onEditBudget: (id: string) => void;
  onDeleteBudget: (budgetId: string) => void;
  onRefresh?: () => Promise<void>;
  headerComponent?: React.ReactElement;
};

const BudgetList = ({
  budgets,
  onEditBudget,
  onDeleteBudget,
  onRefresh,
  headerComponent,
}: Props) => {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const renderBudgetItem = ({
    item,
    index,
  }: {
    item: BudgetModel;
    index: number;
  }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50 + index * 15],
            }),
          },
        ],
      }}
    >
      <BudgetItem
        budget={item}
        onEdit={() => onEditBudget(item.id ?? "")}
        onDelete={() => onDeleteBudget(item.id ?? "")}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="pie-chart" size={64} color={colors.primary[400]} />
      <Text style={styles.emptyTitle}>No Budgets Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first budget to start managing your spending.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={budgets}
      renderItem={renderBudgetItem}
      keyExtractor={(item) => item.id || ""}
      ListEmptyComponent={renderEmptyState}
      ListHeaderComponent={headerComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        ) : undefined
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 120,
        paddingTop: 16,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
});

export default BudgetList;
