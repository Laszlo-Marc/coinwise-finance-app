import logging
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Body, status
from typing import  List
import logging
from lib import get_supabase_client
from models.goals import Contribution, ContributionOut
from routes.auth import get_current_user, User
from routes.goals import FinancialGoal

security = HTTPBearer()
router = APIRouter()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("contributions.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("goals_processor")
supabase: Client = get_supabase_client()

@router.get("/", response_model=List[ContributionOut])
async def get_contributions_for_goal(
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all contributions for a specific goal.
    """
    logger.info(f"Fetching contributions for  user {current_user.id}")
    
    try:
        response = (
            supabase.table("goal_contributions")
            .select("*")
            .eq("user_id", str(current_user.id))
            .order("date", desc=True)
            .execute()
        )
        print(response.data)
        return response.data or []

    except Exception as e:
        logger.error(f"Failed to fetch contributions : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
    
@router.post("/add", status_code=status.HTTP_201_CREATED,response_model=FinancialGoal)
async def add_contribution(
    contribution: Contribution = Body(...),
    current_user: User = Depends(get_current_user)
):
   
    contribution_data = {
    "goal_id": str(contribution.goal_id),
    "amount": contribution.amount,
    "date": contribution.date,
    "user_id": str(current_user.id)
    }

  
    try:
      
        res = supabase.table("goal_contributions").insert(contribution_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert contribution")

        inserted_contribution = res.data[0]

    
        goal_id = contribution.goal_id
        goal_query = supabase.table("financial_goals").select("*").eq("id", str(goal_id)).eq("user_id", str(current_user.id)).execute()
        if not goal_query.data:
            raise HTTPException(status_code=404, detail="Goal not found or does not belong to user")

        goal = goal_query.data[0]
        updated_amount = goal["current_amount"] + contribution.amount

      
        update_res = (
            supabase.table("financial_goals")
            .update({"current_amount": updated_amount})
            .eq("id", str(goal_id))
            .eq("user_id", str(current_user.id))
            .execute()
        )

        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update goal amount")

        return update_res.data[0]

    except Exception as e:
        logger.error(f"Failed to add contribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))
