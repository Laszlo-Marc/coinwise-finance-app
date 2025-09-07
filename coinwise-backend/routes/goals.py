import logging
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Path, Body, status
from uuid import UUID
import logging
from lib import get_supabase_client
from models.goals import FinancialGoal, GoalCreate, GoalUpdate, GoalsResponse
from routes.auth import get_current_user, User

security = HTTPBearer()
router = APIRouter()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("goals.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("goals_processor")
supabase: Client = get_supabase_client()



@router.get("/", response_model=GoalsResponse)
async def get_goals(current_user: User = Depends(get_current_user)):
    logger.info(f"Fetching goals for user {current_user.id}")
    try:
        query = (
            supabase.table("financial_goals")
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
        logger.error(f"Failed to fetch goals: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@router.post("/add", status_code=status.HTTP_201_CREATED, response_model=FinancialGoal)
async def add_goal(
    goal: GoalCreate = Body(...),
    current_user: User = Depends(get_current_user)
):
    goal_data = goal.dict()
    goal_data["user_id"] = str(current_user.id)

    try:
        res = supabase.table("financial_goals").insert(goal_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert goal")
        return res.data[0]

    except Exception as e:
        logger.error(f"Failed to add goal: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/edit/{goal_id}", response_model=FinancialGoal)
async def edit_goal(
    goal_id: UUID = Path(..., description="Transaction ID to edit"),
    goal_update: GoalUpdate = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Edit an existing goal.
    """
    logger.info(f"Editing goal {goal_id} for user {current_user.id}")
    
    try:
 
        existing_goal = supabase.table("financial_goals").select("*").eq("id", str(goal_id)).eq("user_id", current_user.id).execute()
        
        if not existing_goal.data:
            logger.warning(f"goal {goal_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="goal not found or you don't have permission to edit it"
            )
        
      
        update_data = {k: v for k, v in goal_update.dict().items() if v is not None}
        
        if not update_data:
            return existing_goal.data[0]
        
      
        response = supabase.table("financial_goals").update(update_data).eq("id", str(goal_id)).eq("user_id", current_user.id).execute()
        
        if not response.data:
            logger.error(f"Failed to update goal {goal_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update goal"
            )
            
        logger.info(f"Goal {goal_id} updated successfully")
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update goal: {str(e)}"
        )


@router.delete("/delete/{goal_id}", status_code=status.HTTP_200_OK)
async def delete_goal(
    goal_id: UUID = Path(..., description="Goal ID to delete"),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a goal.
    """
    logger.info(f"Deleting goal {goal_id} for user {current_user.id}")
    
    try:
       
        existing_goal = supabase.table("financial_goals").select("*").eq("id", str(goal_id)).eq("user_id", current_user.id).execute()
        
        if not existing_goal.data:
            logger.warning(f"Goal {goal_id} not found or does not belong to user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found or you don't have permission to delete it"
            )
        
        response = supabase.table("financial_goals").delete().eq("id", str(goal_id)).eq("user_id", current_user.id).execute()
        
        logger.info(f"Goal {goal_id} deleted successfully,response: {response.data}")
        return {"message": "Goal deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete goal: {str(e)}"
        )
