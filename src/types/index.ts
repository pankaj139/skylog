/**
 * SkyLog Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout the SkyLog application.
 * Includes types for users, flights, trips, airports, analytics, and visualization data.
 * 
 * Updated: Phase 2 - Added Trip types, photo support, and analytics types
 */

// User types
export interface TravelPreferences {
    travelStyle?: string[]; // e.g., ['Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'Urban']
    budgetLevel?: 'Budget' | 'Mid-Range' | 'Luxury';
    accommodationType?: string[]; // e.g., ['Hotels', 'Hostels', 'Resorts', 'Airbnb']
    interests?: string[]; // e.g., ['History', 'Art', 'Sports', 'Wildlife', '']
}

export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    homeAirport?: string;
    preferences?: TravelPreferences;
}

// Airport types
export interface Airport {
    iata: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone?: string;
}

// Flight types
export interface Flight {
    id: string;
    userId: string;

    // Origin & Destination
    originAirport: Airport;
    destinationAirport: Airport;

    // Flight details
    airline: string;
    flightNumber?: string;
    date: Date;

    // Optional details
    aircraftType?: string;
    seatNumber?: string;
    seatClass?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
    pnr?: string; // Passenger Name Record / Booking reference
    notes?: string;

    // Phase 2: Photos & Trip association
    photos?: string[]; // Array of photo URLs from Firebase Storage
    tripId?: string; // Optional trip this flight belongs to

    // Calculated fields
    distance?: number; // in km
    duration?: number; // in minutes
    carbonEmissions?: number; // in kg CO2

    // Metadata
    createdAt: Date;
    updatedAt: Date;

    // Phase 4: Real-time Tracking
    status?: FlightStatus;
    liveData?: LiveFlightData;
}

export type FlightStatus = 'scheduled' | 'active' | 'landed' | 'cancelled' | 'delayed';

export interface LiveFlightData {
    altitude: number; // feet
    speed: number; // knots
    heading: number; // degrees
    currentLat: number;
    currentLng: number;
    estimatedArrival: Date;
    progress: number; // 0-100 percentage
}

// Trip types - Phase 2: Multi-segment trip grouping
export interface Trip {
    id: string;
    userId: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    flightIds: string[]; // Array of flight IDs belonging to this trip
    coverPhoto?: string; // URL to cover photo
    tags?: string[]; // Optional tags like "Business", "Vacation", etc.
    createdAt: Date;
    updatedAt: Date;
}

// Trip form data for creating/editing trips
export interface TripFormData {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    flightIds: string[];
    coverPhoto?: string;
    tags: string[];
}

// Statistics types
export interface TravelStatistics {
    totalFlights: number;
    totalAirports: number;
    uniqueAirlines: number;
    countriesVisited: number;
    totalDistance: number; // km
    totalHours: number;

    // Detailed breakdowns
    airportsList: string[];
    airlinesList: string[];
    countriesList: string[];
    aircraftTypesList: string[];
}

// Globe visualization data
export interface ArcData {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color?: string;
    flight?: Flight;
}

export interface PointData {
    lat: number;
    lng: number;
    size?: number;
    color?: string;
    label?: string;
}

// Form data types
export interface FlightFormData {
    originAirport: Airport | null;
    destinationAirport: Airport | null;
    airline: string;
    flightNumber: string;
    date: string;
    aircraftType: string;
    seatNumber: string;
    seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First' | '';
    pnr: string; // Passenger Name Record / Booking reference
    notes: string;
    photos?: string[]; // Phase 2: Photo URLs
    tripId?: string; // Phase 2: Optional trip assignment
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Animation types
export interface CameraPosition {
    lat: number;
    lng: number;
    altitude: number;
}

export interface AnimationState {
    isAnimating: boolean;
    progress: number; // 0 to 1
    currentPosition: {
        lat: number;
        lng: number;
    };
}

// Phase 2: Globe control types
export interface GlobeControlsState {
    isPlaying: boolean;
    speed: number; // 0.5, 1, 2
    isCinemaMode: boolean;
    theme: 'night' | 'day' | 'satellite';
}

// Phase 2: Analytics types
export interface CarbonFootprintData {
    totalEmissions: number; // Total kg CO2
    averagePerFlight: number;
    byMonth: { month: string; emissions: number }[];
    byAircraft: { aircraft: string; emissions: number }[];
}

export interface TravelPatternData {
    byMonth: { month: string; count: number }[];
    byDayOfWeek: { day: string; count: number }[];
    domesticVsInternational: { type: string; count: number }[];
    averageTripDuration: number; // in days
}

export interface AirlineData {
    name: string;
    count: number;
    totalDistance: number;
    percentage: number;
}

export interface GeographicData {
    continents: { name: string; count: number; visited: boolean }[];
    topCountries: { country: string; count: number }[];
    topCities: { city: string; count: number }[];
    longestFlight: Flight | null;
    mostRemoteDestination: Airport | null;
}

// Phase 2: CSV Import types
export interface CSVFlightRow {
    originIata: string;
    destinationIata: string;
    airline: string;
    flightNumber?: string;
    date: string;
    aircraftType?: string;
    seatNumber?: string;
    seatClass?: string;
    pnr?: string; // Passenger Name Record / Booking reference
    notes?: string;
}

export interface CSVImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: { row: number; message: string }[];
}

// Phase 3: Gamification and Achievement types
export type AchievementCategory = 'flights' | 'destinations' | 'aircraft' | 'distance' | 'special';

export interface AchievementRequirement {
    type: 'flights' | 'countries' | 'continents' | 'airports' | 'airlines' | 'aircraft' | 'distance' | 'custom';
    value: number;
    customCheck?: (flights: Flight[]) => boolean;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    requirement: AchievementRequirement;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: Date;
}

export interface UserProgress {
    userId: string;
    achievements: UserAchievement[];
    stats: {
        totalFlights: number;
        countriesVisited: number;
        continentsVisited: number;
        airportsVisited: number;
        airlinesFlown: number;
        aircraftTypesFlown: number;
        totalDistance: number;
    };
    updatedAt: Date;
}

// Phase 3: Year in Review types
export interface YearInReviewData {
    year: number;
    totalFlights: number;
    totalDistance: number;
    totalDuration: number;
    countriesVisited: string[];
    citiesVisited: string[];
    airlinesFlown: string[];
    longestFlight: Flight | null;
    mostVisitedCity: { city: string; count: number } | null;
    mostFlownAirline: { airline: string; count: number } | null;
    firstFlightOfYear: Flight | null;
    lastFlightOfYear: Flight | null;
    newCountries: string[]; // Countries visited for the first time this year
    highlights: { label: string; value: string; icon: string }[];
}

// Phase 4: Social Network types
export interface SocialUser {
    id: string;
    displayName: string;
    photoURL?: string;
    homeAirport?: string;
    stats: {
        totalFlights: number;
        countriesVisited: number;
        totalDistance: number;
    };
}

export interface SocialActivity {
    id: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    type: 'trip_added' | 'achievement_unlocked' | 'milestone_reached';
    data: {
        tripId?: string;
        tripName?: string;
        achievementId?: string;
        achievementName?: string;
        milestone?: string;
    };
    createdAt: Date;
    likes: string[]; // Array of userIds
    comments: SocialComment[];
}

export interface SocialComment {
    id: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    text: string;
    createdAt: Date;
}
