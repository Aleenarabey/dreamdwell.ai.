"""
FastAPI ML Service for Financial Predictions
Provides REST API endpoints for linear regression predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from models.predict_models import predictor
from models.train_models import FinancialPredictor
import uvicorn

app = FastAPI(title="DreamDwell Financial ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class BudgetOverrunRequest(BaseModel):
    project_budget: float
    current_spent: float
    progress_percentage: float
    days_elapsed: int
    project_duration: int

class CashFlowRequest(BaseModel):
    historical_cash_flow: float
    pending_payments: float
    pending_expenses: float
    month: int
    revenue: float = 0
    expenses: float = 0

class ProjectCostRequest(BaseModel):
    budget: float
    material_costs: float
    labor_costs: float
    project_size: float
    duration: int
    complexity_score: float = 1.0

class MaterialCostRequest(BaseModel):
    quantity: float
    historical_price: float
    supplier_id_encoded: int = 0
    month: int
    material_type_encoded: int = 0

class TrainingDataRequest(BaseModel):
    model_type: str  # 'budget_overrun', 'cash_flow', 'project_cost', 'material_cost'
    data: List[Dict]

@app.get("/")
async def root():
    return {
        "service": "DreamDwell Financial ML Service",
        "status": "running",
        "models_available": list(predictor.models.keys()),
        "endpoints": {
            "predict_budget_overrun": "/predict/budget-overrun",
            "predict_cash_flow": "/predict/cash-flow",
            "predict_project_cost": "/predict/project-cost",
            "predict_material_cost": "/predict/material-cost",
            "train_model": "/train",
            "health": "/health"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "models_loaded": len(predictor.models)}

@app.post("/predict/budget-overrun")
async def predict_budget_overrun(request: BudgetOverrunRequest):
    """Predict project budget overrun"""
    try:
        features = request.dict()
        result = predictor.predict_budget_overrun(features)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/cash-flow")
async def predict_cash_flow(request: CashFlowRequest):
    """Predict future cash flow"""
    try:
        features = request.dict()
        result = predictor.predict_cash_flow(features)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/project-cost")
async def predict_project_cost(request: ProjectCostRequest):
    """Predict total project cost"""
    try:
        features = request.dict()
        result = predictor.predict_project_cost(features)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/material-cost")
async def predict_material_cost(request: MaterialCostRequest):
    """Predict material cost"""
    try:
        features = request.dict()
        result = predictor.predict_material_cost(features)
        return {"success": True, "prediction": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(request: TrainingDataRequest):
    """Train a model with provided data"""
    try:
        trainer = FinancialPredictor()
        model_type = request.model_type.lower()
        
        if model_type == 'budget_overrun':
            model, metadata = trainer.train_budget_overrun_model(request.data)
        elif model_type == 'cash_flow':
            model, metadata = trainer.train_cash_flow_model(request.data)
        elif model_type == 'project_cost':
            model, metadata = trainer.train_project_cost_model(request.data)
        elif model_type == 'material_cost':
            model, metadata = trainer.train_material_cost_model(request.data)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown model type: {model_type}")
        
        # Reload models
        predictor.load_models()
        
        return {
            "success": True,
            "message": f"{model_type} model trained successfully",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

