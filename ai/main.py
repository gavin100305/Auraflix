import pandas as pd
import json
import math

# Function to convert k/m to actual numbers
def convert_value(value):
    if isinstance(value, str):
        if "k" in value:
            return float(value.replace("k", "")) * 1000
        elif "m" in value:
            return float(value.replace("m", "")) * 1_000_000
        elif "b" in value:
            return float(value.replace("b", "")) * 1_000_000_000
    return float(value)

# Function to handle missing values
def handle_missing_values(row):
    for key, value in row.items():
        if pd.isna(value):  # Check if the value is NaN
            if isinstance(row[key], str):  # If it's a string, replace with "Unknown"
                row[key] = "Unknown"
            else:  # If it's numeric, replace with 0
                row[key] = 0
    return row

# Function to calculate scores
def calculate_scores(influencer):
    try:
        # Convert values to numeric
        influence_score = float(influencer.get("influence_score", 0))  # Default to 0 if missing
        engagement_rate = float(influencer.get("avg_engagement", "0%").replace("%", "")) / 100  # Default to 0% if missing
        posts = convert_value(influencer.get("posts", "0k"))  # Default to "0k" if missing
        avg_likes = convert_value(influencer.get("avg_likes", "0m"))  # Default to "0m" if missing
        followers = convert_value(influencer.get("followers", "0m"))  # Default to "0m" if missing

        # Calculate Credibility Score
        credibility_score = influence_score * engagement_rate

        # Calculate Longevity Score
        longevity_score = math.log(posts + 1)  # Add 1 to avoid log(0)

        # Calculate Engagement Quality Score
        engagement_quality_score = (avg_likes / followers) * 100 if followers != 0 else 0  # Avoid division by zero

        # Calculate Overall InfluenceIQ Score
        influenceiq_score = credibility_score + longevity_score + engagement_quality_score

        return {
            "credibility_score": credibility_score,
            "longevity_score": longevity_score,
            "engagement_quality_score": engagement_quality_score,
            "influenceiq_score": influenceiq_score,
        }
    except Exception as e:
        print(f"Error calculating scores for {influencer.get('channel_info', 'Unknown')}: {e}")
        return {
            "credibility_score": 0,  # Default to 0 if calculation fails
            "longevity_score": 0,
            "engagement_quality_score": 0,
            "influenceiq_score": 0,
        }
# Define the CSV file path and the output JSON file path
csv_file_path = 'insta.csv'
json_file_path = 'output_file.json'

# Read the CSV file
df = pd.read_csv(csv_file_path)

# Convert CSV to JSON and add new fields
json_data = []
for _, row in df.iterrows():
    influencer = row.to_dict()
    
    # Handle missing values
    influencer = handle_missing_values(influencer)
    
    # Calculate scores
    scores = calculate_scores(influencer)
    
    # Add scores to the influencer data
    influencer.update(scores)
    
    # Append to JSON data
    json_data.append(influencer)

# Write the updated JSON data to a file
with open(json_file_path, 'w') as json_file:
    json.dump(json_data, json_file, indent=4)

print(f"CSV file '{csv_file_path}' has been converted to JSON and saved as '{json_file_path}'.")