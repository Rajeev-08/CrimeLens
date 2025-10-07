# CrimeLens: Interactive Crime Analysis & AI Safety Dashboard 🚨

CrimeLens is a full-stack web application designed to help law enforcement, urban planners, and analysts understand crime patterns, predict risks, and provide contextual safety advice using machine learning and AI. Users can upload raw crime data and instantly generate interactive visualizations, forecasts, and model insights.

***

## ✨ Key Features

CrimeLens provides a comprehensive suite of analytical tools:

1.  **Data Processing & Filtering:** Upload a raw CSV file. The system automatically cleans, preprocesses, and classifies crimes into **High, Medium, or Low** severity. Use the sidebar to filter data by Area, Crime Type, and Severity.
2.  **Hotspot Mapping:** Visualize areas of high crime concentration using **K-Means Clustering** to find central hotspots and a **Heatmap** to show overall density.
3.  **Time-Series Forecasting:** Analyze historical monthly crime trends and generate a **12-month future forecast** using the **Prophet** time-series model.
4.  **Severity Breakdown:** View crime distribution via Pie Charts and stacked Bar Charts to compare severity across different geographic areas.
5.  **Risk Prediction Model:** Train an **XGBoost Classifier** on the fly to predict crime severity based on temporal and geographic features, displaying the model's accuracy and feature importance.
6.  **AI Safety Assistant (Gemini API):** A conversational chat widget that provides **contextual safety tips** tailored to the specific crime types currently visible in the filtered dataset, powered by the Gemini API.

***

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend API** | **Python (FastAPI)** | High-performance, asynchronous web framework. |
| **Data Science** | **Pandas, scikit-learn, XGBoost, Prophet** | Core libraries for data manipulation, clustering, classification, and forecasting. |
| **AI/LLM** | **Google Gemini API** (`gemini-flash-latest`) | Used for generating real-time, context-aware safety tips via a streaming API endpoint. |
| **Frontend UI** | **React.js** | Interactive single-page application for the dashboard. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid UI development. |
| **Visualization** | **React-Chartjs-2, React-Leaflet** | Tools for rendering interactive data charts and dynamic maps/heatmaps. |

***

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

* Python 3.8+
* Node.js and npm/yarn

### 1. Backend Setup

1.  Navigate to the `backend` directory.
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/macOS
    # .\venv\Scripts\activate  # Windows
    ```
3.  Install the required Python packages.
    ```bash
    pip install -r requirements.txt
    ```
4.  **Set up Environment Variables:**
    Create a file named `.env` in the `backend` directory and add your Google Gemini API key.

    ```env
    # backend/.env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
5.  Start the FastAPI server.
    ```bash
    uvicorn app.main:app --reload
    ```
    The API should now be running at `http://localhost:8000`.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory.
    ```bash
    cd frontend
    ```
2.  Install Node dependencies.
    ```bash
    npm install
    # or yarn install
    ```
3.  Start the React development server.
    ```bash
    npm start
    # or yarn start
    ```
    The dashboard will open in your browser at `http://localhost:3000`.

***

## 💡 Usage

1.  **Upload Data:** Use the sidebar control to upload a **CSV file** containing crime data (it must have columns for location (`LAT`, `LON`), time (`DATE OCC`, `TIME OCC`), area (`AREA NAME`), and description (`Crm Cd Desc`)).
2.  **Apply Filters:** After upload, filter controls will appear. Select the relevant areas, crime types, and severities, then click **"Apply Filters"**.
3.  **Explore Tabs:** Navigate through the four analysis tabs (Hotspots, Time-Series, Severity, Prediction) to view visualizations updated by your filter settings.
4.  **Use AI Assistant:** Click the **floating blue chat button** in the bottom-right corner to open the Safety Assistant. Ask for safety tips; the AI will use the top crime types from your current view as context.
