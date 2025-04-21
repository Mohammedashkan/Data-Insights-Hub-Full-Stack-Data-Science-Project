from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import your modules
from ai.chatbot.intent_recognition import extract_entities, classify_intent

app = FastAPI(title="Data Insights Hub API")

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class VoiceRequest(BaseModel):
    command: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Data Insights Hub API", "status": "API is running with Gemini integration"}

@app.post("/api/chat")
async def process_chat(request: ChatRequest):
    try:
        # Extract entities from the message
        entities = extract_entities(request.message)
        
        # Classify the intent
        intent, confidence = classify_intent(request.message)
        
        # For now, return a simple response
        return {
            "response": f"I understand you want to {intent} (confidence: {confidence:.2f}). I found these entities: {entities}",
            "entities": entities,
            "intent": intent,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/process")
async def process_voice(request: VoiceRequest):
    try:
        # Process the voice command (similar to chat)
        entities = extract_entities(request.command)
        intent, confidence = classify_intent(request.command)
        
        return {
            "response": f"Voice command understood. Intent: {intent}. I'll process your request about {', '.join(entities['columns']) if entities['columns'] else 'your data'}.",
            "entities": entities,
            "intent": intent
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mock endpoint for dataset upload
@app.post("/api/datasets/upload")
async def upload_dataset():
    return {"message": "Dataset upload endpoint (mock)"}

# Mock endpoint for analysis
@app.get("/api/analysis/insights/{dataset_id}")
async def get_insights(dataset_id: str):
    # Mock data for frontend testing
    return {
        "summary": {
            "rows": 1000,
            "columns": 15,
            "missing_values": 45
        },
        "numeric_columns": ["sales", "revenue", "profit", "customers"],
        "categorical_columns": ["region", "product", "category"],
        "charts": [
            {"type": "bar", "title": "Sales by Region"},
            {"type": "line", "title": "Revenue Trend"},
            {"type": "pie", "title": "Product Distribution"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)