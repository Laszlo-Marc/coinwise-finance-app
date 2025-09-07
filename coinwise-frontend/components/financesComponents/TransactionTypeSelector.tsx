import { colors } from "@/constants/colors";
import { TransactionType } from "@/models/transactionType";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TransactionTypeSelector = ({
  value,
  onChange,
}: {
  value: TransactionType | "all";
  onChange: (type: TransactionType | "all") => void;
}) => {
  const filters: {
    key: "all" | "expense" | "income" | "transfer" | "deposit";
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
  }[] = [
    { key: "all", label: "All", icon: "list" },
    { key: "expense", label: "Expenses", icon: "arrow-down" },
    { key: "income", label: "Income", icon: "arrow-up" },
    { key: "transfer", label: "Transfers", icon: "refresh-cw" },
    { key: "deposit", label: "Deposits", icon: "dollar-sign" },
  ];

  const firstRow = filters.slice(0, 2);
  const secondRow = filters.slice(2);

  const renderRow = (
    items: ReadonlyArray<{
      key: "all" | "expense" | "income" | "transfer" | "deposit";
      label: string;
      icon: React.ComponentProps<typeof Feather>["name"];
    }>
  ) => (
    <View style={styles.buttonRow}>
      {items.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            value === filter.key && styles.selectedFilterButton,
          ]}
          onPress={() => onChange(filter.key)}
        >
          <Feather
            name={filter.icon}
            size={16}
            color={value === filter.key ? "#FFF" : colors.text}
          />
          <Text
            style={[
              styles.filterText,
              value === filter.key && styles.selectedFilterText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderRow(firstRow)}
      {renderRow(secondRow)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    minWidth: 110,
    justifyContent: "center",
  },
  selectedFilterButton: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    color: colors.text,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  selectedFilterText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Montserrat",
  },
});
