import { API_BASE_URL } from "@/constants/api";
import { BudgetModel } from "@/models/budget";
import { TransactionModel } from "@/models/transaction";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useMemo, useState } from "react";

interface BudgetContextType {
  budgets: BudgetModel[];
  error: string | null;
  budgetTransactions: Record<string, TransactionModel[]>;
  fetchBudgetTransactions: () => Promise<void>;
  addBudget: (budget: BudgetModel) => Promise<void>;
  fetchBudgets: () => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateBudget: (id: string, updates: Partial<BudgetModel>) => Promise<any>;
  budgetCleanup: () => void;
  addTransactionForBudget: (
    transaction: Partial<TransactionModel>,
    budgetId: string
  ) => Promise<string | undefined>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const BUDGET_API_URL = `${API_BASE_URL}/budgets`;

export const BudgetsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [budgets, setBudgets] = useState<BudgetModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [budgetTransactions, setBudgetTransactions] = useState<
    Record<string, TransactionModel[]>
  >({});

  const budgetCleanup = () => {
    setBudgets([]);
    setError(null);
  };

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    setError("Something went wrong. Please try again.");
  };

  const addTransactionForBudget = async (
    transaction: Partial<TransactionModel>,
    budgetId: string
  ): Promise<string | undefined> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.post(
        `${BUDGET_API_URL}/add-for-budget`,
        transaction,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            budget_id: budgetId,
          },
        }
      );

      const addedTx = response.data;

      setBudgetTransactions((prev) => ({
        ...prev,
        [budgetId]: [addedTx, ...(prev[budgetId] || [])],
      }));
      await fetchBudgets();

      await fetchBudgetTransactions();

      return addedTx.id;
    } catch (e) {
      handleApiError(e);
      return undefined;
    }
  };

  const fetchBudgetTransactions = async (): Promise<void> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.get(
        `${BUDGET_API_URL}/all/budget-transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log("Fetched budget transactions:", data);

      setBudgetTransactions(data);
    } catch (e) {
      handleApiError(e);
    }
  };

  const fetchBudgets = async (): Promise<void> => {
    setError(null);

    try {
      const token = await SecureStore.getItem("auth_token");

      const response = await axios.get(`${BUDGET_API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = response.data;
      setBudgets(data);
    } catch (e) {
      handleApiError(e);
    }
  };

  const addBudget = async (budget: BudgetModel): Promise<void> => {
    setError(null);
    try {
      const token = await SecureStore.getItem("auth_token");
      const { id, ...dataToSend } = budget;
      console.log("Adding budget:", dataToSend);
      const response = await axios.post(`${BUDGET_API_URL}/add`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const addedBudget = response.data;
      setBudgets((prev) => [addedBudget, ...prev]);
    } catch (e) {
      handleApiError(e);
    }
  };

  const updateBudget = async (
    id: string,
    updates: Partial<BudgetModel>
  ): Promise<void> => {
    try {
      const token = await SecureStore.getItem("auth_token");
      const response = await axios.put(
        `${BUDGET_API_URL}/edit/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedBudget = response.data;

      setBudgets((prev) =>
        prev.map((bg) => (bg.id === id ? updatedBudget : bg))
      );
    } catch (e) {
      handleApiError(e);
    }
  };

  const deleteBudget = async (id: string): Promise<void> => {
    try {
      const token = await SecureStore.getItem("auth_token");
      await axios.delete(`${BUDGET_API_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setBudgets((prev) => prev.filter((bg) => bg.id !== id));
    } catch (e) {
      handleApiError(e);
    }
  };

  const contextValue = useMemo(
    () => ({
      budgets,
      error,
      budgetTransactions,
      addBudget,
      fetchBudgets,
      deleteBudget,
      updateBudget,
      budgetCleanup,
      fetchBudgetTransactions,
      addTransactionForBudget,
    }),
    [budgets, budgetTransactions, error]
  );

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetsProvider");
  }
  return context;
};
