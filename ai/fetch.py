from fastapi import FastAPI, HTTPException, Query
import json
import logging
import math
import random
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional, Dict, Any
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

# ------------------------------------- Romeiro's code started here -----------------------------------------

class InfluencerRequest(BaseModel):
    influencer: Dict[str, Any]

@app.post("/generate-summary")
async def generate_summary(request: InfluencerRequest):
    try:
        influencer = request.influencer
        
        # Create a meaningful prompt for Gemini
        prompt = f"""
        Create a professional, concise summary of this social media influencer:
        
        Username: {influencer.get('channel_info')}
        Followers: {influencer.get('followers')}
        Posts: {influencer.get('posts')}
        Average Likes: {influencer.get('avg_likes')}
        Engagement Rate: {influencer.get('avg_engagement')}
        Country: {influencer.get('country', 'Unknown')}
        Influence Score: {influencer.get('influence_score')}
        
        Include insights about their engagement quality (score: {influencer.get('engagement_quality_score', 'N/A')}),
        content longevity (score: {influencer.get('longevity_score', 'N/A')}),
        and overall influence potential. Keep the summary to 3-4 sentences and focus on what makes this
        influencer's profile notable based on these metrics.
        """

        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        summary = response.text
        
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
    

# Add this function to help with username extraction
def get_username(channel_info):
    """Extract username from channel info"""
    if not channel_info:
        return "unknown"
    return channel_info[1:] if channel_info.startswith("@") else channel_info

# Add this new endpoint
@app.get("/trends/{username}")
async def get_influencer_trends(username: str):
    """
    Generate realistic trend data for a specific influencer based on their metrics.
    """
    logger.info(f"Generating trend data for influencer: {username}")
    
    # Find the influencer in our data
    influencer = next((item for item in json_data if get_username(item.get("channel_info", "")) == username), None)
    
    if not influencer:
        logger.warning(f"Influencer '{username}' not found, generating generic data")
        # If we can't find the influencer, generate some generic data
        return generate_generic_trend_data()
    
    # Generate last 12 months of data based on influencer metrics
    data = []
    current_date = datetime.now()
    
    # Parse metrics for data generation
    metrics = parse_influencer_metrics(influencer)
    
    # Generate timeline data points
    for i in range(-11, 1):  # Last 12 months
        month_date = current_date + timedelta(days=30 * i)
        month_name = month_date.strftime("%b")
        month_year = month_date.strftime("%b %Y")
        
        # Calculate metrics for this month with realistic trends
        month_data = calculate_month_metrics(metrics, i, influencer)
        month_data["month"] = month_name
        month_data["period"] = month_year
        
        data.append(month_data)
    
    return data

def parse_influencer_metrics(influencer):
    """Extract and normalize metrics from influencer data"""
    metrics = {}
    
    # Convert string metrics like "1.2M" to actual numbers
    try:
        # Handle followers
        followers_str = influencer.get('followers', '10K')
        if isinstance(followers_str, str):
            if 'k' in followers_str.lower() or 'K' in followers_str:
                metrics['followers'] = float(followers_str.lower().replace('k', '').replace('K', '').strip()) * 1000
            elif 'm' in followers_str.lower() or 'M' in followers_str:
                metrics['followers'] = float(followers_str.lower().replace('m', '').replace('M', '').strip()) * 1000000
            elif 'b' in followers_str.lower() or 'B' in followers_str:
                metrics['followers'] = float(followers_str.lower().replace('b', '').replace('B', '').strip()) * 1000000000
            else:
                metrics['followers'] = float(followers_str.replace(',', '').strip())
        else:
            metrics['followers'] = float(followers_str)
    except (ValueError, TypeError):
        metrics['followers'] = 10000  # Default
    
    # Handle engagement rate
    try:
        engagement_str = influencer.get('avg_engagement', '1%')
        if isinstance(engagement_str, str) and '%' in engagement_str:
            metrics['engagement'] = float(engagement_str.replace('%', '').strip())
        else:
            metrics['engagement'] = float(engagement_str) * 100 if float(engagement_str) < 1 else float(engagement_str)
    except (ValueError, TypeError):
        metrics['engagement'] = 1.0  # Default
    
    # Get other metrics
    metrics['influence_score'] = float(influencer.get('influence_score', 50))
    metrics['engagement_quality'] = float(influencer.get('engagement_quality_score', 0.5))
    metrics['longevity'] = float(influencer.get('longevity_score', 5))
    
    return metrics

