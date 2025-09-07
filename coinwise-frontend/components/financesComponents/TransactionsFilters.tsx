import { colors } from "@/constants/colors";

import { TransactionFilterOptions } from "@/contexts/AppContext";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateRangeSelector from "./DateRangeComponent";

interface TransactionFiltersProps {
  filters: TransactionFilterOptions;
  onChange: (filters: Partial<TransactionFilterOptions>) => void;
  categories?: string[];
}

const dateRangePresets = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last Week" },
  { id: "month", label: "Last Month" },
  { id: "3months", label: "Last 3 Months" },
  { id: "custom", label: "Custom Range" },
];

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onChange,
  categories = [],
}) => {
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [dateRangeDropdownVisible, setDateRangeDropdownVisible] =
    useState(false);
  const [customDateRangeVisible, setCustomDateRangeVisible] = useState(false);

  const handleSortByChange = () => {
    onChange({
      sortBy: filters.sortBy === "date" ? "amount" : "date",
    });
  };

  const handleSortOrderChange = () => {
    onChange({
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    onChange({ startDate: start, endDate: end });
    setCustomDateRangeVisible(false);
  };

  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let start = new Date();

    if (preset === "custom") {
      setCustomDateRangeVisible(true);
      setDateRangeDropdownVisible(false);
      return;
    }

    switch (preset) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(now.getMonth() - 3);
        break;
    }

    onChange({ startDate: start, endDate: new Date() });
    setDateRangeDropdownVisible(false);
  };

  const handleCategoryChange = (category: string) => {
    onChange({ category: category || undefined });
    setCategoryDropdownVisible(false);
  };

  const formatDateRange = () => {
    const formatDate = (date?: Date) =>
      date?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ??
      "";

    return `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.filterTitle}>Additional Filters</Text>

      <View style={styles.controlsContainer}>
        {/* Sort Controls */}
        <View style={styles.sortControlsRow}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSortByChange}
          >
            <Feather name="bar-chart-2" size={14} color={colors.text} />
            <Text style={styles.sortButtonText}>
              Sort: {filters.sortBy === "date" ? "Date" : "Amount"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={handleSortOrderChange}
          >
            <Feather
              name={filters.sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={14}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* Date Range Selector */}
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateRangeButton}
              onPress={() => {
                setDateRangeDropdownVisible(!dateRangeDropdownVisible);
                setCategoryDropdownVisible(false);
              }}
            >
              <Feather name="calendar" size={14} color={colors.text} />
              <Text style={styles.dateRangeText} numberOfLines={1}>
                {formatDateRange()}
              </Text>
              <Feather
                name={dateRangeDropdownVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>

            {dateRangeDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {dateRangePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.dropdownItem}
                    onPress={() => applyDatePreset(preset.id)}
                  >
                    <Text style={styles.dropdownItemText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Category Filter - Only for Expenses */}
        {filters.transactionClass === "expense" && categories.length > 0 && (
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => {
                setCategoryDropdownVisible(!categoryDropdownVisible);
                setDateRangeDropdownVisible(false);
              }}
            >
              <Feather name="tag" size={14} color={colors.text} />
              <Text style={styles.categoryButtonText}>
                Category: {filters.category || "All"}
              </Text>
              <Feather
                name={categoryDropdownVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
              />
            </TouchableOpacity>

            {categoryDropdownVisible && (
              <View style={styles.categoryDropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleCategoryChange("")}
                  >
                    <Text style={styles.dropdownItemText}>All Categories</Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.dropdownItem}
                      onPress={() => handleCategoryChange(category)}
                    >
                      <Text style={styles.dropdownItemText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Custom Date Range Modal */}
      {customDateRangeVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={customDateRangeVisible}
          onRequestClose={() => setCustomDateRangeVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <TouchableOpacity
                  onPress={() => setCustomDateRangeVisible(false)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <DateRangeSelector
                  startDate={filters.startDate ?? new Date()}
                  endDate={filters.endDate ?? new Date()}
                  onDateChange={handleDateRangeChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontWeight: "500",
  },
  controlsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  sortControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  sortButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
  sortOrderButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRangeContainer: {
    position: "relative",
    flex: 1,
    zIndex: 2,
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
    flex: 1,
  },
  dateRangeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: 34,
    right: 0,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 160,
    zIndex: 1000,
  },
  categoryContainer: {
    position: "relative",
    zIndex: 1,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  categoryDropdownMenu: {
    position: "absolute",
    top: 34,
    left: 0,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "400",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
});

export default TransactionFilters;
