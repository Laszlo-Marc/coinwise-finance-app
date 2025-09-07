import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from collections import defaultdict
from supabase import Client
from lib import get_supabase_client
from dateutil.relativedelta import relativedelta
from models.stats import  Budget, BudgetStats, CategoryStats, DepositStats, ExpenseStats, GoalProgress, GoalStats, IncomeStats, MerchantStats, StatsOverview, Transaction, TransferStats, TransferTrendPoint, TrendPoint

from routes.auth import get_current_user, User
from service.stats_service import calculate_trend_data, cast_int, convert_transaction_to_model, get_filtered_transactions, parse_date_range

router = APIRouter()
logger = logging.getLogger("stats_processor")
supabase: Client = get_supabase_client()


@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_param: Optional[str] = Query(None, alias="range", description="Predefined range")
):
    logger.info(f"Getting overview stats for user {current_user.id}")
    try:
        start_date, end_date = parse_date_range(start_date, end_date, range_param)
        all_transactions = get_filtered_transactions(str(current_user.id), start_date, end_date)
        logger.info(f"Parsed date range: {start_date} to {end_date}")
        logger.info(f"First 5 transactions: {all_transactions[:5]}")

        total_income = sum(tx["amount"] for tx in all_transactions if tx["type"] == "income")
        total_expenses = sum(tx["amount"] for tx in all_transactions if tx["type"] == "expense")
        total_deposits = sum(tx["amount"] for tx in all_transactions if tx["type"] == "deposit")

        return StatsOverview(
            totalIncome=cast_int(total_income),
            totalExpenses=cast_int(total_expenses),
            totalDeposits=cast_int(total_deposits),
            balance=cast_int(total_income + total_deposits - total_expenses),
            netCashFlow=cast_int(total_income - total_expenses),
            totalTransactions=len(all_transactions)
        )

    except Exception as e:
        logger.error(f"Error getting overview stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expenses/full", response_model=ExpenseStats)
async def get_full_expense_stats(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_param: Optional[str] = Query(None, alias="range", description="Predefined range"),
    granularity: Optional[str] = Query("monthly", description="Granularity for trend data"),
):
    """Get comprehensive expense statistics"""
    logger.info(f"Getting full expense stats for user {current_user.id}")
    
    try:
        start_date, end_date = parse_date_range(start_date, end_date, range_param)
        
        expenses = get_filtered_transactions(
            str(current_user.id), start_date, end_date, "expense"
        )
        
        if not expenses:
            return ExpenseStats(
                totalExpenses=0,
                averageExpense=0,
                highestExpense=0,
                lowestExpense=0,
                top5Expenses=[],
                topMerchants=[],
                topCategories=[],
                trend=[],
                averagePerPeriod=0,
                uncategorizedExpenses=[]
            )
        
        amounts = [tx["amount"] for tx in expenses]
        total_expenses = sum(amounts)
        
        average_expense = total_expenses / len(expenses)
        highest_expense = max(amounts)
        lowest_expense = min(amounts)
        
        
        top_5 = sorted(expenses, key=lambda x: x["amount"], reverse=True)[:5]
        top5_expenses = [convert_transaction_to_model(tx) for tx in top_5]
        
       
        merchant_data = defaultdict(lambda: {"amount": 0, "count": 0})
        for tx in expenses:
            merchant = tx.get("merchant") or "Unknown"
            merchant_data[merchant]["amount"] += tx["amount"]
            merchant_data[merchant]["count"] += 1
        
        top_merchants = []
        for merchant, data in merchant_data.items():
            if merchant != "Unknown":  
                top_merchants.append(MerchantStats(
                    merchantName=merchant,
                    totalSpent=cast_int(data["amount"]),
                    totalTransactions=data["count"],
                    averageTransactionAmount=cast_int(data["amount"] / data["count"])
                ))
        top_merchants.sort(key=lambda x: x.totalSpent, reverse=True)
        top_merchants = top_merchants[:10] 
        

        category_data = defaultdict(lambda: {"amount": 0, "count": 0, "transactions": []})
        for tx in expenses:
            category = tx.get("category", "Other")
            category_data[category]["amount"] += tx["amount"]
            category_data[category]["count"] += 1
            category_data[category]["transactions"].append(tx)
        
        top_categories = []
        for category, data in category_data.items():
         
            top_transactions = sorted(data["transactions"], key=lambda x: x["amount"], reverse=True)[:3]
            top_tx_models = [convert_transaction_to_model(tx) for tx in top_transactions]

            percentage = (data["amount"] / total_expenses * 100) if total_expenses > 0 else 0
            top_categories.append(CategoryStats(
                category=category,
                totalSpent=cast_int(data["amount"]),
                totalTransactions=data["count"],
                averageTransactionAmount=cast_int(data["amount"] / data["count"]),
                percentageOfTotal=cast_int(percentage), 
                topTransactions=top_tx_models
            ))
        
        top_categories.sort(key=lambda x: x.totalSpent, reverse=True)
        
 
        trend_data = calculate_trend_data(expenses, granularity)
        average_per_period = total_expenses / len(trend_data) if trend_data else 0
        

        uncategorized = [tx for tx in expenses if not tx.get("category") or tx.get("category") == "uncategorized"]
        uncategorized_models = [convert_transaction_to_model(tx) for tx in uncategorized]
        
        return ExpenseStats(
            totalExpenses=cast_int(total_expenses),  
            averageExpense=cast_int(average_expense),
            highestExpense=cast_int(highest_expense),
            lowestExpense=cast_int(lowest_expense),
            top5Expenses=top5_expenses,
            topMerchants=top_merchants,
            topCategories=top_categories,
            trend=trend_data,
            averagePerPeriod=cast_int(average_per_period),
            uncategorizedExpenses=uncategorized_models
        )
        
    except Exception as e:
        logger.error(f"Error getting full expense stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/income/full", response_model=IncomeStats)
