from datetime import datetime
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from supabase import Client
from together import Together
from lib import get_supabase_client
from routes.auth import User
import re
import json
import time
from uuid import uuid4
from typing import List, Optional, Tuple, Dict
import logging
from routes.auth import User
from lib import get_supabase_client

security = HTTPBearer()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("transaction_processing.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("transaction_processor")
client = Together()

supabase: Client = get_supabase_client()



class Transaction(BaseModel):
    description: str = Field(..., description="Short summary of the transaction (e.g. 'Plata la POS la Mega Image').")
    amount: float = Field(..., description="Transaction amount as a number (e.g. 59.99).")
    type: str = Field(..., description="Transaction type: 'expense', 'income', 'transfer', or 'deposit'.")
    date: str = Field(..., description="Transaction date in 'YYYY-MM-DD' format.")
    currency: str = Field(..., description="Currency code (e.g. 'RON', 'EUR').")
    merchant: Optional[str] = Field(None, description="Merchant name (for expenses).")
    category: Optional[str] = Field(None, description="Category for expenses (e.g. 'Groceries').")
    sender: Optional[str] = Field(None, description="Sender name (for transfers).")
    receiver: Optional[str] = Field(None, description="Receiver name (for transfers).")

class TransactionList(BaseModel):
    root : List[Transaction]

def generate_flexible_name_pattern(full_name: str) -> str:
    """Creates a regex pattern to match name with optional spaces, hyphens, or newlines."""
    parts = re.split(r'\s+', full_name.strip())
    return r'[\s\-]*'.join(map(re.escape, parts))

async def anonymize_text(text: str, current_user: User) -> Tuple[str, str, Dict[str, str]]:
    logger.info("Starting text anonymization process")
    start_time = time.time()

    new_text = text
    entity_map = {}
    user_full_name = current_user.full_name


    logger.info("Anonymizing user's full name: %s", user_full_name)

    name_pattern = generate_flexible_name_pattern(user_full_name)
    name_regex = re.compile(name_pattern, flags=re.IGNORECASE | re.MULTILINE)

    match = name_regex.search(new_text)
    if match:
        anon_name = f"@name_{uuid4().hex[:6]}"
        new_text = name_regex.sub(anon_name, new_text)
        entity_map[anon_name] = user_full_name
        logger.info(f"Anonymized user name: {user_full_name} -> {anon_name}")
    else:
        logger.warning("User's name not found in the text.")


    logger.info("Anonymizing IBANs and card numbers")

    patterns = [
        (r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b", "@iban_"),
        (r"\b(?:\d[ -]*?){13,16}\b", "@card_")
    ]

    for pattern, prefix in patterns:
        matches = re.findall(pattern, new_text)
        logger.debug(f"Found {len(matches)} matches for pattern {pattern}")

        for match in matches:
            anon_id = f"{prefix}{uuid4().hex[:6]}"
            new_text = new_text.replace(match, anon_id)


    entity_map_id = str(uuid4())
    try:
        response = supabase.table("entity_maps").insert({
            "id": entity_map_id,
            "user_id": current_user.id,
            "entity_map": json.dumps(entity_map),
        }).execute()
        logger.info(f"Entity map stored successfully: {response.model_dump_json()}")
    except Exception as e:
        logger.error(f"Error storing entity map: {str(e)}")

    elapsed = time.time() - start_time
    logger.info(f"Anonymization complete in {elapsed:.2f}s")

    return new_text, entity_map_id, entity_map

def sections_extraction(raw_text):
    logger.info("Starting transaction sections extraction")
    

    sections_system_prompt = """
   You are a financial document extraction engine specialized in identifying and isolating only the transaction-related content from messy and unstructured Romanian and international bank statements (including Revolut). 

    Your task is to accurately identify and extract :

    1. The sections containing transactions. These are typically structured or semi-structured lines that may contain:
    - A date (optional, may be missing or partial)
    - A description (merchant, reference, transfer, ATM, etc.)
    - An amount (positive or negative)
    - A currency 

    2. The **final money in (total credit)** and **money out (total debit)** amounts from the end of the statement — if present. These typically appear as total incoming and outgoing transactions for the period and may be labeled differently by each bank.

    You must ignore:
    - Headers, footers, page numbers, disclaimers
    - Balances entries that appear inside or between transactions, account details, bank logos, and summaries
    - Any content before or after the transaction list
    - Any commentary, instructions, or metadata

    Behave like a black-box extraction tool. Do not return any explanation, formatting, comments, or instructions. Only return the **exact transaction section raw text**, as it appears in the original document, cleaned of irrelevant parts. Your output must be a valid JSON with the following shape:

 
    {
    "transactions": "<full transaction text only>",
    "money_in": "<total money in from final summary>",
    "money_out": "<total money out from final summary>"
    }
    """
    sections_user_prompt = f"""
    Below is the full raw text extracted from a Romanian bank statement PDF. Extract:

    1. Only the lines representing transactions — skip any intermediate or daily totals, balances, or non-transaction lines.
    2. The final total money in and money out values from the end of the statement.

    Return a JSON object as explained.
    
    {raw_text}
   
    """

    logger.info("Sending request to Together API for sections extraction")
    response = client.chat.completions.create(
        model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages=[
            {"role": "system", "content": sections_system_prompt},
            {"role": "user", "content": sections_user_prompt}
        ],
        temperature=0.01,
        max_tokens=50000,
        stream=False,
        
        )
    raw_content = response.choices[0].message.content
    print("Raw content from Together API:", raw_content)
    cleaned_json_str = re.sub(r'^```json\n|```$', '', raw_content.strip())

   
    try:
        parsed_data = json.loads(cleaned_json_str)
        
        return parsed_data["transactions"], parsed_data["money_in"], parsed_data["money_out"]
    except json.JSONDecodeError as e:
        print("JSON parsing failed:", e)


  

def normalize_and_extract(raw_text: str):
    logger.info("Starting transaction preprocessing and classification")
    

    normalization_system_prompt = """
   You are a text normalization engine for financial data. Your job is to take raw transaction text extracted from a bank statement and restructure it so that each transaction is placed entirely on a single line.
    Instructions:
    - Join any multi-line transactions into one single line per transaction.
    - Do not add or remove any content beyond fixing line breaks and spacing.
    - Preserve the order of transactions exactly as they appear.
    - If a transaction spans multiple lines, concatenate them with a space.
    - Do not merge separate transactions.
    - Return only the cleaned transaction section as plain text. No formatting, no explanations, no extra characters.

    Your output must look like a list of transactions, one per line, fully flattened.
    """
    normalization_user_prompt = f"""
   Here is the transaction section. Flatten each transaction so it appears entirely on one line:
    {raw_text}
    """

    norm_response = client.chat.completions.create(
        model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages=[
            {"role": "system", "content": normalization_system_prompt},
            {"role": "user", "content": normalization_user_prompt}
        ],
        temperature=0.01,
        max_tokens=50000
    )

    normalized_text = norm_response.choices[0].message.content.strip()
    print("Normalized text:", normalized_text)
    extraction_system_prompt = """
   You are a financial transaction parser.

You will receive a block of text where each line represents a single normalized bank transaction. Your task is to extract all valid transactions and return a list of structured JSON objects — one for each line.

For each transaction, extract the following fields:

---

**Required Fields:**

- `"date"`: must be a string in strict "YYYY-MM-DD" format.
  - Convert formats like "01/03/2025" to "2025-03-01".
  - If the line does not contain a valid date:
    - Inherit the most recent valid date from above.
    - Assume transactions are in chronological order.
    - Do not hallucinate or guess dates.

- `"amount"`: float, representing the transaction amount (e.g., 59.99).
  - The `"amount"` should always be a positive float.
  - Do NOT include a negative sign even for expenses or transfers.
  - Directionality is encoded in the `"type"` field.

- `"currency"`: string like "RON", "EUR", etc. If unknown, use `"unknown"`.

- `"type"`: must be one of:
  - `"expense"` → money going out (POS payments, bills, purchases)
  - `"income"` → money coming in (salary, reimbursements, etc.)
  - `"deposit"` → cash or ATM deposits (e.g., labeled "DEP", "Depunere", or ATM)
  - `"transfer"` → account-to-account or P2P movements (e.g., Revolut, BT Pay)

> Do not classify a transfer as income or expense. If both sender and receiver are present, or the line includes phrases like "Transfer către", "Sent from", "catre", "from", "to", treat it as a `"transfer"`.

---

**Description Formatting Rules:**

- `"description"`: a short, clean, human-readable summary of the transaction.
  - **For expenses**: include the merchant or brand (e.g., `"POS payment at Mega Image"`, `"Payment to Netflix"`).
  - **For transfers**: describe who sent or received (e.g., `"Transfer from Alice to Bob"`).
  - **For income**: show the source (e.g., `"Salary from Company SRL"` or `"Transfer from Revolut"`).
  - **For deposits**: e.g., `"Cash deposit at ATM"`.

Do **NOT** include full raw lines, card numbers, IBANs, technical references, or codes.
Do summarize what a human would expect to see in a finance app.

---

**Optional Fields (include only if present and valid):**

- `"merchant"`: string — **only for `"expense"` transactions**
  - Extract from the merchant name if available. Prefer names that contain `"SRL"`, `"S.A."`, `"GmbH"`, etc.
  - If the line includes a `To:` field, use the company listed after `To:` as the merchant.
  - Do **NOT** use POS terminal codes, TIDs, card processors, or internal labels as merchants.

- `"category"`: string — **only for `"expense"` transactions**.
  Must be one of the following categories (use "Other" if no clear match):
    - "Groceries" → supermarket, food essentials, mini-markets
    - "Food & Takeout" → restaurants, cafes, fast food, takeout
    - "Shopping" → clothing, retail, personal purchases
    - "Transportation" → fuel, taxis, public transport
    - "Utilities" → electricity, water, gas, internet
    - "Entertainment" → movies, games, concerts
    - "Health" → pharmacy, doctor visits, gym memberships, wellness apps
    - "Travel" → flights, hotels, vacations
    - "Education" → school fees, books, courses
    - "Housing" → rent, mortgage, home repairs
    - "Subscriptions" → Netflix, Spotify, SaaS services
    - "Other" → fallback for uncategorized expenses
- Do **NOT** invent or guess new categories outside of this list.

- `"sender"`: string — for `"transfer"` transactions only.
- `"receiver"`: string — for `"transfer"` transactions only.

---

**Output Format:**

- Return a valid **JSON array** of transactions.
- Each transaction must be a **JSON object**.
- Do **NOT** return markdown, code blocks, explanations, comments, or anything outside the array.

---

**Strict Rules:**
- Every transaction must include: `"date"`, `"amount"`, `"currency"`, `"type"`, and `"description"`.
- NEVER copy the full raw transaction line into `"description"`.
- NEVER include card numbers, IBANs, metadata, RRN, TID, or technical codes.
- NEVER generate keys outside the allowed schema.

    """ 
    extraction_user_prompt = f"""
    Here are the cleaned transactions, one per line. Extract structured transactions as described:

    {normalized_text}
    """

    extract_response = client.chat.completions.create(
        model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages=[
            {"role": "system", "content": extraction_system_prompt},
            {"role": "user", "content": extraction_user_prompt}
        ],
        temperature=0.01,
        max_tokens=50000,
        response_format={
            "type":"json_object",
            "schema": TransactionList.model_json_schema(),
        }
       
    )

    result_text = extract_response.choices[0].message.content
    logger.info("Received response from Together API for transaction extraction")
    print("Raw result from Together API:", result_text)
    cleaned = re.sub(r'^```json\\n|```$', '', result_text.strip())

    try:
        print("Cleaned JSON string:", cleaned)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error("JSON parsing failed: %s", e)
        raise

def safe_parse_date(raw_date: str) -> Optional[str]:
    try:
        return datetime.strptime(raw_date, "%Y-%m-%d").date().isoformat()
    except:
        return None


def deanonymize_value(value: str, entity_map: dict) -> str:
    """Replaces anonymized placeholders in a string with their original values."""
    if not isinstance(value, str):
        return value
    for placeholder, original in entity_map.items():
        value = value.replace(placeholder, original)
    return value

def store_transactions_in_db(transactions: list[dict], user_id: str, entity_map: dict):
    enriched_transactions = []

    for tx in transactions:
        for key in ["description", "merchant", "sender", "receiver"]:
            if tx.get(key):
                tx[key] = deanonymize_value(tx[key], entity_map)

        enriched = {
            "user_id": user_id,
           "date": safe_parse_date(tx.get("date")),
            "amount": tx.get("amount"),
            "currency": tx.get("currency", "unknown"),
            "description": tx.get("description", ""),
            "category": tx.get("category"),
            "type": tx.get("type"),
            "merchant": tx.get("merchant"),
            "sender": tx.get("sender"),
            "receiver": tx.get("receiver"),
        }
        enriched_transactions.append(enriched)

    try:
        response = supabase.table("transactions").insert(enriched_transactions).execute()
        logger.info(f"Response from Supabase: {response.model_dump_json()}")
        logger.info("Transactions stored successfully")
        inserted_ids = [item["id"] for item in response.data if "id" in item]
        return inserted_ids
    except Exception as e:
        logger.exception(f"Exception while inserting transactions: {e}")
        raise



