from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class Budget(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    category: str
    amount:float
    spent:float
    remaining:float
    start_date:str
    end_date:str
    created_at:str
    is_recurring: bool = False
    recurring_frequency: Optional[Literal['daily', 'weekly', 'monthly']] = None
    description: Optional[str] = None
    notificationsEnabled: Optional[bool] = False
    notificationsThreshold: Optional[int] 
   

class BudgetsResponse(BaseModel):
    data: List[Budget]

class BudgetCreate(BaseModel):
    title: str
    category: str
    amount:float
    spent:float
    remaining:float
    start_date:str
    end_date:str
    is_recurring: bool = False
    recurring_frequency: Optional[Literal['daily', 'weekly', 'monthly']] = None
    description: Optional[str] = None
    notificationsEnabled: Optional[bool] = False
    notificationsThreshold: Optional[int] 
    
 

class BudgetUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[str] = None 
    end_date: Optional[str] = None 
    category: Optional[str] = None
    amount: Optional[float] = None
    created_at: Optional[str] = None
    spent: Optional[float] = None
    remaining: Optional[float] = None
    is_recurring: Optional[bool] = None
    recurring_frequency: Optional[Literal['daily', 'weekly', 'monthly']] = None
    notificationsEnabled: Optional[bool] = False
    notificationsThreshold: Optional[int]
    