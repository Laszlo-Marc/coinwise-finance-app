from datetime import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException
import time
from supabase import Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID
import logging
import time
from lib import get_supabase_client
from models.transactions import PaginatedTransactions, Transaction, TransactionUpdate
from routes.auth import get_current_user, User
from service.budget_service import try_link_to_budget_and_update, update_budget_after_transaction_change
from service.transactions_service import find_near_duplicate_transactions
security = HTTPBearer()
router = APIRouter()
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

class DeduplicationResult(BaseModel):
    removed_count: int
    removed_ids: List[UUID]

@router.get("/", response_model=PaginatedTransactions)
async def get_transactions(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    logger.info(f"Fetching transactions for user {current_user.id}")
    

    try:
        query = supabase.table("transactions").select("*").eq("user_id", str(current_user.id))

        if category:
            query = query.eq("category", category)
        if transaction_type:
            query = query.eq("type", transaction_type)
        if start_date:
            query = query.gte("date", start_date)
        if end_date:
            query = query.lte("date", end_date)

        res = query.order("date", desc=True).execute()

        data = res.data if res.data else []
        total_count = len(data)

   
        start = (page - 1) * page_size
        end = start + page_size
        paginated_data = data[start:end]

        return {
            "data": paginated_data,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size
        }

    except Exception as e:
        logger.error(f"Failed to fetch transactions: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_transaction(
    transaction: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Adding transaction for user {current_user.id}")
    transaction["user_id"] = str(current_user.id)

    try:
        required_fields = ["amount", "date", "type"]
        print(f"Transaction data: {transaction}")
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

        elif tx_type == "income":
            pass  

        elif tx_type == "deposit":
            pass  

        else:
            raise HTTPException(status_code=400, detail=f"Invalid transaction type: {tx_type}")

        res = supabase.table("transactions").insert(transaction).execute()
        inserted_tx = res.data[0]

       
        if inserted_tx["type"] == "expense":
            await try_link_to_budget_and_update(
                inserted_tx, user_id=str(current_user.id)
            )
        logger.info(f"Transaction added successfully: {res.data}")
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert transaction")

        return inserted_tx

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/edit/{transaction_id}", response_model=Transaction)
async def edit_transaction(
    transaction_id: UUID = Path(..., description="Transaction ID to edit"),
    transaction_update: TransactionUpdate = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Edit an existing transaction.
    """
    logger.info(f"Editing transaction {transaction_id} for user {current_user.id}")
    
    try:
        
        existing_transaction = supabase.table("transactions").select("*").eq("id", str(transaction_id)).eq("user_id", current_user.id).execute()
        
        if not existing_transaction.data:
            logger.warning(f"Transaction {transaction_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found or you don't have permission to edit it"
            )
        
        
        update_data = {k: v for k, v in transaction_update.dict().items() if v is not None}
        
        if not update_data:
            return existing_transaction.data[0]
        
       
        response = supabase.table("transactions").update(update_data).eq("id", str(transaction_id)).eq("user_id", current_user.id).execute()
        
        if not response.data:
            logger.error(f"Failed to update transaction {transaction_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update transaction"
            )
        await update_budget_after_transaction_change(
    old_transaction=existing_transaction.data[0],
    action="edit",
    new_transaction=response.data[0] if response.data else None
)

        logger.info(f"Transaction {transaction_id} updated successfully")
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating transaction {transaction_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transaction: {str(e)}"
        )


@router.delete("/delete/{transaction_id}", status_code=status.HTTP_200_OK)
async def delete_transaction(
    transaction_id: UUID = Path(..., description="Transaction ID to delete"),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a transaction.
    """
    logger.info(f"Deleting transaction {transaction_id} for user {current_user.id}")
    
    try:

        existing_transaction = supabase.table("transactions").select("*").eq("id", str(transaction_id)).eq("user_id", current_user.id).execute()
      
        if not existing_transaction.data:
            logger.warning(f"Transaction {transaction_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found or you don't have permission to delete it"
            )
        old_tx = existing_transaction.data[0]
        if old_tx["type"] == "expense":
            await update_budget_after_transaction_change(
                old_transaction=old_tx,
                action="delete"
            )
      
        response = supabase.table("transactions").delete().eq("id", str(transaction_id)).eq("user_id", current_user.id).execute()
        
        logger.info(f"Transaction {transaction_id} deleted successfully")
        return {"message": "Transaction deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transaction {transaction_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete transaction: {str(e)}"
        )



@router.post("/fix-transfer-names")
async def fix_transfer_names(current_user: User = Depends(get_current_user)):
    try:
        
        response = supabase.from_("transactions").select("*").eq("user_id", current_user.id).eq("type", "transfer").execute()
        transfers = response.data or []

        updates = []
        for tx in transfers:
            update_fields = {}
            if not tx.get("sender") or tx.get("sender") == "unknown" or tx.get("sender") == "Unknown": 
                update_fields["sender"] = current_user.full_name
            if not tx.get("receiver") or tx.get("receiver") == "unknown" or tx.get("receiver") == "Unknown":
                update_fields["receiver"] = current_user.full_name

            if update_fields:
                updates.append({
                    "id": tx["id"],
                    **update_fields
                })

       
        for update in updates:
            supabase.from_("transactions").update(update).eq("id", update["id"]).execute()

        return {"message": f"{len(updates)} transfer transactions updated."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fix transfer names: {str(e)}")


@router.delete("/remove-duplicates", response_model=DeduplicationResult)
async def remove_duplicate_transactions(
    current_user: User = Depends(get_current_user),
):
    try:
        logger.info(f"Starting duplicate removal for user {current_user.id}")
        all_txs = supabase.table("transactions").select("*").eq("user_id", str(current_user.id)).execute().data
        if not all_txs:
            return DeduplicationResult(removed_count=0, removed_ids=[])

        duplicate_ids = find_near_duplicate_transactions(all_txs)

        if duplicate_ids:
            for tx_id in duplicate_ids:
                supabase.table("transactions").delete().eq("id", tx_id).execute()
            logger.info(f"Removed {len(duplicate_ids)} duplicate transactions")
        else:
            logger.info("No duplicates found")

        return DeduplicationResult(removed_count=len(duplicate_ids), removed_ids=duplicate_ids)

    except Exception as e:
        logger.error(f"Error during deduplication: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove duplicate transactions")

@router.get("/filter", response_model=PaginatedTransactions)
async def filter_transactions(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("date"),  
    sort_order: Optional[str] = Query("desc")  
):
    logger.info(f"Filtering transactions for user {current_user.id}")

    try:
        query = supabase.table("transactions").select("*").eq("user_id", str(current_user.id))

        if category:
            query = query.eq("category", category)
        if transaction_type:
            query = query.eq("type", transaction_type)
        if start_date:
            query = query.gte("date", start_date)
        if end_date:
            query = query.lte("date", end_date)

        # Sorting
        if sort_by not in ["date", "amount"]:
            raise HTTPException(status_code=400, detail="Invalid sort_by parameter")
        if sort_order not in ["asc", "desc"]:
            raise HTTPException(status_code=400, detail="Invalid sort_order parameter")

        query = query.order(sort_by, desc=(sort_order == "desc"))
        full_data = query.execute().data or []

        total_count = len(full_data)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = full_data[start:end]

        return {
            "data": paginated,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size
        }

    except Exception as e:
        logger.error(f"Error filtering transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to filter transactions")
