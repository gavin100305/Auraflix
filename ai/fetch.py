from fastapi import FastAPI, HTTPException, Query
import json
import logging
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

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
def get_data(page: int = Query(1, ge=1), per_page: int = Query(10, ge=1)):
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

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Run the API using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
