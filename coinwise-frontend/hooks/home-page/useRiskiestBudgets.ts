import { BudgetModel } from "@/models/budget";
import { TransactionModel } from "@/models/transaction";

import { useMemo } from "react";

export const useRiskiestBudgets = (
  budgets: BudgetModel[],
  transactions: Record<string, TransactionModel[]> = {}
) => {
  return useMemo(() => {
    const now = new Date();
    return budgets
      .map((budget: BudgetModel) => {
        const periodStart =
          budget.recurring_frequency === "monthly"
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : budget.recurring_frequency === "weekly"
            ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            : new Date(now.getFullYear(), 0, 1);

        const spent = budget.id ? transactions[budget.id] || [] : [];
        const filtered = spent.filter(
          (t: TransactionModel) =>
            t.type === "expense" &&
            t.category === budget.category &&
            new Date(t.date) >= periodStart
        );

        const totalSpent = filtered.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...budget,
          spent: totalSpent,
        };
      })
      .filter((budget) => budget.spent < budget.amount)
      .sort((a, b) => {
        const percentageA = (a.spent / a.amount) * 100;
        const percentageB = (b.spent / b.amount) * 100;
        return percentageB - percentageA;
      })
      .slice(0, 3);
  }, [budgets, transactions]);
};