async def get_full_income_stats(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_param: Optional[str] = Query(None, alias="range", description="Predefined range"),
    granularity: Optional[str] = Query("monthly", description="Granularity for trend data")
):
    """Get comprehensive income statistics"""
    logger.info(f"Getting full income stats for user {current_user.id}")
    
    try:
        start_date, end_date = parse_date_range(start_date, end_date, range_param)
        
        income_transactions = get_filtered_transactions(
            str(current_user.id), start_date, end_date, "income"
        )
        deposit_transactions=get_filtered_transactions(
            str(current_user.id), start_date, end_date, "deposit"
        )
        transfer_transactions = get_filtered_transactions(
            str(current_user.id), start_date, end_date, "transfer"  
        )
        full_name = current_user.full_name.lower()
        
        received_transfers = [tx for tx in transfer_transactions if tx.get("receiver", "").lower() == full_name]
       

        if not income_transactions:
            return IncomeStats(
                totalIncome=0,
                averageIncome=0,
                highestIncome=0,
                lowestIncome=0,
                trend=[],
                averagePerPeriod=0
            )
        
        income_amounts = [tx["amount"] for tx in income_transactions]
        deposit_amounts = [tx["amount"] for tx in deposit_transactions]
        transfer_amounts = [tx["amount"] for tx in received_transfers]
        amounts = income_amounts + deposit_amounts + transfer_amounts
        total_income = sum(amounts)
        len_transactions = len(income_transactions) + len(deposit_transactions) + len(received_transfers)
     
        average_income = total_income / len_transactions if len_transactions > 0 else 0
        highest_income = max(amounts) if amounts else 0
        lowest_income = min(amounts) if amounts else 0

 
        trend_data = calculate_trend_data(income_transactions, granularity)
        average_per_period = total_income / len(trend_data) if trend_data else 0
        
        return IncomeStats(
            totalIncome=cast_int(total_income),
            averageIncome=cast_int(average_income),
            highestIncome=cast_int(highest_income),
            lowestIncome=cast_int(lowest_income),
            trend=trend_data,
            averagePerPeriod=cast_int(average_per_period)
        )
        
    except Exception as e:
        logger.error(f"Error getting full income stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transfers/full", response_model=TransferStats)
