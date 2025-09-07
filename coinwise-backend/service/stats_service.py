from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict
import logging
from supabase import Client
from lib import get_supabase_client
from models.stats import (
TrendPoint, Transaction
)
router = APIRouter()
logger = logging.getLogger("stats_processor")
supabase: Client = get_supabase_client()

# --- Helper Functions ---

def cast_int(value):
    return int(round(value))

def cast_transaction_fields_to_int(transactions: List[Dict[str, Any]]) -> List[Transaction]:
    for tx in transactions:
        tx["amount"] = cast_int(tx["amount"])
    return [Transaction(**tx) for tx in transactions]

def parse_date_range(start_date: Optional[str], end_date: Optional[str], range_param: Optional[str] = None):
    if range_param:
        today = datetime.now().date()
        if range_param == "last_6_months":
            start, end = today - timedelta(days=180), today
        elif range_param == "last_3_months":
            start, end = today - timedelta(days=90), today
        elif range_param == "last_month":
            start, end = today - timedelta(days=30), today
        elif range_param == "this_month":
            start, end = today.replace(day=1), today
        elif range_param == "this_year":
            start, end = today.replace(month=1, day=1), today
        else:
            raise HTTPException(status_code=400, detail="Invalid range parameter")

        return start.isoformat(), end.isoformat()
    return start_date, end_date

def get_filtered_transactions(user_id: str, start_date: str = None, end_date: str = None, transaction_type: str = None):
    query = supabase.table("transactions").select("*").eq("user_id", user_id)
    if transaction_type:
        query = query.eq("type", transaction_type)
    if start_date:
        query = query.gte("date", start_date)
    if end_date:
        query = query.lte("date", end_date)
    return query.execute().data or []

def calculate_trend_data(transactions: List[dict], granularity: str = "monthly") -> List[TrendPoint]:
    period_data = defaultdict(lambda: {"amount": 0, "count": 0})
    for tx in transactions:
        if not tx.get("date"):
            continue
        period = tx["date"][:7] if granularity == "monthly" else tx["date"][:10]
        period_data[period]["amount"] += tx["amount"]
        period_data[period]["count"] += 1

    trend_data = []
    for period in sorted(period_data):
        trend_data.append(TrendPoint(
            period=period,
            amount=cast_int(period_data[period]["amount"]),
            count=period_data[period]["count"]
        ))
    return trend_data

def convert_transaction_to_model(tx_dict: Dict[str, Any]) -> Transaction:
    """Convert transaction dictionary to Transaction model with proper types"""
    return Transaction(
        id=tx_dict["id"],
        user_id=tx_dict["user_id"], 
        type=tx_dict["type"],
        amount=cast_int(tx_dict["amount"]), 
        currency=tx_dict.get("currency"),
        category=tx_dict.get("category"),
        sender=tx_dict.get("sender"),
        receiver=tx_dict.get("receiver"),
        description=tx_dict.get("description"),
        date=tx_dict["date"],
        created_at=tx_dict.get("created_at"),
        merchant=tx_dict.get("merchant")
    )
