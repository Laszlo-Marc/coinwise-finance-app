from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    amount: float
    date: str  
    description: Optional[str] = None
    type: Literal["expense", "income", "deposit", "transfer"]
    user_id: Optional[UUID] = None
    currency: Optional[str] = "RON"
    category: Optional[str] = None
    merchant: Optional[str] = None
    sender: Optional[str] = None
    receiver: Optional[str] = None

class Transaction(BaseModel):
    id: UUID  
    amount: float
    date: str
    description: Optional[str] = None
    user_id: UUID
    type: Literal["expense", "income", "deposit", "transfer"]
    currency: Optional[str] = None
    category: Optional[str] = None
    merchant: Optional[str] = None
    sender: Optional[str] = None
    receiver: Optional[str] = None

class PaginatedTransactions(BaseModel):
    data: List[Transaction]
    total_count: int
    page: int
    page_size: int
    total_pages: int

class TransactionUpdate(BaseModel):
    date: Optional[str] = Field(None, description="Transaction date in YYYY-MM-DD format")
    amount: Optional[float] = Field(None, description="Transaction amount")
    currency: Optional[str] = Field(None, description="Currency code")
    description: Optional[str] = Field(None, description="Transaction description")
    category: Optional[str] = Field(None, description="Transaction category")
    type: Optional[str] = Field(None, description="Transaction type: expense, income, deposit, transfer")
    merchant: Optional[str] = Field(None, description="Merchant name (for expenses)")
    sender: Optional[str] = Field(None, description="Sender name (for transfers)")
    receiver: Optional[str] = Field(None, description="Receiver name (for transfers)")
