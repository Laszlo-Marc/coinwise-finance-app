import { TransactionModel } from "@/models/transaction";
import { useMemo } from "react";

export const useRecentTransactions = (transactions: TransactionModel[]) => {
  return useMemo(() => {
    return transactions
      .sort(
        (
          a: { date: string | number | Date },
          b: { date: string | number | Date }
        ) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [transactions]);
};
