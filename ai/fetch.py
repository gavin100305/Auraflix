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

# Define an API endpoint to fetch a specific item by its index
@app.get("/data/{index}")
def get_item(index: int):
    """
    Endpoint to fetch a specific item by its index.
    """
    if index < 0 or index >= len(json_data):
        raise HTTPException(status_code=404, detail="Item not found")
    return json_data[index]

# Run the API using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)