async def get_full_transfer_stats(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_param: Optional[str] = Query(None, alias="range", description="Predefined range")
):
    """Get comprehensive transfer statistics"""
    logger.info(f"Getting full transfer stats for user {current_user.id}")
    
    try:
        start_date, end_date = parse_date_range(start_date, end_date, range_param)
        
        transfers = get_filtered_transactions(
            str(current_user.id), start_date, end_date, "transfer"
        )
        
        if not transfers:
            return TransferStats(
                totalTransfers=0,
                totalSent=0,
                totalReceived=0,
                netFlow=0,
                averageTransfer=0,
                highestTransfer=0,
                lowestTransfer=0,
                top5Transfers=[],
                trend=[],
                averagePerPeriod=0
            )
        
        total_sent = 0
        total_received = 0
        sent_transfers = []
        received_transfers = []
        
        for tx in transfers:
            sender = tx.get("sender", "")
            receiver = tx.get("receiver", "")
            
          
            if sender == current_user.full_name:
                total_sent += tx["amount"]
                sent_transfers.append(tx)
            elif receiver == current_user.full_name:
                total_received += tx["amount"]
                received_transfers.append(tx)
        
        amounts = [tx["amount"] for tx in transfers]
        total_transfers = len(transfers)
        
    
        average_transfer = sum(amounts) / len(amounts) if amounts else 0
        highest_transfer = max(amounts) if amounts else 0
        lowest_transfer = min(amounts) if amounts else 0
        net_flow = total_received - total_sent
        
        
        top_5 = sorted(transfers, key=lambda x: x["amount"], reverse=True)[:5]
        top5_transfers = [convert_transaction_to_model(tx) for tx in top_5]
        
      
        period_data = defaultdict(lambda: {"sent": 0, "received": 0})
        
        for tx in transfers:
            if not tx.get("date"):
                continue
                
            period = tx["date"][:7] 
            sender = tx.get("sender", "")
            receiver = tx.get("receiver", "")
            
            if sender == current_user.full_name:
                period_data[period]["sent"] += tx["amount"]
            elif receiver == current_user.full_name:
                period_data[period]["received"] += tx["amount"]
        
        trend_data = []
        for period in sorted(period_data.keys()):
            sent = period_data[period]["sent"]
            received = period_data[period]["received"]
            trend_data.append(TransferTrendPoint(
                period=period,
                sent=cast_int(sent),
                received=cast_int(received),
                net=cast_int(received - sent)
            ))
        
        average_per_period = (total_sent + total_received) / len(trend_data) if trend_data else 0
        
        return TransferStats(
            totalTransfers=cast_int(total_transfers),
            totalSent=cast_int(total_sent),
            totalReceived=cast_int(total_received),
            netFlow=cast_int(net_flow),
            averageTransfer=cast_int(average_transfer),
            highestTransfer=cast_int(highest_transfer),
            lowestTransfer=cast_int(lowest_transfer),
            top5Transfers=top5_transfers,
            trend=trend_data,
            averagePerPeriod=cast_int(average_per_period)
        )
        
    except Exception as e:
        logger.error(f"Error getting full transfer stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deposits/full", response_model=DepositStats)
async def get_full_deposit_stats(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    range_param: Optional[str] = Query(None, alias="range", description="Predefined range")
):
    """Get comprehensive deposit statistics"""
    logger.info(f"Getting full deposit stats for user {current_user.id}")
    
    try:
        start_date, end_date = parse_date_range(start_date, end_date, range_param)
        
        deposits = get_filtered_transactions(
            str(current_user.id), start_date, end_date, "deposit"
        )
        
        if not deposits:
            return DepositStats(
                totalDeposits=0,
                averageDeposit=0,
                highestDeposit=0,
                lowestDeposit=0
            )
        
        amounts = [tx["amount"] for tx in deposits]
        total_deposits = sum(amounts)
        
        return DepositStats(
            totalDeposits=cast_int(total_deposits),
            averageDeposit=cast_int(total_deposits / len(deposits)),
            highestDeposit=cast_int(max(amounts)),
            lowestDeposit=cast_int(min(amounts))
        )
        
    except Exception as e:
        logger.error(f"Error getting full deposit stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/budgets", response_model=BudgetStats)
