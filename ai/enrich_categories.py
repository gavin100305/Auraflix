import json
import os
import time
import logging
from google import generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Output file path
OUTPUT_FILE = "enhanced_categories.json"

def get_username(channel_info):
    """Extract username from channel info"""
    if not channel_info:
        return "Unknown"
    return channel_info.strip()

def enrich_categories(input_file="output_file.json"):
    """Use Gemini to get more accurate categories for influencers and save to file"""
    try:
        # Check if file already exists to avoid re-running API calls
        if os.path.exists(OUTPUT_FILE):
            logger.info(f"Enhanced categories file already exists at {OUTPUT_FILE}. Skipping API calls.")
            return
            
        logger.info(f"Loading influencer data from {input_file}...")
        
        # Load the influencer data
        with open(input_file, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
            
        logger.info(f"Loaded {len(json_data)} influencer records")
        
        # Initialize result dictionary
        enhanced_categories = {}
        
        # Configure the API key (set your API key here or use environment variable)
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            api_key = input("Please enter your Gemini API key: ")
            
        genai.configure(api_key=api_key)
        
        # Process influencers in batches to avoid token limits
        batch_size = 25
        all_influencers = json_data.copy()
        total_batches = (len(all_influencers) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min((batch_num + 1) * batch_size, len(all_influencers))
            batch = all_influencers[start_idx:end_idx]
            
            logger.info(f"Processing batch {batch_num+1}/{total_batches} (items {start_idx+1}-{end_idx})")
            
            # Build prompt for categorization
            prompt_parts = [
                "You are an expert in influencer marketing categorization. For each influencer below, " 
                "analyze their username and provide a specific, accurate category label (e.g., 'beauty', " 
                "'tech', 'fitness', 'gaming', 'sports', 'entertainment', 'music', 'fashion', etc.). Return ONLY " 
                "a JSON object where each key is the influencer's username and value is their category. " 
                "Be very specific with categories.\n\n"
            ]
            
            for influencer in batch:
                username = get_username(influencer.get("channel_info", "Unknown"))
                followers = influencer.get("followers", "Unknown")
                avg_likes = influencer.get("avg_likes", "Unknown")
                country = influencer.get("country", "Unknown")
                
                # Add any available context
                prompt_parts.append(f"Username: {username}\nFollowers: {followers}\nAvg Likes: {avg_likes}\nCountry: {country}\n\n")
            
            full_prompt = "".join(prompt_parts)
            
            # Call Gemini for category refinement
            try:
                model = genai.GenerativeModel("gemini-2.5-flash")
                response = model.generate_content(full_prompt)
                response_text = response.text
                
                # Extract JSON part if necessary
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                    
                # Parse JSON response
                category_updates = json.loads(response_text)
                
                # Update categories in our result dictionary
                for username, category in category_updates.items():
                    clean_username = username.strip()
                    if clean_username.startswith('@'):
                        clean_username = clean_username[1:]
                    enhanced_categories[clean_username] = category
                    logger.info(f"Enhanced category for {clean_username}: {category}")
                    
                # Don't overload the API
                if batch_num < total_batches - 1:
                    wait_time = 2  # seconds between batches
                    logger.info(f"Waiting {wait_time}s before next batch...")
                    time.sleep(wait_time)
                    
            except Exception as e:
                logger.error(f"Error in Gemini category enrichment for batch {batch_num+1}: {str(e)}")
                # Continue with next batch despite errors
        
        # Save all enhanced categories to file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(enhanced_categories, f, indent=2)
            
        logger.info(f"Enhanced categories saved to {OUTPUT_FILE}")
        logger.info(f"Categorized {len(enhanced_categories)} influencers")
    
    except Exception as e:
        logger.error(f"Failed to enrich categories: {str(e)}")

if __name__ == "__main__":
    enrich_categories()
    logger.info("Category enrichment process completed")