import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load the .env file to get your API key
load_dotenv()

# Configure the API with your key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Finding available models for generateContent...")

# Loop through all available models and check if they support the 'generateContent' method
for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)