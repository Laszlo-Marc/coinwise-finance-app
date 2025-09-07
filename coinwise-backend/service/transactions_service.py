from typing import List, Dict, Tuple
from collections import defaultdict
from difflib import SequenceMatcher

def normalize_str(value: str) -> str:
    """Lowercase and strip a string for comparison."""
    return value.strip().lower() if isinstance(value, str) else ""

def similar(a: str, b: str, threshold: float = 0.9) -> bool:
    """Return True if two strings are similar above a given threshold."""
    return SequenceMatcher(None, normalize_str(a), normalize_str(b)).ratio() >= threshold

def is_duplicate(tx1: Dict, tx2: Dict, threshold: float = 0.9) -> bool:
    """Determine if two transactions are considered duplicates."""
    if tx1["type"] != tx2["type"]:
        return False

    if round(tx1["amount"], 2) != round(tx2["amount"], 2):
        return False

    if tx1["date"] != tx2["date"]:
        return False

    tx_type = tx1["type"]
    
    if tx_type == "expense":
        return (
            similar(tx1.get("description", ""), tx2.get("description", ""), threshold)
            and similar(tx1.get("merchant", ""), tx2.get("merchant", ""), threshold)
        )
    elif tx_type == "income" or tx_type == "deposit":
        return similar(tx1.get("description", ""), tx2.get("description", ""), threshold)
    elif tx_type == "transfer":
        return (
            similar(tx1.get("description", ""), tx2.get("description", ""), threshold)
            and similar(tx1.get("sender", ""), tx2.get("sender", ""), threshold)
            and similar(tx1.get("receiver", ""), tx2.get("receiver", ""), threshold)
        )

    return False

def find_near_duplicate_transactions(transactions: List[Dict], threshold: float = 0.9) -> List[str]:
    """Detect near-duplicate transactions across expenses, income, deposits, and transfers."""
    duplicates = []
    visited = set()

    for i in range(len(transactions)):
        for j in range(i + 1, len(transactions)):
            tx1, tx2 = transactions[i], transactions[j]
            key_pair = tuple(sorted([tx1["id"], tx2["id"]]))

            if key_pair in visited:
                continue

            if is_duplicate(tx1, tx2, threshold):
                duplicates.append(tx2["id"]) 
                visited.add(key_pair)

    return duplicates
