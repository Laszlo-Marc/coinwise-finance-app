import { TransactionFilterOptions } from "@/contexts/AppContext";
import { TransactionModel } from "@/models/transaction";
import { useCallback, useEffect, useState } from "react";

export const useTransactionFilters = (
  fetchTransactions: (
    page: number,
    filters: TransactionFilterOptions
  ) => Promise<void>
) => {
  const [filters, setFilters] = useState<TransactionFilterOptions>(() => {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 30);

    return {
      transactionClass: "expense",
      sortBy: "date",
      sortOrder: "desc",
      startDate: start,
      endDate: now,
      category: "",
    };
  });

  const [displayedTransactions, setDisplayedTransactions] = useState<
    TransactionModel[]
  >([]);

  const handleFilterChange = useCallback(
    (updated: Partial<TransactionFilterOptions>) => {
      const updatedFilters = { ...filters, ...updated };
      setFilters(updatedFilters);
      fetchTransactions(1, updatedFilters);
    },
    [filters, fetchTransactions]
  );

  useEffect(() => {
    fetchTransactions(1, filters);
  }, []);

  return {
    filters,
    setFilters,
    displayedTransactions,
    setDisplayedTransactions,
    handleFilterChange,
  };
};
