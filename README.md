# ✈️ SkyLog - Your Personal Flight Journey Tracker

A modern, feature-rich web application for tracking your flight history, visualizing travel patterns, and discovering new destinations with AI-powered recommendations.

## 🌟 Features

### 📊 Flight Management
- **Manual Flight Entry** - Add flights with detailed information (airline, flight number, seat class, PNR, etc.)
- **CSV Import** - Bulk import flights from CSV files
- **Trip Organization** - Group flights into trips with photos and notes
- **Flight History** - Browse and search your complete flight history

### 🗺️ Interactive Visualizations
- **3D Globe** - Beautiful globe visualization showing all your flight routes
- **World Map** - Interactive map with flight paths and visited countries
- **Flight Animations** - Animated journey replays on the globe

### 📈 Analytics & Insights
- **Dashboard** - Overview of total flights, distance traveled, countries visited
- **Geographic Stats** - Continent progress, top countries, top cities
- **Travel Patterns** - Busiest months, preferred airlines, seat class preferences
- **Year in Review** - Annual travel summaries with highlights

### 🎯 Achievements & Gamification
- **Achievement System** - Unlock 60+ achievements across 5 categories:
  - Distance milestones
  - Country/continent explorer
  - Airline loyalty
  - Travel frequency
  - Special destinations
- **Leaderboards** - Compete with friends on distance, flights, and countries

### 🤖 AI-Powered Recommendations
- **Smart Suggestions** - Get personalized destination recommendations using Google Gemini AI
- **Travel Preferences** - Set your travel style, budget, and interests
- **Runtime Filters** - Customize recommendations by:
  - Travel month (seasonal recommendations)
  - Budget level (Budget, Mid-Range, Luxury)
  - Travel style (Adventure, Beach, Culture, etc.)
- **Domestic & International** - Separate recommendation sections
- **Visited Cities Exclusion** - Never get recommendations for places you've already been

### 👥 Social Features
- **User Profiles** - Customizable profiles with stats and achievements
- **Follow System** - Follow other travelers and see their achievements
- **Leaderboards** - Global and friends-only leaderboards
- **Activity Feed** - See recent flights from people you follow

### 🏆 Loyalty Program
- **Tier System** - Bronze, Silver, Gold, Platinum tiers based on distance
- **Progress Tracking** - Visual progress to next tier
- **Benefits Display** - See your tier benefits and status

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for trip photos)
- **3D Visualization**: React Globe.gl, Three.js
- **AI**: Google Gemini 2.0 Flash API
- **State Management**: Zustand
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google Gemini API key (optional, for AI recommendations)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd flightPath
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API (Optional - for AI recommendations)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
flightPath/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── achievements/  # Achievement cards and displays
│   │   ├── analytics/     # Dashboard charts and stats
│   │   ├── common/        # Buttons, modals, spinners
│   │   ├── flights/       # Flight cards and forms
│   │   ├── globe/         # 3D globe components
│   │   ├── import/        # CSV and Gmail import
│   │   ├── layout/        # Header, navigation
│   │   ├── loyalty/       # Loyalty tier cards
│   │   ├── profile/       # Profile editor, preferences
│   │   ├── recommendations/ # AI recommendation cards
│   │   ├── social/        # User cards, activity feed
│   │   └── trips/         # Trip management
│   ├── config/            # Firebase configuration
│   ├── data/              # Static data (achievements, airports)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (routes)
│   ├── services/          # API and business logic
│   ├── store/             # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── .env.local            # Environment variables (not committed)
```

## 🎮 Usage Guide

### Adding Your First Flight

1. Sign up / Log in
2. Click "Add Flight" button
3. Fill in flight details:
   - Origin and destination airports (use IATA codes or search)
   - Date of travel
   - Airline and flight number (optional)
   - Seat class and number (optional)
3. Click "Save Flight"

### Importing Flights

**From CSV:**
1. Go to History page
2. Click "Import CSV"
3. Upload your CSV file with columns: Date, Origin, Destination, Airline, etc.

### Setting Up AI Recommendations

1. Add your Gemini API key to `.env.local`
2. Go to Profile → Click "❤️ Preferences"
3. Set your travel preferences
4. Visit the "Explore" page
5. Use "Customize Search" to filter by month, style, or budget

### Creating Trips

1. Go to Trips page
2. Click "Create New Trip"
3. Add title, description, and dates
4. Add flights to the trip
5. Upload photos (optional)

## 🔑 API Keys Setup

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Enable Storage
6. Copy configuration values to `.env.local`

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env.local` as `VITE_GEMINI_API_KEY`

## 🎨 Design System

The app uses a modern glassmorphism design with:
- **Primary Colors**: Cyan (`#00ffff`) and Blue (`#0080ff`)
- **Dark Theme**: Dark background with glass cards
- **Neon Accents**: Glowing effects on interactive elements
- **Smooth Animations**: Transitions and micro-interactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Airport data from [OpenFlights](https://openflights.org/)
- Globe visualization powered by [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- Icons from [Lucide React](https://lucide.dev/)
- AI recommendations powered by [Google Gemini](https://ai.google.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for travel enthusiasts**