async def get_budget_stats(
    current_user: User = Depends(get_current_user),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    logger.info(f"Getting budget stats for user {current_user.id}")

    try:
        budgets_response = supabase.table("budgets").select("*").eq("user_id", str(current_user.id)).execute()
        budgets = budgets_response.data or []

        if not budgets:
            return BudgetStats(
                totalBudget=0,
                totalSpent=0,
                remainingBudget=0,
                budgetUtilization=0,
                overBudgetCount=0,
                underBudgetCount=0,
                budgets=[],
                expiredRecurringBudgets=[],
                expiredOneTimeBudgets=[]
            )

        total_budget = 0
        total_spent = 0
        over_budget_count = 0
        under_budget_count = 0
        budget_models = []

        expired_recurring = []
        expired_one_time = []
        today = datetime.utcnow().date()

        for budget in budgets:
            end_date_obj = datetime.fromisoformat(budget["end_date"]).date()

            if end_date_obj <= today:
                if budget.get("is_recurring", False):
                    expired_recurring.append(budget)
                    new_start = today
                    freq = budget.get("recurring_frequency", "monthly")

                    if freq == "daily":
                        new_end = new_start  
                    elif freq == "weekly":
                        new_end = new_start + timedelta(weeks=1) - timedelta(days=1)
                    elif freq == "monthly":
                        new_end = new_start + relativedelta(months=1) - timedelta(days=1)
                    else:
                        continue


                    supabase.table("budgets").update({
                        "start_date": new_start.isoformat(),
                        "end_date": new_end.isoformat(),
                        "spent": 0,
                        "remaining": budget["amount"],
                    }).eq("id", budget["id"]).execute()

                    supabase.table("budget_transactions").delete().eq("budget_id", budget["id"]).execute()
                else:
                    expired_one_time.append(budget)

       
            junction_res = supabase.table("budget_transactions")\
                .select("transaction_id")\
                .eq("budget_id", budget["id"])\
                .execute()
            tx_ids = [entry["transaction_id"] for entry in junction_res.data or []]

            if tx_ids:
                tx_res = supabase.table("transactions").select("*").in_("id", tx_ids).execute()
                txs = tx_res.data or []
            else:
                txs = []

            filtered_txs = []
            for tx in txs:
                tx_date = datetime.fromisoformat(tx["date"])
                if (not start_date or tx_date >= datetime.fromisoformat(start_date)) and \
                   (not end_date or tx_date <= datetime.fromisoformat(end_date)):
                    filtered_txs.append(tx)

            spent = sum(tx["amount"] for tx in filtered_txs)
            remaining = budget["amount"] - spent

            if spent > budget["amount"]:
                over_budget_count += 1
            else:
                under_budget_count += 1

            total_budget += budget["amount"]
            total_spent += spent

            budget_models.append(Budget(
                id=budget["id"],
                user_id=budget["user_id"],
                created_at=str(budget["created_at"]) if budget.get("created_at") else None,
                category=budget["category"],
                amount=cast_int(budget["amount"]),
                start_date=budget["start_date"],
                end_date=budget["end_date"],
                title=budget["title"],
                spent=cast_int(spent),
                remaining=cast_int(remaining),
                description=budget.get("description"),
                is_recurring=budget.get("is_recurring", False),
                recurring_frequency=budget.get("recurring_frequency"),
                notificationEnabled=budget.get("notificationEnabled", False),
                notificationsThreshold=budget.get("notificationsThreshold", 90.0),
            ))

        utilization = (total_spent / total_budget * 100) if total_budget > 0 else 0

        return BudgetStats(
            totalBudget=cast_int(total_budget),
            totalSpent=cast_int(total_spent),
            remainingBudget=cast_int(total_budget - total_spent),
            budgetUtilization=cast_int(utilization),
            overBudgetCount=cast_int(over_budget_count),
            underBudgetCount=cast_int(under_budget_count),
            budgets=budget_models,
            expiredRecurringBudgets=expired_recurring,
            expiredOneTimeBudgets=expired_one_time
        )

    except Exception as e:
        logger.error(f"Error getting budget stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/goals", response_model=GoalStats)
async def get_goal_stats(
    current_user: User = Depends(get_current_user)
):
    """Get goal statistics"""
    logger.info(f"Getting goal stats for user {current_user.id}")
    
    try:
    
        goals_response = supabase.table("financial_goals").select("*").eq("user_id", str(current_user.id)).execute()
        goals = goals_response.data or []
        
        if not goals:
            return GoalStats(
                totalGoals=0,
                completedGoals=0,
                activeGoals=0,
                totalContributions=0,
                averageContribution=0,
                topGoals=[]
            )
        
        total_goals = len(goals)
        completed_goals = sum(1 for goal in goals if goal["current_amount"] >= goal["target_amount"])
        active_goals = sum(1 for goal in goals if goal.get("is_active", True))
        total_contributions = sum(goal["current_amount"] for goal in goals)
        average_contribution = total_contributions / total_goals if total_goals > 0 else 0
        
        top_goals = []
        for goal in goals:
 
            end_date = datetime.fromisoformat(goal["end_date"].replace('Z', '+00:00'))
            days_left = max(0, (end_date - datetime.now()).days)
            progress = (goal["current_amount"] / goal["target_amount"] * 100) if goal["target_amount"] > 0 else 0
            remaining_amount = goal["target_amount"] - goal["current_amount"]
            recommended_daily = remaining_amount / days_left if days_left > 0 else 0
            
            top_goals.append(GoalProgress(
                id=str(goal["id"]),
                title=goal["title"],
                targetAmount=cast_int(goal["target_amount"]),  
                currentAmount=cast_int(goal["current_amount"]),  
                progress=cast_int(min(100, progress)),  
                daysLeft=days_left,
                recommendedDailyContribution=cast_int(max(0, recommended_daily)),  
            ))
        
        top_goals.sort(key=lambda x: x.progress, reverse=True)
        
        return GoalStats(
            totalGoals=cast_int(total_goals),
            completedGoals=cast_int(completed_goals),
            activeGoals=cast_int(active_goals),
            totalContributions=cast_int(total_contributions),
            averageContribution=cast_int(average_contribution),
            topGoals=top_goals[:10]  
        )
        
    except Exception as e:
        logger.error(f"Error getting goal stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/summary/month")
async def get_current_month_summary(current_user: User = Depends(get_current_user)):
    """Returns total income, total expenses, and balance for the current month"""
    try:
        today = datetime.now()
        start_of_month = today.replace(day=1)
        end_of_month = today

        transactions = get_filtered_transactions(
            str(current_user.id),
            start_of_month,
            end_of_month
        )

        full_name = current_user.full_name.lower()

        total_income = 0
        total_expenses = 0

        for tx in transactions:
            tx_type = tx["type"]
            if tx_type == "income":
                total_income += tx["amount"]
            elif tx_type == "deposit":
                total_income += tx["amount"]
            elif tx_type == "transfer" and tx.get("receiver", "").lower() == full_name:
                total_income += tx["amount"]
            elif tx_type == "expense":
                total_expenses += tx["amount"]

        balance = total_income - total_expenses

        return {
            "totalIncome": cast_int(total_income),
            "totalExpenses": cast_int(total_expenses),
            "balance": cast_int(balance),
        }

    except Exception as e:
        logger.error(f"Error getting current month summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/history")
async def get_historical_summary(current_user: User = Depends(get_current_user)):
    """Returns total income (including deposits and incoming transfers) and expenses"""
    try:
        today = datetime.now()
        start_last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        end_last_month = today.replace(day=1) - timedelta(days=1)
        start_last_3_months = (today.replace(day=1) - timedelta(days=90)).replace(day=1)

        full_name = current_user.full_name.lower()

        def calc_summary(start_date: Optional[datetime], end_date: Optional[datetime]):
            txs = get_filtered_transactions(str(current_user.id), start_date, end_date)
            income = 0
            expenses = 0

            for tx in txs:
                tx_type = tx["type"]
                if tx_type == "income":
                    income += tx["amount"]
                elif tx_type == "deposit":
                    income += tx["amount"]
                elif tx_type == "transfer" and tx.get("receiver", "").lower() == full_name:
                    income += tx["amount"]
                elif tx_type == "expense":
                    expenses += tx["amount"]

            return {
                "income": cast_int(income),
                "expenses": cast_int(expenses),
            }

        return {
            "lastMonth": calc_summary(start_last_month, end_last_month),
            "last3Months": calc_summary(start_last_3_months, today),
            "allTime": calc_summary(None, None),
        }

    except Exception as e:
        logger.error(f"Error getting historical summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