def calculate_month_metrics(base_metrics, month_offset, influencer):
    """Calculate realistic metrics for a specific month"""
    # Base values
    base_followers = base_metrics['followers']
    base_engagement = base_metrics['engagement']
    influence_score = base_metrics['influence_score']
    
    # Calculate growth rate based on influence score (higher score = faster growth)
    # Convert to a monthly growth percentage between 0.5% and 5%
    monthly_growth_rate = 1 + ((influence_score / 100) * 0.045 + 0.005)
    
    # Calculate followers with compounding growth, more recent months have higher growth
    # Apply some randomness for realism
    growth_randomness = random.uniform(0.97, 1.03)  # ±3% random variation
    followers = base_followers * (monthly_growth_rate ** (month_offset + 12)) * growth_randomness
    
    # Add seasonality effect to engagement (higher in certain months)
    # Season effect follows a sine wave with peak in summer months
    month_in_year = (datetime.now().month + month_offset) % 12
    seasonal_factor = math.sin(month_in_year / 12 * 2 * math.pi) * 0.15  # ±15% seasonal variation
    
    # For engagement, consider the influencer quality score
    engagement_quality = base_metrics['engagement_quality']
    
    # Higher quality engagement tends to be more consistent
    quality_factor = 1 - (engagement_quality / 2)  # Lower value = more consistent
    random_factor = random.uniform(-0.1, 0.1) * quality_factor
    
    # Calculate engagement with seasonality and randomness
    engagement = max(0.1, base_engagement * (1 + seasonal_factor + random_factor))
    
    # Calculate likes based on followers and engagement rate
    likes = int(followers * engagement / 100)
    
    # Final data point
    return {
        "followers": int(followers),
        "engagement": round(engagement, 2),
        "likes": likes,
        "quality_score": round(base_metrics['engagement_quality'] * (1 + random_factor/5), 3)
    }

def generate_generic_trend_data():
    """Generate generic trend data when influencer is not found"""
    data = []
    current_date = datetime.now()
    
    base_followers = 100000
    monthly_growth = 1.03  # 3% monthly growth
    base_engagement = 2.0   # 2% engagement rate
    
    for i in range(-11, 1):  # Last 12 months
        month_date = current_date + timedelta(days=30 * i)
        month_name = month_date.strftime("%b")
        month_year = month_date.strftime("%b %Y")
        
        # Simple growth model
        followers = int(base_followers * (monthly_growth ** (i + 12)))
        engagement = base_engagement + (i * 0.05)  # Slight increase in engagement over time
        likes = int(followers * engagement / 100)
        
        data.append({
            "month": month_name,
            "period": month_year,
            "followers": followers,
            "engagement": round(engagement, 2),
            "likes": likes,
            "quality_score": round(0.5 + (i * 0.02), 3)  # Gradually improving quality score
        })
    
    return data

# ---------------------------------- Romeiro's code ends here --------------------------------------------


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


@app.post("/api/gemini/generate-influence")
async def generate_influence(request: InfluencerRequest):
    try:
        # Call to Google's Gemini API
        response = genai.generate_content(f"""
        Generate a world influence map for {request.influencer_name} from {request.influencer_category} category.
        Based on their home country of {request.influencer_country} and base influence score of {request.base_influence_score},
        create a JSON object with country names as keys and influence scores (0-100) as values for major countries worldwide.
        Consider cultural, geographic, linguistic proximity factors. Format as valid JSON only.
        """)
        
        # Parse the generated content
        influence_map = json.loads(response.text)
        
        return {
            "status": "success",
            "influence_map": influence_map
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "influence_map": {}
        }
# Run the API using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    

