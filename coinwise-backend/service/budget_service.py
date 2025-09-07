from datetime import datetime
import logging
from typing import Any, Dict, List, Optional

from supabase import Client

from lib import get_supabase_client


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("transaction_processing.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("transaction_processor")


supabase: Client = get_supabase_client()
def auto_link_transactions_to_budgets(user_id: str, transaction_ids: List[str]):
    logger.info("Linking transactions to active budgets...")


    budgets_res = (
        supabase.table("budgets")
        .select("id, category, start_date, end_date")
        .eq("user_id", user_id)
        .execute()
    )
    if not budgets_res.data:
        logger.info("No active budgets found.")
        return

    
    budgets_by_category = {}
    for budget in budgets_res.data:
        cat = budget["category"]
        budgets_by_category.setdefault(cat, []).append({
            "id": budget["id"],
            "start_date": datetime.fromisoformat(budget["start_date"]),
            "end_date": datetime.fromisoformat(budget["end_date"]),
        })

    transactions_res = (
        supabase.table("transactions")
        .select("id, category, date")
        .in_("id", transaction_ids)
        .eq("user_id", user_id)
        .execute()
    )
    if not transactions_res.data:
        logger.warning("No matching transactions found.")
        return

    links_to_insert = []

    for tx in transactions_res.data:
        tx_id = tx["id"]
        tx_cat = tx.get("category")
        tx_date = datetime.fromisoformat(tx.get("date"))

        matching_budgets = budgets_by_category.get(tx_cat, [])
        for budget in matching_budgets:
            if budget["start_date"] <= tx_date <= budget["end_date"]:
                links_to_insert.append({
                    "budget_id": budget["id"],
                    "transaction_id": tx_id,
                })

    if links_to_insert:
        supabase.table("budget_transactions").insert(links_to_insert).execute()
        logger.info(f"Linked {len(links_to_insert)} transactions to budgets.")
    else:
        logger.info("No matching budget-category-date combinations found.")


async def try_link_to_budget_and_update(transaction: Dict[str, Any], user_id: str):
    category = transaction.get("category")
    tx_date = datetime.fromisoformat(transaction["date"])

  
    res = supabase.table("budgets").select("*").eq("user_id", user_id).eq("category", category).execute()
    budgets = res.data if res.data else []


    for budget in budgets:
        start_date = datetime.fromisoformat(budget["start_date"])
        end_date = datetime.fromisoformat(budget["end_date"])

        if start_date <= tx_date <= end_date:
            budget_id = budget["id"]

        
            supabase.table("budget_transactions").insert({
                "budget_id": budget_id,
                "transaction_id": transaction["id"]
            }).execute()

          
            new_spent = float(budget["spent"]) + float(transaction["amount"])
            new_remaining = float(budget["amount"]) - new_spent

            supabase.table("budgets").update({
                "spent": new_spent,
                "remaining": new_remaining
            }).eq("id", budget_id).execute()

            logger.info(f"Transaction linked to budget {budget_id}")
            return  

    logger.info("No matching budget found for transaction")

async def update_budget_after_transaction_change(
    old_transaction: Dict[str, Any],
    action: str,
    new_transaction: Optional[Dict[str, Any]] = None
):
    tx_id = old_transaction["id"]
    old_amount = float(old_transaction["amount"])
    user_id = old_transaction["user_id"]

    link_res = supabase.table("budget_transactions")\
        .select("budget_id")\
        .eq("transaction_id", tx_id).execute()

    if not link_res.data:
        return

    budget_id = link_res.data[0]["budget_id"]
    budget_res = supabase.table("budgets").select("*").eq("id", budget_id).single().execute()
    if not budget_res.data:
        return

    budget = budget_res.data
    current_spent = float(budget.get("spent", 0))

    if action == "delete":
        new_spent = max(current_spent - old_amount, 0)
        new_remaining = float(budget["amount"]) - new_spent

        supabase.table("budgets").update({
            "spent": new_spent,
            "remaining": new_remaining
        }).eq("id", budget_id).execute()

        supabase.table("budget_transactions").delete().eq("transaction_id", tx_id).execute()

    elif action == "edit" and new_transaction:
        new_amount = float(new_transaction["amount"])
        category_changed = old_transaction.get("category") != new_transaction.get("category")
        date_changed = old_transaction.get("date") != new_transaction.get("date")
        amount_changed = new_amount != old_amount

        if category_changed or date_changed:
            
            new_spent = max(current_spent - old_amount, 0)
            new_remaining = float(budget["amount"]) - new_spent

            supabase.table("budgets").update({
                "spent": new_spent,
                "remaining": new_remaining
            }).eq("id", budget_id).execute()

            supabase.table("budget_transactions").delete().eq("transaction_id", tx_id).execute()

          
            await try_link_to_budget_and_update(new_transaction, user_id)

        elif amount_changed:
            delta = new_amount - old_amount
            new_spent = max(current_spent + delta, 0)
            new_remaining = float(budget["amount"]) - new_spent

            supabase.table("budgets").update({
                "spent": new_spent,
                "remaining": new_remaining
            }).eq("id", budget_id).execute()
