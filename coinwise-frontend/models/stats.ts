import { BudgetModel } from "./budget";
import { TransactionModel } from "./transaction";
export type StatsOverview = {
  totalExpenses: number;
  totalIncome: number;
  totalDeposits: number;
  balance: number;
  netCashFlow: number;
  totalTransactions: number;
};

type MerchantStats = {
  merchantName: string;
  totalSpent: number;
  totalTransactions: number;
  averageTransactionAmount: number;
};
export type CategoryStats = {
  category: string;
  totalSpent: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  percentageOfTotal: number;
  topTransactions: TransactionModel[];
};
export type ExpenseStats = {
  totalExpenses: number;
  averageExpense: number;
  highestExpense: number;
  lowestExpense: number;
  top5Expenses: TransactionModel[];
  topMerchants: MerchantStats[];
  topCategories: CategoryStats[];
  trend: { period: string; amount: number; count: number }[];
  averagePerPeriod: number;
  uncategorizedExpenses: TransactionModel[];
};

export type IncomeStats = {
  totalIncome: number;
  averageIncome: number;
  highestIncome: number;
  lowestIncome: number;
  trend: { period: string; amount: number; count: number }[];
  averagePerPeriod: number;
};

export type TransferStats = {
  totalTransfers: number;
  totalSent: number;
  totalReceived: number;
  netFlow: number;
  averageTransfer: number;
  highestTransfer: number;
  lowestTransfer: number;
  top5Transfers: TransactionModel[];
  trend: {
    period: string;
    sent: number;
    received: number;
    net: number;
  }[];
  averagePerPeriod: number;
};

export type DepositStats = {
  totalDeposits: number;
  averageDeposit: number;
  highestDeposit: number;
  lowestDeposit: number;
};

export type BudgetStats = {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  overBudgetCount: number;
  underBudgetCount: number;
  budgets: BudgetModel[];
  expiredRecurringBudgets: BudgetModel[];
  expiredOneTimeBudgets: BudgetModel[];
};

type GoalProgress = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: number; // %
  daysLeft: number;
  recommendedDailyContribution: number;
  isRecurring: boolean;
  autoContributionEnabled: boolean;
};
export type GoalStats = {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalContributions: number;
  averageContribution: number;
  topGoals: GoalProgress[];
};

export type MonthlySummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

export type HistoricalSummary = {
  lastMonth: {
    income: number;
    expenses: number;
  };
  last3Months: {
    income: number;
    expenses: number;
  };
  allTime: {
    income: number;
    expenses: number;
  };
};
