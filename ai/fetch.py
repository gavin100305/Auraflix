from fastapi import FastAPI, HTTPException, Query
import json
import logging
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional
from google.api_core.exceptions import GoogleAPICallError, NotFound
from dotenv import load_dotenv
import os
# Initialize the FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

import google.generativeai as genai
genai.configure(api_key=api_key)
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Path to your JSON file
JSON_FILE_PATH = 'output_file.json'

# Load the JSON data into memory
try:
    with open(JSON_FILE_PATH, 'r') as json_file:
        json_data = json.load(json_file)
    logger.info("JSON data loaded successfully")
except FileNotFoundError:
    raise Exception(f"JSON file not found at {JSON_FILE_PATH}")
except json.JSONDecodeError:
    raise Exception(f"Invalid JSON format in {JSON_FILE_PATH}")

# API Endpoint to fetch paginated data
@app.get("/data")
def get_data(page: int = Query(1, ge=1), per_page: int = Query(200, ge=1)):
    """
    Fetch paginated JSON data.
    """
    logger.info(f"Fetching data for page {page} with {per_page} items per page")
    start = (page - 1) * per_page
    end = start + per_page
    return json_data[start:end]

# API Endpoint to fetch a specific influencer by rank
@app.get("/data/rank/{rank}")
def get_influencer_by_rank(rank: int):
    """
    Fetch influencer by rank.
    """
    logger.info(f"Fetching influencer with rank {rank}")
    influencer = next((item for item in json_data if item["rank"] == rank), None)
    
    if influencer is None:
        logger.error(f"Influencer with rank {rank} not found")
        raise HTTPException(status_code=404, detail=f"Influencer with rank {rank} not found")
    
    return influencer

# Add this endpoint to fetch all usernames
@app.get("/users")
def get_all_users():
    logger.info("Fetching all user data")
    return {"users": json_data}


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}



class Contact(BaseModel):
    phone: Optional[str]
    address: Optional[str]

class SocialMedia(BaseModel):
    instagram: Optional[str]
    twitter: Optional[str]
    linkedin: Optional[str]

class BusinessUser(BaseModel):
    businessName: str
    email: str
    businessCategory: str
    description: str
    contact: Contact              # ← Nested Contact object
    website: Optional[str]
    socialMedia: SocialMedia      # ← Nested SocialMedia object


# Endpoint to receive user data from Node
@app.post("/receive-business")
async def receive_business(user: BusinessUser):
    logger.info(f"Received business user: {user.email}")

    # Save user to json_data and persist to file
    json_data.append(user.dict())
    with open(JSON_FILE_PATH, 'w') as f:
        json.dump(json_data, f, indent=4)

    # Prepare influencer data as string for Gemini
    influencers_info = ""
    for influencer in json_data:
        name = influencer.get("channel_info", "Unknown")
        desc = influencer.get("description", "No description")
        influencers_info += f"Username: {name}, Description: {desc}\n"

    prompt = (
        f"You are a marketing AI assistant. Given this business description:\n\n"
        f"{user.description}\n\n"
        f"And this list of influencers:\n\n"
        f"{influencers_info}\n"
        f"Which usernames would be best to promote this business? Give me only the usernames as a list."
    )

    # Call Gemini
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        suggestions = response.text.strip()
        logger.info(f"Gemini suggestions: {suggestions}")
        
        # ✅ Return suggestions to Node.js
        return {
            "message": "Business data received and suggestions generated.",
            "suggested_influencers": suggestions
        }

    except GoogleAPICallError as e:
        logger.error(f"Gemini API error: {e.message}")
        raise HTTPException(status_code=500, detail="Gemini API failed with an error.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error occurred.")


# Run the API using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    

