# **InfluenceIQ**  
**AI-Powered Influencer Analytics Platform**  

---

## **Overview**  
InfluenceIQ is a data-driven platform that helps businesses find the perfect influencers for their brand. By leveraging **AI and machine learning**, it provides deep insights into influencer credibility, engagement, and alignment with your brand. The platform uses **realistic historical data**, **predictive analytics**, and **advanced metrics** to ensure smarter influencer partnerships.

---

## **Key Features**  
1. **Influencer Matching**:  
   - AI-powered matching based on brand alignment, credibility, and engagement.  
   - No bots—only authentic influencers.  

2. **Data-Driven Insights**:  
   - Detailed metrics: followers, likes, comments, engagement rate, and more.  
   - Realistic historical data simulation for 36 months.  

3. **Predictive Analytics**:  
   - Linear regression for future trends (next 9 months).  
   - Metrics: followers, likes, engagement, and quality scores.  

4. **Advanced Scoring**:  
   - **Influence Score**: Combines followers, engagement, and credibility.  
   - **Credibility Score**: Ensures no bot followers.  
   - **Engagement Quality Score**: Measures audience interaction.  
   - **Longevity Score**: Tracks influencer consistency over time.  

5. **AI-Powered Text Analysis**:  
   - **TF-IDF (Term Frequency-Inverse Document Frequency)** for influencer content analysis.  
   - Identifies keyword importance and content relevance to brand campaigns.  

6. **Custom Reports**:  
   - Concise, AI-generated reports using LLM models (e.g., Gemini API).  

---

## **Tech Stack**  
- **Frontend**: React, Tailwind CSS  
- **Backend**: Node.js, Express  
- **Database**: MongoDB  
- **Data Integration**:  
  - CSV datasets from Kaggle converted into APIs.  
  - Custom API to replace Instagram Graph API.  
- **Machine Learning**:  
  - Linear Regression for trend prediction.  
  - TF-IDF for text analysis.  

---

## **How It Works**  
1. **Data Generation**:  
   - Historical data is simulated using `generateHistoricalData`.  
   - Includes growth trends, seasonality, and randomness for 36 months.  

2. **Future Predictions**:  
   - Linear regression predicts metrics for the next 9 months.  
   - Outputs slope, intercept, and r-squared for trend analysis.  

3. **Influencer Scoring**:  
   - Mathematically calculated scores (Influence, Credibility, Engagement Quality, Longevity).  
   - Formulas:  
     - **Credibility Score**: `0.4 × Influence Score + 0.3 × Engagement Rate × 100 + 0.3 × Reputation Score`  
     - **Engagement Quality Score**: `(Average Likes / Followers) × 100`  
     - **InfluenceIQ Score**: `Credibility Score + Longevity Score + Engagement Quality Score`  

4. **AI-Powered Reports**:  
   - LLM models generate concise, data-driven reports for influencers.  

5. **TF-IDF Content Analysis**:  
   - **Term Frequency (TF)**: Measures how often a word appears in an influencer’s content.  
   - **Inverse Document Frequency (IDF)**: Assigns importance to words that appear less frequently in the dataset, highlighting unique keywords.  
   - Helps brands determine an influencer’s content alignment with their campaigns.  

---

## **Usage**  
1. **Explore Influencers**:  
   - View ranked influencers with detailed metrics.  
   - Filter by followers, engagement rate, and credibility.  

2. **Generate Reports**:  
   - Use AI to generate concise reports for selected influencers.  

3. **Predict Trends**:  
   - Analyze future trends for followers, likes, and engagement.  

4. **Analyze Content with TF-IDF**:  
   - Extract key topics from an influencer’s posts.  
   - Identify influencers whose content aligns with brand goals.  

---

