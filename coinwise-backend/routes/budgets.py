import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Path, Body, status
from typing import Any, Dict, Optional
import logging
from datetime import datetime
from lib import get_supabase_client
from models.budgets import Budget, BudgetCreate, BudgetUpdate, BudgetsResponse
from routes.auth import get_current_user, User

security = HTTPBearer()
router = APIRouter()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("budgets.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("budgets_processor")
supabase: Client = get_supabase_client()

   



@router.get("/", response_model=BudgetsResponse)
async def get_budgets(current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching budgets for user {current_user.id}")
    try:
        query = (
            supabase.table("budgets")
            .select("*")
            .eq("user_id", str(current_user.id))
            .execute()
        )

        data = query.data if query.data else []
        total_count = len(data)
        return {
            "data": data,
            "total_count": total_count,
        }

    except Exception as e:
        logger.error(f"Failed to fetch budgets: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@router.post("/add", status_code=status.HTTP_201_CREATED, response_model=Budget)
async def add_budget(
    budget: BudgetCreate = Body(...),
    current_user: User = Depends(get_current_user)
):
    budget_data = budget.dict()
    budget_data["user_id"] = str(current_user.id)

    try:
        res = supabase.table("budgets").insert(budget_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert budget")
        return res.data[0]

    except Exception as e:
        logger.error(f"Failed to add budget: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/edit/{budget_id}", response_model=Budget)
async def edit_budget(
    budget_id: UUID = Path(..., description="Transaction ID to edit"),
    budget_update: BudgetUpdate = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Edit an existing budget.
    """
    logger.info(f"Editing budget {budget_id} for user {current_user.id}")
    
    try:
       
        existing_budget = supabase.table("budgets").select("*").eq("id", str(budget_id)).eq("user_id", current_user.id).execute()
        
        if not existing_budget.data:
            logger.warning(f"Budget {budget_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found or you don't have permission to edit it"
            )
        
      
        update_data = {k: v for k, v in budget_update.dict().items() if v is not None}
        
        if not update_data:
            return existing_budget.data[0]
        
        
        response = supabase.table("budgets").update(update_data).eq("id", str(budget_id)).eq("user_id", current_user.id).execute()
        
        if not response.data:
            logger.error(f"Failed to update budget {budget_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update budget"
            )
            
        logger.info(f"Budget {budget_id} updated successfully")
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating budget {budget_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update budget: {str(e)}"
        )

@router.delete("/delete/{budget_id}", status_code=status.HTTP_200_OK)
async def delete_budget(
    budget_id: UUID = Path(..., description="Budget ID to delete"),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a budget.
    """
    logger.info(f"Deleting budget {budget_id} for user {current_user.id}")
    
    try:
        
        existing_budget = supabase.table("budgets").select("*").eq("id", str(budget_id)).eq("user_id", current_user.id).execute()
        
        if not existing_budget.data:
            logger.warning(f"Budget {budget_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found or you don't have permission to delete it"
            )
        
        response = supabase.table("budgets").delete().eq("id", str(budget_id)).eq("user_id", current_user.id).execute()
        
        logger.info(f"Budget {budget_id} deleted successfully,response: {response.data}")
        return {"message": "Budget deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting budget {budget_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete budget: {str(e)}"
        )
@router.get("/all/budget-transactions")
async def get_all_budget_transactions(
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all transactions linked to all budgets for the user.
    Returns a mapping of { budget_id: [transactions] }
    """
    try:
    
        budgets_res = (
            supabase.table("budgets")
            .select("id")
            .eq("user_id", current_user.id)
            .execute()
        )

        budget_ids = [b["id"] for b in budgets_res.data]
        print(f"Found {len(budget_ids)} budgets for user {current_user.id}")
        if not budget_ids:
            return {}

      
        links_res = (
            supabase.table("budget_transactions")
            .select("budget_id, transaction_id")
            .in_("budget_id", budget_ids)
            .execute()
        )
        print(f"Found {len(links_res.data)} budget-transaction links")
        if not links_res.data:
            return {}

       
        budget_to_tx_ids = {}
        all_tx_ids = set()

        for link in links_res.data:
            b_id = link["budget_id"]
            t_id = link["transaction_id"]
            budget_to_tx_ids.setdefault(b_id, []).append(t_id)
            all_tx_ids.add(t_id)

     
        tx_res = (
            supabase.table("transactions")
            .select("*")
            .in_("id", list(all_tx_ids))
            .eq("user_id", current_user.id)
            .order("date", desc=True)
            .execute()
        )

        if not tx_res.data:
            return {}

      
        tx_map = {tx["id"]: tx for tx in tx_res.data}
        print(f"Fetched {tx_map} transactions for user {current_user.id}")

        print({budget_id: [tx_map[tx_id] for tx_id in tx_ids if tx_id in tx_map]
            for budget_id, tx_ids in budget_to_tx_ids.items()})
        result = {
            budget_id: [tx_map[tx_id] for tx_id in tx_ids if tx_id in tx_map]
            for budget_id, tx_ids in budget_to_tx_ids.items()
        }

        return result

    except Exception as e:
        logger.error(f"Error fetching all budget transactions: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/add-for-budget", status_code=status.HTTP_201_CREATED)
async def add_transaction(
    transaction: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    budget_id: Optional[UUID] = Query(None, description="Optional budget ID to link the transaction to"),
):
    logger.info(f"Adding transaction for user {current_user.id}")
    transaction["user_id"] = str(current_user.id)
    logger.info(f"Transaction category: {transaction.get('category')} — Linking to budget_id: {budget_id}")

    try:
        required_fields = ["amount", "date", "type"]
        for field in required_fields:
            if field not in transaction:
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")

        tx_type = transaction["type"]

    
        if tx_type == "expense":
            for f in ["category", "merchant"]:
                if f not in transaction:
                    raise HTTPException(status_code=400, detail=f"Missing field: {f}")
            transaction.setdefault("currency", "RON")
        elif tx_type == "transfer":
            for f in ["sender", "receiver"]:
                if f not in transaction:
                    raise HTTPException(status_code=400, detail=f"Missing field: {f}")
        elif tx_type not in ["income", "deposit"]:
            raise HTTPException(status_code=400, detail=f"Invalid transaction type: {tx_type}")

     
        res = supabase.table("transactions").insert(transaction).execute()

        if not res.data or not res.data[0].get("id"):
            raise HTTPException(status_code=500, detail="Transaction insertion failed")

        transaction_id = res.data[0]["id"]

      
        tx_res = (
            supabase
            .table("transactions")
            .select("*")
            .eq("id", transaction_id)
            .limit(1)
            .execute()
        )

        if not tx_res.data:
            raise HTTPException(status_code=500, detail="Failed to fetch inserted transaction")

        full_transaction = tx_res.data[0]

        logger.info(f"Transaction added: {res.data}")

        if not res.data or not res.data[0].get("id"):
            raise HTTPException(status_code=500, detail="Transaction insertion failed")

        transaction_id = res.data[0]["id"]

        if budget_id:
            budget_check = (
                supabase.table("budgets")
                .select("*")
                .eq("id", str(budget_id))
                .eq("user_id", str(current_user.id))
                .limit(1)
                .execute()
            )

            if not budget_check.data:
                raise HTTPException(status_code=404, detail="Budget not found or does not belong to user")

            budget = budget_check.data[0]


            if budget["category"] != transaction["category"]:
                raise HTTPException(
                    status_code=400,
                    detail="Budget category does not match transaction category"
            )

           

            tx_date = datetime.fromisoformat(transaction["date"])
            start_date = datetime.fromisoformat(budget["start_date"])
            end_date = datetime.fromisoformat(budget["end_date"])

            if not (start_date <= tx_date <= end_date):
                raise HTTPException(
                    status_code=400,
                    detail="Transaction date is outside of budget time range"
            )

            link_res = (
                supabase.table("budget_transactions")
                .insert({
                    "budget_id": str(budget_id),
                    "transaction_id": transaction_id
                })
                .execute()
            )
            logger.info(f"Transaction linked to budget: {link_res.data}")


            if tx_type == "expense":
                budget_res = (
                    supabase.table("budgets")
                    .select("spent, remaining")
                    .eq("id", str(budget_id))
                    .eq("user_id", current_user.id)
                    .limit(1)
                    .execute()
                )

                if not budget_res.data:
                    raise HTTPException(status_code=404, detail="Budget not found")

                spent = budget_res.data[0].get("spent", 0)
                remaining = budget_res.data[0].get("remaining", 0)
                amount = transaction["amount"]

                new_spent = spent + amount
                new_remaining = max(0, remaining - amount)

                update_res = (
                    supabase.table("budgets")
                    .update({
                        "spent": new_spent,
                        "remaining": new_remaining
                    })
                    .eq("id", str(budget_id))
                    .eq("user_id", current_user.id)
                    .execute()
                )
                logger.info(f"Budget updated: {update_res.data}")

        return full_transaction

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
