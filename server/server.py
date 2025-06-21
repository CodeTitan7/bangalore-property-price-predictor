from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.util import load_saved_artifacts, get_location_names, get_estimated_price
import os

app = FastAPI(title="Bangalore Property Price Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_saved_artifacts()

class PriceRequest(BaseModel):
    location: str
    sqft: float
    bhk: int
    bath: int

@app.get("/locations")
async def locations(request: Request):
    expected_key = os.getenv("BACKEND_API_KEY")
    incoming_key = request.headers.get("x-api-key")
    if expected_key and incoming_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid API key")
    return {"locations": get_location_names()}

@app.post("/predict_home_price")
async def predict_home_price(req: PriceRequest, request: Request):
    expected_key = os.getenv("BACKEND_API_KEY")
    incoming_key = request.headers.get("x-api-key")
    if expected_key and incoming_key != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid API key")
    try:
        estimated_price = get_estimated_price(req.location, req.sqft, req.bhk, req.bath)
        return {"estimated_price": estimated_price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "Welcome to Bangalore Property Price Predictor API"}
