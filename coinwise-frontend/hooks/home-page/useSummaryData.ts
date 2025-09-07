import { User } from "@/models/auth";
import { TransactionModel } from "@/models/transaction";
import { useMemo } from "react";

export const useSummaryData = (
  transactions: TransactionModel[],
  user: User | null
) => {
  return useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const last3Months = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate()
    );

    const calculateTotals = (startDate?: Date) => {
      const filtered = startDate
        ? transactions.filter((t) => new Date(t.date) >= startDate)
        : transactions;

      let income = 0;
      let expenses = 0;

      for (const t of filtered) {
        switch (t.type) {
          case "income":
          case "deposit":
            income += t.amount;
            break;
          case "expense":
            expenses += t.amount;
            break;
          case "transfer":
            if (t.receiver && t.receiver === user?.full_name) {
              income += t.amount;
            } else if (t.sender && t.sender === user?.full_name) {
              expenses += t.amount;
            }
            break;
        }
      }

      return { income, expenses };
    };

    return {
      allTime: calculateTotals(),
      lastMonth: calculateTotals(lastMonth),
      last3Months: calculateTotals(last3Months),
    };
  }, [transactions, user]);
};
