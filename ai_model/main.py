import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Load the data
df = pd.read_csv('social.csv')

# Clean column names
df.columns = df.columns.str.strip().str.replace(' ', '_').str.replace('\n', '')

# Convert numerical columns
def convert_to_numeric(value):
    if isinstance(value, str):
        if 'M' in value:
            return float(value.replace('M', '')) * 1_000_000
        elif 'K' in value:
            return float(value.replace('K', '')) * 1_000
        else:
            return float(value)  # Handle cases without 'M' or 'K'
    return value  # Return as-is if already numeric

numerical_columns = ['Subscribers', 'Authentic_engagement', 'Engagement_average']
for col in numerical_columns:
    df[col] = df[col].apply(convert_to_numeric)

# Handle missing values
df.fillna(0, inplace=True)

# Feature Engineering: Create Engagement Rate
df['Engagement_Rate'] = df['Engagement_average'] / df['Subscribers']

# Normalize numerical columns
scaler = MinMaxScaler()
df['Subscribers_Scaled'] = scaler.fit_transform(df[['Subscribers']])
df['Authentic_Engagement_Scaled'] = scaler.fit_transform(df[['Authentic_engagement']])

# Assign weights to categories
category_weights = {
    'Fashion': 1.0,
    'Sports with a ball': 0.9,
    'Cinema & Actors/actresses': 0.8,
    'Lifestyle': 0.7,
    'Beauty': 0.8,
    'Modeling': 0.9,
    'Family': 0.6,
    'Photography': 0.7,
    'Shows': 0.8,
    'Humor & Fun & Happiness': 0.7,
    'Fitness & Gym': 0.8,
    'Clothing & Outfits': 0.9,
    'Travel': 0.7,
    'Science': 0.6,
    'Business & Careers': 0.7,
    'Finance & Economics': 0.7,
    'Cars & Motorbikes': 0.8,
    'Luxury': 0.9,
    'Adult content': 0.5,
    'Education': 0.6,
    'Literature & Journalism': 0.7,
    'Machinery & Technologies': 0.7,
    'Racing Sports': 0.8,
    'Winter sports': 0.7,
    'Shopping & Retail': 0.8,
    'Accessories & Jewellery': 0.9,
    'Kids & Toys': 0.6,
    'Food & Cooking': 0.7,
    'Nature & landscapes': 0.6,
    'Computers & Gadgets': 0.8,
    'Trainers & Coaches': 0.7,
}

# Assign category weights
df['Category_Weight'] = df['Category_1'].map(category_weights).fillna(0.5)  # Default weight for unknown categories

# Calculate Influencer Score
df['Influencer_Score'] = (
    0.4 * df['Engagement_Rate'] +
    0.3 * df['Subscribers_Scaled'] +
    0.2 * df['Authentic_Engagement_Scaled'] +
    0.1 * df['Category_Weight']
)

# Rank influencers by Influencer Score
df = df.sort_values(by='Influencer_Score', ascending=False)

# Display top influencers
print(df[['Instagram_name', 'Name', 'Influencer_Score']].head(20))

# Save results to a new CSV
df.to_csv('influencer_scores.csv', index=False)