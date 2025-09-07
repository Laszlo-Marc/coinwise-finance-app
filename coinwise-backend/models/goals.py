from datetime import datetime
from sqlite3 import Date
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class FinancialGoal(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    title: str  
    description: str
    target_amount: float
    current_amount: float
    start_date: datetime
    end_date: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    category: str

    
class GoalUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    target_amount: Optional[float]
    start_date: Optional[str]  
    end_date: Optional[str]
    category: Optional[str]
    is_active: Optional[bool] = None  
    current_amount: Optional[float] = None 



class GoalsResponse(BaseModel):
    data: List[FinancialGoal]
    total_count: int
class GoalCreate(BaseModel):
    title: str
    description: str
    target_amount: float
    current_amount: float = 0
    start_date: str
    end_date: str
    is_active: bool = True
    category: Optional[str] = None  

class Contribution(BaseModel):
    goal_id: UUID
    amount: float
    date: str
class ContributionOut(BaseModel):
    id: str
    goal_id: str
    user_id: str
    amount: float
    date: Date
