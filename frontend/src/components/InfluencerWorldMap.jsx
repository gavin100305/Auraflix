import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const InfluencerWorldMap = ({ influencer }) => {
    const [geoData, setGeoData] = useState(null);
    const [influenceData, setInfluenceData] = useState(null);
    const [processedGeoData, setProcessedGeoData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const legendRef = React.useRef();
    const [map, setMap] = useState(null);
    
    const fetchGeminiInfluenceData = async (influencer) => {
        try {
          console.log("Fetching Gemini-generated influence data for:", influencer.name || influencer.country);
      
          // Prepare the request payload
          const payload = {
            influencer_name: influencer.name || "Anonymous Influencer",
            influencer_country: influencer.country || "United States",
            influencer_category: influencer.category || "Technology",
            base_influence_score: influencer.influence_score || 50,
            request_type: "generate_world_influence"
          };
      
          // Make the API call to your FastAPI backend
          const response = await fetch('/api/gemini/generate-influence', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
      
          // Parse the response
          const data = await response.json();
          console.log("Received Gemini influence data:", data);
          
          return data.influence_map;
        } catch (error) {
          console.error("Error fetching Gemini influence data:", error);
          // Return fallback data in case of error
          return generateFallbackInfluenceData(influencer);
        }
    };
      
    // Fallback function to generate influence data locally if API fails
    const generateFallbackInfluenceData = (influencer) => {
        console.log("Generating fallback influence data");
        
        // Expanded list of countries for fallback data
        const countries = [
          "United States", "United States of America", "USA", // Multiple names for US
          "United Kingdom", "Great Britain", "UK", // Multiple names for UK
          "Canada", "Australia", "New Zealand",
          "Germany", "France", "Spain", "Italy", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Greece", "Portugal", "Ireland",
          "Japan", "China", "South Korea", "North Korea", "India", "Indonesia", "Thailand", "Vietnam", "Malaysia", "Singapore", "Philippines",
          "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Ecuador",
          "South Africa", "Nigeria", "Egypt", "Kenya", "Morocco", "Ghana", "Ethiopia", "Tanzania",
          "Russia", "Turkey", "Saudi Arabia", "United Arab Emirates", "Israel", "Iran", "Iraq", "Pakistan"
        ];
        
        // Generate influence values based on proximity to influencer's country
        const baseScore = influencer.influence_score || 70; // Increased base score
        const influenceMap = {};
        
        // Helper function to get continent for a country (simplified)
        const getContinent = (country) => {
          const northAmerica = ["United States", "United States of America", "USA", "Canada", "Mexico"];
          const europe = ["United Kingdom", "Great Britain", "UK", "Germany", "France", "Spain", "Italy", "Netherlands", 
                         "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland", 
                         "Greece", "Portugal", "Ireland"];
          const asia = ["Japan", "China", "South Korea", "North Korea", "India", "Indonesia", "Thailand", 
                       "Vietnam", "Malaysia", "Singapore", "Philippines", "Pakistan"];
          const oceania = ["Australia", "New Zealand"];
          const southAmerica = ["Brazil", "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Ecuador"];
          const africa = ["South Africa", "Nigeria", "Egypt", "Kenya", "Morocco", "Ghana", "Ethiopia", "Tanzania"];
          const middleEast = ["Turkey", "Saudi Arabia", "United Arab Emirates", "Israel", "Iran", "Iraq"];
          
          if (northAmerica.includes(country)) return "North America";
          if (europe.includes(country)) return "Europe";
          if (asia.includes(country)) return "Asia";
          if (oceania.includes(country)) return "Oceania";
          if (southAmerica.includes(country)) return "South America";
          if (africa.includes(country)) return "Africa";
          if (middleEast.includes(country)) return "Middle East";
          return "Unknown";
        };
        
        // Influencer's home country gets the highest score
        const homeCountry = influencer.country || "United States";
        const homeContinent = getContinent(homeCountry);
        
        // Set values for each country
        countries.forEach(country => {
          if (country === homeCountry) {
            // Home country gets max score
            influenceMap[country] = baseScore;
          } else {
            // Geographical proximity factor
            const countryContinent = getContinent(country);
            let proximityFactor = 0.4; // Default for distant countries
            
            if (countryContinent === homeContinent) {
              proximityFactor = 0.8; // Same continent
            } else if (
              (homeContinent === "North America" && countryContinent === "Europe") ||
              (homeContinent === "Europe" && countryContinent === "North America") ||
              (homeContinent === "Asia" && countryContinent === "Middle East") ||
              (homeContinent === "Middle East" && countryContinent === "Asia")
            ) {
              proximityFactor = 0.6; // Culturally/economically connected continents
            }
            
            // Add some randomness but maintain the proximity pattern
            const randomVariation = 0.2 * (Math.random() - 0.5); // -0.1 to +0.1
            const adjustedFactor = Math.max(0.1, Math.min(0.9, proximityFactor + randomVariation));
            
            influenceMap[country] = Math.round(baseScore * adjustedFactor);
          }
        });
        
        return influenceMap;
    };
  
    // Step 1: Load GeoJSON data
    useEffect(() => {
        console.log("Attempting to load GeoJSON data...");
        setIsLoading(true);
        
        fetch('/world_countries.geojson')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("GeoJSON loaded successfully!");
            setGeoData(data);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Failed to load primary GeoJSON source:", err);
            
            // Fallback to alternate source
            fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
              .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
              })
              .then(data => {
                const filteredData = {
                  ...data,
                  features: data.features.filter(feature => {
                    const name = feature.properties.name || feature.properties.ADMIN;
                    return name !== "Antarctica";
                  })
                };
                setGeoData(filteredData);
                setIsLoading(false);
              })    
              .catch(alternateErr => {
                console.error("Failed to load alternate GeoJSON:", alternateErr);
                setError("Failed to load map data from both sources");
                setIsLoading(false);
              });
          });
    }, []); // Empty dependency array - only runs once
    
    // Step 2: Fetch influence data when influencer changes
    useEffect(() => {
        if (!influencer) return;
        
        setIsLoading(true);
        fetchGeminiInfluenceData(influencer)
          .then(influenceMap => {
            console.log("Setting influence data:", influenceMap);
            setInfluenceData(influenceMap);
            setIsLoading(false);
          })
          .catch(err => {
            console.error("Error in influence data workflow:", err);
            setError("Failed to generate influence data");
            setIsLoading(false);
          });
    }, [influencer]);
    
    // Step 3: Process GeoJSON with influence data
    useEffect(() => {
        if (!geoData || !influenceData) return;
        
        // Make a deep copy of the data
        const processedData = JSON.parse(JSON.stringify(geoData));
        
        // Apply influence to countries
        processedData.features.forEach(feature => {
          const properties = feature.properties;
          const countryNames = [
            properties.name,
            properties.name_en,
            properties.ADMIN,
            properties.NAME,
            properties.NAME_LONG,
            properties.FORMAL_EN,
            properties.sovereignt,
            properties.SOV_A3
          ].filter(Boolean);
          
          // Try to find a match in our influence data
          let matched = false;
          for (const name of countryNames) {
            if (!name) continue;
            
            // Handle special cases for US
            if ((name === "United States" || name === "United States of America" || name === "USA") &&
                (influenceData["United States"] || influenceData["United States of America"] || influenceData["USA"])) {
              // Use any available US influence data
              feature.properties.influence = influenceData["United States"] || 
                                            influenceData["United States of America"] || 
                                            influenceData["USA"];
              matched = true;
              break;
            }
            
            // Standard matching
            if (influenceData[name]) {
              feature.properties.influence = influenceData[name];
              matched = true;
              break;
            }
          }
          
          // If no match found, set a default low influence
          if (!matched) {
            feature.properties.influence = Math.floor(Math.random() * 10); // Random value between 0-9
          }
        });
        
        // Update the processed data
        setProcessedGeoData(processedData);
        
    }, [geoData, influenceData]);
    
    // Color scale for the map
    const getColor = (influence) => {
        return influence > 80 ? '#08306B' : // Very high (dark blue)
               influence > 60 ? '#1D5096' : // High (medium blue)
               influence > 40 ? '#4292C6' : // Medium-high (light blue)
               influence > 20 ? '#C6DBEF' : // Medium (very light blue)
               influence > 10 ? '#FDDBC7' : // Medium-low (light red)
               influence > 5  ? '#EF6548' : // Low (medium red)
               influence > 0  ? '#B30000' : // Very low (dark red)
                                '#EEEEEE';  // No data (light gray)
      };
    
    const style = (feature) => {
        const influence = feature.properties.influence || 0;
        
        return {
          fillColor: getColor(influence),
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
    };
    
    const onEachFeature = (feature, layer) => {
        const properties = feature.properties;
        const countryName = properties.name || properties.NAME || properties.sovereignt || "Unknown";
        const influence = properties.influence ? properties.influence.toFixed(1) : "0";
        
        layer.bindPopup(`
          <strong>${countryName}</strong><br/>
          Influence: ${influence}
        `);
    };
    
    
    if (isLoading) {
        return <div>Loading world map data...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
    }
    
    if (!processedGeoData) {
        return <div>Processing map data...</div>;
    }
    
    return (
        <div style={{ height: "500px", width: "100%" }}>
          <MapContainer 
            whenCreated={setMap}
            center={[20, 0]} 
            zoom={2} 
            style={{ height: "100%", width: "100%" }}
            ref={mapRef => {
              if (mapRef) {
                legendRef.current = mapRef;
              }
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {processedGeoData && (
              <GeoJSON 
                data={processedGeoData} 
                style={style} 
                onEachFeature={onEachFeature} 
              />
            )}
            
          </MapContainer>
            <div className="mt-4 ml-auto w-fit bg-white p-2.5 border border-gray-300 rounded shadow-sm">
            <h4 className="text-sm font-medium mb-2">Influence Level</h4>
            
            <div className="space-y-1">
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#08306B' }}></span>
                <span className="text-xs">80+ (Very high)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#1D5096' }}></span>
                <span className="text-xs">60–80 (High)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#4292C6' }}></span>
                <span className="text-xs">40–60 (Medium-high)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#C6DBEF' }}></span>
                <span className="text-xs">20–40 (Medium)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#FDDBC7' }}></span>
                <span className="text-xs">10–20 (Medium-low)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#EF6548' }}></span>
                <span className="text-xs">5–10 (Low)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#B30000' }}></span>
                <span className="text-xs">1–5 (Very low)</span>
                </div>
                <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 opacity-70" style={{ backgroundColor: '#EEEEEE' }}></span>
                <span className="text-xs">0 (No influence)</span>
                </div>
            </div>
            </div>
        </div>
    );
};

export default InfluencerWorldMap;