import { API_BASE_URL } from "@/constants/api";
import { TransactionType } from "@/models/transactionType";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { PaginatedResponse, TransactionModel } from "../models/transaction";

export interface TransactionFilterOptions {
  transactionClass?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "amount" | "date";
  sortOrder?: "asc" | "desc";
}

interface TransactionContextType {
  transactions: TransactionModel[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (
    transaction: TransactionModel
  ) => Promise<string | undefined>;
  fetchTransactions: (
    page?: number,
    filters?: TransactionFilterOptions
  ) => Promise<void>;
  uploadBankStatement: (file: FormData) => Promise<any>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<TransactionModel>
  ) => Promise<any>;
  transactionsCleanup: () => void;
  deduplicateTransactions: () => Promise<{
    removed_count: number;
    removed_ids: string[];
  } | null>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

const TRANSACTIONS_API_URL = `${API_BASE_URL}/transactions`;
const UPLOAD_API_URL = `${API_BASE_URL}/upload`;

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUsedFilters, setLastUsedFilters] =
    useState<TransactionFilterOptions>();

  const pageSize = 100;
  const maxTransactionCache = 250;
  const hasMore = currentPage < totalPages;

  const transactionsCleanup = useCallback(() => {
    setTransactions([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setCurrentPage(1);
    setTotalPages(1);
    setLastUsedFilters(undefined);
  }, []);

  const handleApiError = useCallback((error: any) => {
    console.error("API Error:", error);
    setError("Something went wrong. Please try again.");
  }, []);

  const fixTransferData = useCallback(async () => {
    const token = await SecureStore.getItem("auth_token");
    const response = await axios.post(
      `${TRANSACTIONS_API_URL}/fix-transfer-names`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
  }, []);

  const fetchTransactions = useCallback(
    async (
      page: number = 1,
      filters: TransactionFilterOptions = lastUsedFilters ?? {}
    ) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      try {
        const token = await SecureStore.getItem("auth_token");

        const params: Record<string, any> = {
          page,
          page_size: pageSize,
          sort_by: filters.sortBy ?? "date",
          sort_order: filters.sortOrder ?? "desc",
        };

        if (filters.transactionClass && filters.transactionClass !== "all") {
          params.transaction_type = filters.transactionClass;
        }

        if (filters.category) params.category = filters.category;
        if (filters.startDate)
          params.start_date = filters.startDate.toISOString().split("T")[0];
        if (filters.endDate)
          params.end_date = filters.endDate.toISOString().split("T")[0];

        const response = await axios.get<PaginatedResponse>(
          `${TRANSACTIONS_API_URL}/filter`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params,
          }
        );

        const { data, page: returnedPage, total_pages } = response.data;

        setTransactions((prev) =>
          page === 1 ? data : [...prev, ...data].slice(-maxTransactionCache)
        );
        setCurrentPage(returnedPage);
        setTotalPages(total_pages);
        setLastUsedFilters(filters);
      } catch (e) {
        handleApiError(e);
      } finally {
        if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [handleApiError, lastUsedFilters]
  );

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions(1, lastUsedFilters);
  }, [fetchTransactions, lastUsedFilters]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore && transactions.length >= pageSize) {
      await fetchTransactions(currentPage + 1, lastUsedFilters);
    }
  }, [
    hasMore,
    isLoadingMore,
    transactions.length,
    currentPage,
    fetchTransactions,
    lastUsedFilters,
  ]);

  const addTransaction = useCallback(
    async (transaction: TransactionModel) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await SecureStore.getItem("auth_token");
        const { id, ...dataToSend } = transaction;
        const response = await axios.post(
          `${TRANSACTIONS_API_URL}/add`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const addedTransaction = response.data;
        setTransactions((prev) =>
          [addedTransaction, ...prev].slice(0, maxTransactionCache)
        );
        return addedTransaction.id;
      } catch (e) {
        handleApiError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiError]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<TransactionModel>) => {
      try {
        const token = await SecureStore.getItem("auth_token");
        const response = await axios.put(
          `${TRANSACTIONS_API_URL}/edit/${id}`,
          updates,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const updatedTransaction = response.data;
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? updatedTransaction : tx))
        );
      } catch (e) {
        handleApiError(e);
      }
    },
    [handleApiError]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        const token = await SecureStore.getItem("auth_token");
        await axios.delete(`${TRANSACTIONS_API_URL}/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      } catch (e) {
        handleApiError(e);
      }
    },
    [handleApiError]
  );

  const deduplicateTransactions = useCallback(async (): Promise<{
    removed_count: number;
    removed_ids: string[];
  } | null> => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      const response = await axios.delete(
        `${TRANSACTIONS_API_URL}/remove-duplicates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { removed_count, removed_ids } = response.data;
      setTransactions((prev) =>
        prev.filter((tx) => !removed_ids.includes(tx.id))
      );
      return { removed_count, removed_ids };
    } catch (e) {
      handleApiError(e);
      return null;
    }
  }, [handleApiError]);

  const uploadBankStatement = useCallback(
    async (formData: FormData): Promise<any> => {
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        const response = await axios.post(`${UPLOAD_API_URL}/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Upload response:", response.data);
        await fixTransferData();
        await fetchTransactions(1, lastUsedFilters);
      } catch (e: any) {
        if (e.response) {
          const status = e.response.status;
          const detail = e.response.data?.detail || "An unknown error occurred";

          if (
            status === 400 &&
            detail.includes("not appear to be a bank statement")
          ) {
            alert(
              "⚠️ The uploaded file does not seem to be a valid bank statement."
            );
          } else {
            alert(`Upload failed (${status}): ${detail}`);
          }
          console.warn("Upload error:", status, detail);
        } else {
          alert("Upload failed. Please check your internet connection.");
          console.error("Upload failed:", e.message);
        }

        return null;
      }
    },
    [fetchTransactions, lastUsedFilters, fixTransferData]
  );

  const contextValue = useMemo(
    () => ({
      transactions,
      isLoading,
      isLoadingMore,
      error,
      currentPage,
      totalPages,
      hasMore,
      loadMore,
      refreshTransactions,
      addTransaction,
      fetchTransactions,
      deleteTransaction,
      updateTransaction,
      uploadBankStatement,
      transactionsCleanup,
      deduplicateTransactions,
    }),
    [
      transactions,
      isLoading,
      isLoadingMore,
      error,
      currentPage,
      totalPages,
      hasMore,
      loadMore,
      refreshTransactions,
      addTransaction,
      fetchTransactions,
      deleteTransaction,
      updateTransaction,
      uploadBankStatement,
      transactionsCleanup,
      deduplicateTransactions,
    ]
  );

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
};
