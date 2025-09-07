from typing import List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel


class Transaction(BaseModel):
    id: UUID
    user_id: UUID
    type: Literal["expense", "income", "deposit", "transfer"]
    amount: int  
    currency: Optional[str]
    category: Optional[str]
    sender: Optional[str]
    receiver: Optional[str]
    description: Optional[str]
    date: str  
    created_at: Optional[str]
    merchant: Optional[str]

class StatsOverview(BaseModel):
    totalExpenses: int
    totalIncome: int
    totalDeposits: int
    balance: int  
    netCashFlow: int  
    totalTransactions: int

class MerchantStats(BaseModel):
    merchantName: str
    totalSpent: int
    totalTransactions: int
    averageTransactionAmount: int

class TrendPoint(BaseModel):
    period: str
    amount: int
    count: int

class TransferTrendPoint(BaseModel):
    period: str
    sent: int
    received: int
    net: int

class CategoryStats(BaseModel):
    category: str
    totalSpent: int
    totalTransactions: int
    averageTransactionAmount: int
    percentageOfTotal: int
    topTransactions: List[Transaction]

class ExpenseStats(BaseModel):
    totalExpenses: int
    averageExpense: int
    highestExpense: int
    lowestExpense: int
    top5Expenses: List[Transaction]
    topMerchants: List[MerchantStats]
    topCategories: List[CategoryStats]
    trend: List[TrendPoint]
    averagePerPeriod: int
    uncategorizedExpenses: List[Transaction]

class IncomeStats(BaseModel):
    totalIncome: int
    averageIncome: int
    highestIncome: int
    lowestIncome: int
    trend: List[TrendPoint]
    averagePerPeriod: int

class TransferStats(BaseModel):
    totalTransfers: int
    totalSent: int
    totalReceived: int
    netFlow: int
    averageTransfer: int
    highestTransfer: int
    lowestTransfer: int
    top5Transfers: List[Transaction]
    trend: List[TransferTrendPoint]
    averagePerPeriod: int

class DepositStats(BaseModel):
    totalDeposits: int
    averageDeposit: int
    highestDeposit: int
    lowestDeposit: int

class Budget(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    title: str
    category: str
    description: Optional[str] = None
    amount: int  
    spent: int   
    remaining: int  
    start_date: str
    end_date: str
    created_at: Optional[str]
    is_recurring: bool = False
    recurring_frequency: Optional[Literal["daily", "weekly", "monthly"]] = None
    notificationEnabled: Optional[bool] = False
    notificationsThreshold: Optional[float] = 90.0  
class BudgetStats(BaseModel):
    totalBudget: int
    totalSpent: int
    remainingBudget: int
    budgetUtilization: int
    overBudgetCount: int
    underBudgetCount: int
    budgets: List[Budget]
    expiredRecurringBudgets: List[Budget] = []
    expiredOneTimeBudgets: List[Budget] = []

class GoalProgress(BaseModel):
    id: str
    title: str
    targetAmount: int
    currentAmount: int
    progress: int  
    daysLeft: int
    recommendedDailyContribution: int
  

class GoalStats(BaseModel):
    totalGoals: int
    completedGoals: int
    activeGoals: int
    totalContributions: int
    averageContribution: int
    topGoals: List[GoalProgress]