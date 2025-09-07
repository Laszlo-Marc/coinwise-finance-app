from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from routes.goals import router as goals_router
from routes.transactions import router as transaction_router
from routes.auth import router as auth_router
from routes.upload import router as upload_router
from routes.contributions import router as contributions_router
from routes.budgets import router as budgets_router
from routes.stats import router as stats_router
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("finance_app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("finance_app")


app = FastAPI(
    title="Finance App API",
    description="API for managing financial transactions, processing bank statements, and user authentication",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload_router, prefix="/api/upload")
app.include_router(goals_router, prefix="/api/goals")
app.include_router(budgets_router, prefix="/api/budgets")
app.include_router(contributions_router, prefix="/api/contributions")
app.include_router(stats_router, prefix="/api/stats")
app.include_router(transaction_router, prefix="/api/transactions", tags=["Transactions"])

@app.get("/")
async def root():
    return {"message": "Welcome to Finance App API. See /docs for API documentation."}


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Finance App API"}