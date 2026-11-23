
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import pandas as pd
import joblib
from pathlib import Path

from schemas import MachineInput



# Locate the saved model
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "predictive_maintenance_model.joblib"
FRONTEND_DIR = BASE_DIR / "frontend"

# Load model
model_bundle = joblib.load(MODEL_PATH)

model = model_bundle["model"]
threshold = model_bundle["threshold"]


# Create FastAPI application
app = FastAPI(
    title="Predictive Maintenance AI API",
    description="Industrial machine failure prediction system",
    version="1.0.0"
)
# Serve frontend assets
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "application": "Predictive Maintenance AI",
        "status": "online",
        "model": "loaded"
    }

# Prediction endpoint
@app.post("/predict")
def predict_machine_failure(data: MachineInput):

    input_data = pd.DataFrame([{
        "Type": data.machine_type,
        "Air temperature [K]": data.air_temperature,
        "Process temperature [K]": data.process_temperature,
        "Rotational speed [rpm]": data.rotational_speed,
        "Torque [Nm]": data.torque,
        "Tool wear [min]": data.tool_wear
    }])

    probability = float(
        model.predict_proba(input_data)[0][1]
    )

    prediction = int(probability >= threshold)

    return {
        "prediction": prediction,
        "status": "Failure Risk" if prediction == 1 else "Normal",
        "failure_probability": round(probability, 4),
        "threshold": threshold
    }
