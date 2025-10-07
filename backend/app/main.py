
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import StringIO
import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, AsyncGenerator
import asyncio

from app.services.data_processing import load_and_preprocess_data, classify_severity
from app.services.analysis import (
    detect_hotspots,
    get_time_series_data,
    get_time_series_forecast,
    train_risk_prediction_model
)
from app.models import FilterPayload, HotspotPayload

load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('models/gemini-flash-latest')
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None

app = FastAPI(title="CrimeLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Keep all your existing code from df_storage = {} down to the train_model endpoint) ...
# For brevity, this unchanged code is omitted.
df_storage = {}

def get_dataframe():
    if 'main_df' not in df_storage:
        raise HTTPException(status_code=404, detail="No data uploaded yet. Please upload a CSV file first.")
    return df_storage['main_df']

@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = load_and_preprocess_data(StringIO(contents.decode('utf-8')))
        df = classify_severity(df)
        df_storage['main_df'] = df
        unique_areas = df['AREA NAME'].unique().tolist()
        unique_crimes = df['Crm Cd Desc'].unique().tolist()
        unique_severities = df['Severity'].unique().tolist()
        return { "message": f"File '{file.filename}' processed successfully.", "total_records": len(df), "filters": { "areas": sorted(unique_areas), "crimes": sorted(unique_crimes), "severities": sorted(unique_severities), } }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {e}")

def apply_filters(df: pd.DataFrame, payload: FilterPayload) -> pd.DataFrame:
    df_filtered = df[ df['AREA NAME'].isin(payload.areas) & df['Crm Cd Desc'].isin(payload.crimes) & df['Severity'].isin(payload.severities) ]
    return df_filtered

@app.post("/api/filtered-data")
def get_filtered_data(payload: FilterPayload, df: pd.DataFrame = Depends(get_dataframe)):
    df_filtered = apply_filters(df, payload)
    return { "record_count": len(df_filtered), "data": df_filtered.head(100).to_dict(orient='records') }

@app.post("/api/hotspots")
def get_hotspots(payload: HotspotPayload, df: pd.DataFrame = Depends(get_dataframe)):
    df_filtered = apply_filters(df, payload)
    if df_filtered.empty: return {"centers": [], "heat_data": []}
    centers = detect_hotspots(df_filtered.copy(), payload.n_clusters)
    heat_data = df_filtered[['LAT', 'LON']].values.tolist()
    return {"centers": centers, "heat_data": heat_data}

@app.post("/api/time-series")
def get_trends(payload: FilterPayload, df: pd.DataFrame = Depends(get_dataframe)):
    df_filtered = apply_filters(df, payload)
    if df_filtered.empty: return {"counts": [], "forecast": []}
    counts = get_time_series_data(df_filtered.copy())
    forecast = get_time_series_forecast(df_filtered.copy())
    return {"counts": counts, "forecast": forecast or []}

@app.post("/api/severity-breakdown")
def get_severity_breakdown(payload: FilterPayload, df: pd.DataFrame = Depends(get_dataframe)):
    df_filtered = apply_filters(df, payload)
    if df_filtered.empty: return {"pie_chart": {}, "bar_chart": {}}
    severity_counts = df_filtered['Severity'].value_counts()
    pie_data = {"labels": severity_counts.index.tolist(), "values": severity_counts.values.tolist()}
    severity_by_area = df_filtered.groupby('AREA NAME')['Severity'].value_counts().unstack().fillna(0)
    bar_data = severity_by_area.reset_index().to_dict(orient='list')
    return {"pie_chart": pie_data, "bar_chart": bar_data}

@app.post("/api/train-model")
def train_model(payload: FilterPayload, df: pd.DataFrame = Depends(get_dataframe)):
    df_filtered = apply_filters(df, payload)
    result = train_risk_prediction_model(df_filtered.copy())
    if result is None: raise HTTPException(status_code=400, detail="Not enough data to train the model (requires > 100 records).")
    return result
# --- End of Unchanged Code ---

class SafetyRequest(BaseModel):
    message: str
    crime_context: List[str]

@app.post("/api/safety-assistant")
async def get_safety_tip(request: SafetyRequest):
    if not model:
        raise HTTPException(status_code=503, detail="AI Assistant is not configured. Please check the API key.")
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # --- THE FIX: A much smarter, more conversational prompt ---
    prompt = f"""
    You are an AI Safety Assistant for a crime analysis app. Your tone is helpful and direct.

    **Your Goal:** Provide actionable safety tips that are directly relevant to the user's question AND the crime data provided.

    **Conversation Rules:**
    1.  **If the user's question is specific** (e.g., "How do I protect my car?"), provide tips that directly answer their question, using the crime context to make your answer more relevant.
    2.  **If the user's question is vague or a simple greeting** (e.g., "hi", "help", "assist me"), you MUST respond conversationally. Acknowledge their message, and then provide 2-3 general safety tips based ONLY on the provided crime context.
    3.  Your tips MUST be related to the provided crime types. Do not give generic advice.
    4.  Keep the entire response concise (under 75 words).
    5.  Format tips using Markdown bullet points (e.g., "- Tip one...").

    **Crime Context:** The top crime types in this area are: {', '.join(request.crime_context)}.
    **User's Question:** "{request.message}"

    Generate your response now based on these rules.
    """

    async def stream_generator() -> AsyncGenerator[str, None]:
        try:
            response_stream = model.generate_content(prompt, stream=True)
            for chunk in response_stream:
                yield chunk.text
                await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Error during Gemini stream: {e}")
            yield "Sorry, I encountered an error. Please try again."

    return StreamingResponse(stream_generator(), media_type="text/plain")

@app.get("/")
def read_root():
    return {"status": "CrimeLens API is running"}
