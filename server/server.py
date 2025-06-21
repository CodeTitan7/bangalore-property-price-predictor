from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from util import load_saved_artifacts, get_location_names, get_estimated_price

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

@app.get("/")
def root():
    return {"message": "Welcome to Bangalore Property Price Predictor API"}

@app.get("/locations")
def locations():
    return {"locations": get_location_names()}

@app.post("/predict_home_price")
def predict_home_price(req: PriceRequest):
    try:
        estimated_price = get_estimated_price(req.location, req.sqft, req.bhk, req.bath)
        return {"estimated_price": estimated_price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
