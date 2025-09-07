import logging
import os
import re
import time
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPBearer
import pdfplumber
from routes.auth import User, get_current_user
from service.budget_service import auto_link_transactions_to_budgets
from service.upload_service import anonymize_text, normalize_and_extract, sections_extraction, store_transactions_in_db



router = APIRouter()
security = HTTPBearer()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("upload.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("upload_processor")


BANK_STATEMENT_KEYWORDS = [
    r"\bCont(?:ul)?\b", r"\bIBAN\b", r"\bSold\b", r"\bData\b", r"\bTranzacții\b",
    r"\bPlată\b", r"\bComision\b", r"\bSumă\b",
    r"\bStatement\b", r"\bBalance\b", r"\bAccount\b", r"\bTransaction\b",
    r"\bAmount\b", r"\bPayment\b"
]

def is_probably_bank_statement(text: str) -> bool:
    hits = sum(bool(re.search(p, text, flags=re.IGNORECASE)) for p in BANK_STATEMENT_KEYWORDS)
    return hits >= 2 


@router.post("/", response_model=dict)
async def upload_pdf(file: UploadFile = File(...),  current_user: User = Depends(get_current_user)):
    logger.info(f"Processing upload for file: {file.filename}")
    start_time = time.time()
    

    pdf_file_path = f"temp_{file.filename}"
    logger.info(f"Saving uploaded file to {pdf_file_path}")
    
    try:
        with open(pdf_file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            logger.info(f"File saved: {pdf_file_path} ({len(content)} bytes)")
    except Exception as e:
        logger.error(f"Error saving uploaded file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error saving uploaded file: {str(e)}")

   
    try:
        logger.info(f"Extracting text from PDF: {pdf_file_path}")
        with pdfplumber.open(pdf_file_path) as pdf:
            pages = []
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                pages.append(page_text)
                logger.debug(f"Extracted page {i+1}/{len(pdf.pages)}: {len(page_text)} characters")
            
            raw_text = "\n".join(pages)
            logger.info(f"Extracted {len(raw_text)} characters from {len(pdf.pages)} pages")
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
    
        if os.path.exists(pdf_file_path):
            os.remove(pdf_file_path)
            logger.info(f"Removed temporary file: {pdf_file_path}")
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")
    

    if os.path.exists(pdf_file_path):
        os.remove(pdf_file_path)
        logger.info(f"Removed temporary file: {pdf_file_path}")
        
    if len(raw_text.strip()) < 500:
        logger.warning("PDF text is too short to be a valid bank statement.")
        raise HTTPException(status_code=400, detail="This PDF is too short to be a valid bank statement.")

    if not is_probably_bank_statement(raw_text):
        logger.warning("Uploaded PDF does not appear to be a bank statement.")
        raise HTTPException(status_code=400, detail="This PDF does not appear to be a bank statement.")


    logger.info("Anonymizing extracted text")
    anonymized_text, entity_map_id, entity_map = await anonymize_text(raw_text,current_user)
    logger.info(f"Text anonymized with entity map ID: {entity_map_id}")

    
    logger.info("Extracting transaction sections")
    transactions,money_in,money_out = sections_extraction(anonymized_text)

    logger.info(f"Extracted {len(transactions)} transactions")
    logger.info(f"Total money in: {money_in}, Total money out: {money_out}")

    logger.info("Normalizing and extracting entities from transactions")
    transactions = normalize_and_extract(transactions)

    logger.info("Storing transactions in database")
    inserted_transaction_ids =store_transactions_in_db(transactions["root"],current_user.id,entity_map)
    logger.info(f"Inserted {len(inserted_transaction_ids)} transactions into the database")

    logger.info("Attempting to auto-link transactions to budgets")
    auto_link_transactions_to_budgets(current_user.id, inserted_transaction_ids)
    logger.info("Auto-linking transactions to budgets completed")
    
    elapsed_time = time.time() - start_time
    logger.info(f"Upload processing completed in {elapsed_time:.2f} seconds")

    return {
        "message": "Transactions processed and stored successfully!",
    }


