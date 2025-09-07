import { User } from "@/models/auth";
import { TransactionModel } from "@/models/transaction";
import { useMemo } from "react";

export const useCurrentBalance = (
  transactions: TransactionModel[],
  user: User | null
) => {
  return useMemo(() => {
    return transactions.reduce((balance: number, transaction) => {
      switch (transaction.type) {
        case "income":
        case "deposit":
          return balance + transaction.amount;

        case "transfer":
          return transaction.receiver === user?.full_name
            ? balance + transaction.amount
            : balance - transaction.amount;

        default:
          return balance - transaction.amount;
      }
    }, 0);
  }, [transactions, user]);
};
