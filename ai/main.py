import pandas as pd
import json

# Define the CSV file path and the output JSON file path
csv_file_path = 'analytics.csv'
json_file_path = 'output_file.json'

# Define the chunk size (number of rows to process at a time)
chunk_size = 10000

# Initialize an empty list to store all chunks
all_data = []

# Read the CSV file in chunks
for chunk in pd.read_csv(csv_file_path, chunksize=chunk_size):
    # Convert each chunk to a list of dictionaries (JSON-like structure)
    chunk_data = chunk.to_dict(orient='records')
    # Append the chunk data to the main list
    all_data.extend(chunk_data)

# Write the combined data to a JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(all_data, json_file, indent=4)

print(f"CSV file '{csv_file_path}' has been converted to JSON and saved as '{json_file_path}'.")