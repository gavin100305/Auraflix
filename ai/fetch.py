from fastapi import FastAPI, HTTPException
import json

# Initialize the FastAPI app
app = FastAPI()

# Path to your JSON file
JSON_FILE_PATH = 'output_file.json'

# Load the JSON data into memory
try:
    with open(JSON_FILE_PATH, 'r') as json_file:
        json_data = json.load(json_file)
except FileNotFoundError:
    raise Exception(f"JSON file not found at {JSON_FILE_PATH}")

# Define an API endpoint to fetch the entire JSON data
@app.get("/data")
def get_data():
    """
    Endpoint to fetch the entire JSON data.
    """
    return json_data

# Define an API endpoint to fetch a specific influencer by their rank
@app.get("/data/rank/{rank}")
def get_influencer_by_rank(rank: int):
    """
    Endpoint to fetch a specific influencer by their rank.
    """
    # Search for the influencer with the given rank
    influencer = next((item for item in json_data if item["rank"] == rank), None)
    
    # If no influencer is found, raise a 404 error
    if influencer is None:
        raise HTTPException(status_code=404, detail=f"Influencer with rank {rank} not found")
    
    return influencer

# Run the API using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)