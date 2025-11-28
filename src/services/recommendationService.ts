import { getUserFlights } from './flightService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '../types';

export interface Recommendation {
    id: string;
    city: string;
    country: string;
    region: string;
    imageUrl: string;
    reason: string;
    matchScore: number; // 0-100
}

export interface RecommendationResponse {
    domestic: Recommendation[];
    international: Recommendation[];
}

const DESTINATIONS = [
    // Asia
    { city: 'Tokyo', country: 'Japan', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
    { city: 'Bangkok', country: 'Thailand', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
    { city: 'Singapore', country: 'Singapore', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { city: 'Seoul', country: 'South Korea', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80' },

    // Europe
    { city: 'Paris', country: 'France', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { city: 'London', country: 'UK', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { city: 'Rome', country: 'Italy', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { city: 'Barcelona', country: 'Spain', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80' },

    // North America
    { city: 'New York', country: 'USA', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { city: 'San Francisco', country: 'USA', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },
    { city: 'Vancouver', country: 'Canada', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80' },

    // Oceania
    { city: 'Sydney', country: 'Australia', region: 'Oceania', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
    { city: 'Auckland', country: 'New Zealand', region: 'Oceania', imageUrl: 'https://images.unsplash.com/photo-1507699622177-48857e215655?auto=format&fit=crop&w=800&q=80' },
];

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function getRecommendations(
    userId: string,
    runtimeFilters?: {
        month?: string;
        travelStyle?: string[];
        budgetLevel?: string;
    }
): Promise<RecommendationResponse> {
    try {
        // Fetch user preferences
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.exists() ? userDoc.data() as User : null;
        const preferences = userData?.preferences;

        const flights = await getUserFlights(userId);
        const visitedCountries = new Set<string>();
        const visitedRegions = new Set<string>();
        const visitedCities = new Set<string>();

        // Determine home country (most common departure country)
        const countryCount: Record<string, number> = {};
        flights.forEach(f => {
            visitedCountries.add(f.destinationAirport.country);
            visitedCities.add(f.destinationAirport.city);
            countryCount[f.originAirport.country] = (countryCount[f.originAirport.country] || 0) + 1;

            // Simple region mapping
            if (['Japan', 'China', 'Thailand', 'Singapore', 'South Korea', 'India', 'Vietnam', 'Indonesia'].includes(f.destinationAirport.country)) {
                visitedRegions.add('Asia');
            } else if (['France', 'UK', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Portugal', 'Greece'].includes(f.destinationAirport.country)) {
                visitedRegions.add('Europe');
            } else if (['USA', 'Canada', 'Mexico'].includes(f.destinationAirport.country)) {
                visitedRegions.add('North America');
            } else if (['Australia', 'New Zealand'].includes(f.destinationAirport.country)) {
                visitedRegions.add('Oceania');
            }
        });

        const homeCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'India';

        // Build preferences string (merge saved + runtime)
        const effectivePreferences = {
            travelStyle: runtimeFilters?.travelStyle?.length ? runtimeFilters.travelStyle : (preferences?.travelStyle || []),
            budgetLevel: runtimeFilters?.budgetLevel || preferences?.budgetLevel || 'Not specified',
            accommodationType: preferences?.accommodationType || [],
            interests: preferences?.interests || []
        };

        const preferencesText = `
            Travel Style: ${effectivePreferences.travelStyle.join(', ') || 'Not specified'}
            Budget Level: ${effectivePreferences.budgetLevel}
            Accommodation: ${effectivePreferences.accommodationType.join(', ') || 'Not specified'}
            Interests: ${effectivePreferences.interests.join(', ') || 'Not specified'}
        `;

        const monthContext = runtimeFilters?.month
            ? `\n                    Travel Month: ${runtimeFilters.month}\n                    Consider seasonal factors: weather, festivals, peak/off-season pricing for ${runtimeFilters.month}.`
            : '';

        // If API key is available, use Gemini
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const prompt = `
                    You are a travel expert AI. Based on the user's travel history and preferences, suggest travel destinations.
                    
                    User's home country: ${homeCountry}
                    User has visited these countries: ${Array.from(visitedCountries).join(', ')}.
                    User has visited these cities: ${Array.from(visitedCities).join(', ')}.
                    User has visited these regions: ${Array.from(visitedRegions).join(', ')}.
                    
                    User Preferences:
                    ${preferencesText}${monthContext}
                    
                    Return TWO separate arrays:
                    
                    DOMESTIC (6 destinations within ${homeCountry}):
                    - Suggest cities in ${homeCountry} they haven't visited or rarely visit
                    - DO NOT suggest cities from the visited cities list above
                    - Match suggestions to their travel style and interests
                    - Provide varied experiences (beaches, mountains, heritage, modern cities, etc.)
                    
                    INTERNATIONAL (6 destinations outside ${homeCountry}):
                    - Suggest 3 cities in regions they have ALREADY visited
                    - Suggest 3 cities in regions they have NOT visited
                    - DO NOT suggest cities from the visited cities list above
                    - Match suggestions to their preferences
                    
                    For ALL destinations:
                    - Provide a "matchScore" (0-100)
                    - Provide a short, catchy "reason" (max 100 characters)
                    - Leave imageUrl as empty string ""
                    
                    Return ONLY valid JSON in this exact format:
                    {
                      "domestic": [
                        {
                          "city": "CityName",
                          "country": "${homeCountry}",
                          "region": "RegionName",
                          "imageUrl": "",
                          "reason": "Short reason here",
                          "matchScore": 85
                        }
                      ],
                      "international": [
                        {
                          "city": "CityName",
                          "country": "CountryName",
                          "region": "RegionName",
                          "imageUrl": "",
                          "reason": "Short reason here",
                          "matchScore": 90
                        }
                      ]
                    }
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean up markdown code blocks if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(jsonStr);

                // Map recommendations to our image database
                const mapImages = (recs: any[]) => recs.map((rec: any, index: number) => {
                    const matchingDest = DESTINATIONS.find(d =>
                        d.city.toLowerCase() === rec.city.toLowerCase() &&
                        d.country.toLowerCase() === rec.country.toLowerCase()
                    );

                    return {
                        id: `ai-rec-${index}`,
                        ...rec,
                        imageUrl: matchingDest?.imageUrl || `https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80`
                    };
                });

                return {
                    domestic: mapImages(aiResponse.domestic || []),
                    international: mapImages(aiResponse.international || [])
                };

            } catch (apiError) {
                console.error('❌ Gemini API failed, falling back to mock data:', apiError);
            }
        } else {
            console.warn('⚠️ No Gemini API key found, using mock recommendations');
        }

        // Fallback Mock Data
        const allRecommendations: Recommendation[] = [];

        // 1. Suggest unvisited cities in visited regions (Depth)
        DESTINATIONS.forEach(dest => {
            if (visitedRegions.has(dest.region) && !visitedCountries.has(dest.country)) {
                allRecommendations.push({
                    id: `rec-${dest.city}`,
                    city: dest.city,
                    country: dest.country,
                    region: dest.region,
                    imageUrl: dest.imageUrl,
                    reason: `Since you enjoy traveling in ${dest.region}, you might love ${dest.city}.`,
                    matchScore: 85 + Math.floor(Math.random() * 10)
                });
            }
        });

        // 2. Suggest popular cities in unvisited regions (Breadth)
        DESTINATIONS.forEach(dest => {
            if (!visitedRegions.has(dest.region)) {
                allRecommendations.push({
                    id: `rec-${dest.city}`,
                    city: dest.city,
                    country: dest.country,
                    region: dest.region,
                    imageUrl: dest.imageUrl,
                    reason: `Expand your horizons! Explore ${dest.region} starting with ${dest.city}.`,
                    matchScore: 70 + Math.floor(Math.random() * 15)
                });
            }
        });

        // Shuffle
        allRecommendations.sort(() => 0.5 - Math.random());

        // Split into domestic and international
        const domestic = allRecommendations.filter(r => r.country === homeCountry).slice(0, 6);
        const international = allRecommendations.filter(r => r.country !== homeCountry).slice(0, 6);

        return { domestic, international };

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return { domestic: [], international: [] };
    }
}
