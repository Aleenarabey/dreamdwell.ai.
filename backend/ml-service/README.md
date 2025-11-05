# ML Finance Prediction Service

This service provides Linear Regression models for financial predictions in the DreamDwell system.

## Setup

1. **Install Python dependencies:**
```bash
cd ml-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

2. **Start the ML Service:**
```bash
# Using the batch file (Windows):
start_ml_service.bat

# Or directly:
python main.py
```

The service will run on `http://localhost:8001`

## API Endpoints

### Predictions

- `POST /predict/budget-overrun` - Predict project budget overrun
- `POST /predict/cash-flow` - Predict future cash flow
- `POST /predict/project-cost` - Predict total project cost
- `POST /predict/material-cost` - Predict material cost

### Training

- `POST /train` - Train a model with provided data

### Status

- `GET /health` - Check service health
- `GET /` - Service information

## Usage from Node.js Backend

The Node.js backend routes are available at `/api/ml-finance/`:

- `POST /api/ml-finance/predict/budget-overrun/:projectId`
- `POST /api/ml-finance/predict/cash-flow`
- `POST /api/ml-finance/predict/project-cost/:projectId`
- `POST /api/ml-finance/predict/material-cost`
- `POST /api/ml-finance/train/:modelType`

## Model Types

- `budget_overrun` - Predicts final project cost and overrun risk
- `cash_flow` - Predicts future cash flow
- `project_cost` - Predicts total project cost
- `material_cost` - Predicts material prices

## Environment Variables

- `ML_SERVICE_URL` - Set in Node.js backend (default: http://localhost:8001)

