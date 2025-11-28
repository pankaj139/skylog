# Product Requirements Document (PRD)

**Project Name:** SkyLog (Provisional Title)

**Version:** 1.1  
**Status:** Draft  
**Date:** November 26, 2025

## 1. Executive Summary

SkyLog is a personal flight tracking application designed to visualize a user's travel history on an interactive 3D globe. It allows users to log detailed flight information, view a comprehensive history of their journeys, and relive specific trips through a cinematic, animated globe experience similar to travel visualization tools like "Mult.dev".

## 2. Problem Statement

Travelers often have scattered records of their flights across various emails and airline apps. Existing tools are either too complex (purely data-driven) or lack the aesthetic, animated visual appeal of modern travel vlogs. Users want a centralized "digital flight diary" that looks beautiful and creates shareable, visual memories of their trips.

## 3. Target Audience

- **Frequent Flyers**: Business travelers who want to track miles and routes.
- **Travel Enthusiasts**: People who want to visualize their "conquest" of the globe.
- **Content Creators**: Users who want to generate aesthetic flight path visualizations for social media.

## 4. Key Features & User Stories

### 4.1. The "My World" Dashboard

**Goal:** Provide a high-level summary of the user's travel footprint.

**Feature:** A home screen displaying aggregate statistics.

**User Story:** "As a user, I want to see a comprehensive statistical breakdown immediately upon logging in, including:"

- Total Countries Visited
- Total Distance Flown & Hours in Air
- Unique Airports Visited
- Total Airlines Flown
- Unique Aircraft Models Experienced (e.g., Boeing 747, Airbus A380)

**User Story:** "As a user, I want to see a spinning 3D globe populated with arcs representing all my past flights simultaneously."

### 4.2. Journey Management (CRUD)

**Goal:** Easy input and management of flight data.

**Feature:** Add/Edit/Delete Trip interface.

**User Story:** "As a user, I want to search for airports by city or IATA code so that I don't have to manually type coordinates."

**Data Points to Capture:**

- Origin Airport (IATA, City, Lat/Lng)
- Destination Airport (IATA, City, Lat/Lng)
- Airline & Flight Number
- Date of Travel
- Aircraft Type (Optional - Critical for Aircraft Model Stats)
- Seat Number / Class (Optional)
- Notes/Memories

### 4.3. The Detailed Journey View (The "Wow" Factor)

**Goal:** Detailed visualization of a single trip, inspired by the reference video.

**Feature:** A dedicated page for a specific trip with a focused 3D globe animation.

**User Story:** "As a user, when I click on a specific trip (e.g., 'Tokyo to London'), I want to be taken to a page where the globe zooms in to the route."

**Animation Requirements:**

- **Path Animation:** A line draws progressively from Origin to Destination along the geodesic curve.
- **Moving Vehicle:** A 3D model or icon of a plane moves along the path.
- **Camera Control:** The camera should auto-rotate or follow the plane for a cinematic effect.
- **Info Cards:** Display distance, duration, and airline details alongside the animation.

### 4.4. User History List

**Goal:** A searchable, filterable list of all data.

**Feature:** A tabular or card-based list view.

**User Story:** "As a user, I want to scroll through a chronological list of my past flights to find a specific trip from 2019."

**Filter & Search Capabilities:**

- Filter by year, airline, country, or aircraft type
- Sort by date, distance, or duration
- Search by airport codes or city names

### 4.5. Analytics & Insights Dashboard

**Goal:** Provide meaningful insights into travel patterns and environmental impact.

**Feature:** Advanced analytics with visualizations.

**User Stories:**

- "As a user, I want to see my carbon footprint across all flights and understand my environmental impact."
- "As a user, I want to see which airlines I fly most frequently and my loyalty program status."
- "As a user, I want to know my busiest travel months and identify travel patterns."

**Analytics to Include:**

- **Environmental Impact**
  - Total CO2 emissions by flight
  - Carbon footprint trends over time
  - Comparison to average traveler
  - Offset recommendations
  
- **Travel Patterns**
  - Most visited cities/countries
  - Busiest travel months (heatmap calendar)
  - Average trip duration
  - Domestic vs International ratio
  
- **Airline & Aircraft Analytics**
  - Airlines flown (pie chart)
  - Favorite aircraft models
  - On-time performance tracking (optional with API)
  - Seat class distribution (Economy/Business/First)

- **Geographic Insights**
  - Continents visited (progress toward visiting all 7)
  - Regional heatmap
  - Longest single flight
  - Most remote destination

### 4.6. Multi-Segment Trips & Itineraries

**Goal:** Group multiple flights into cohesive trips.

**Feature:** Trip grouping with layover visualization.

**User Story:** "As a user, when I took a trip from NYC → Paris → Rome → NYC, I want to group all three flight segments under one 'Europe Summer 2023' trip."

**Requirements:**

- Create Trip containers with custom names
- Add multiple flight segments to one trip
- Visualize layovers and connection times
- Calculate total trip duration vs actual flight time
- Show complete journey path on globe (multi-arc)

### 4.7. Gamification & Achievements

**Goal:** Motivate users to explore and engage with the app.

**Feature:** Badges, achievements, and travel goals.

**User Stories:**

- "As a user, I want to earn badges when I hit milestones like '10 countries visited' or 'First transcontinental flight.'"
- "As a user, I want to set goals like 'Visit all 7 continents' and track my progress."

**Achievement Examples:**

- 🌍 **Globe Trotter**: Visit 25+ countries
- ✈️ **Frequent Flyer**: Log 50+ flights
- 🌏 **Continental Explorer**: Visit all 7 continents
- 🛫 **Aircraft Collector**: Fly on 10+ different aircraft models
- 🌙 **Red-Eye Warrior**: Take overnight flights
- 🏝️ **Island Hopper**: Visit 5+ island destinations

**Goal Tracking:**

- User-defined goals (e.g., "Visit 30 countries by 2025")
- Progress bars and milestone notifications
- Personal travel bucket list

### 4.8. Social Sharing & Export

**Goal:** Enable users to share their travel stories.

**Feature:** Generate shareable content and export data.

**User Stories:**

- "As a user, I want to generate a shareable link to my animated journey that I can post on Instagram."
- "As a user, I want to export my year-end travel summary as a beautiful infographic."

**Sharing Options:**

- Share specific journey animation (public link with embedded globe)
- Generate video clips of flight animations (MP4/GIF export)
- "Year in Review" automated summary with statistics
- Export trip history as PDF report
- Share statistics as social media cards

**Privacy Controls:**

- Public/Private trip visibility
- Selective sharing (choose which trips are visible)
- Anonymous mode (hide personal details)

### 4.9. Smart Data Import

**Goal:** Reduce manual entry through intelligent import.

**Feature:** Auto-detect and import flight data from various sources.

**User Stories:**

- "As a user, I want to connect my Gmail account and have the app automatically detect flight confirmations."
- "As a user, I want to import my entire flight history from TripIt with one click."

**Import Methods:**

- **Email Integration**: Parse Gmail/Outlook for flight confirmations (airline emails)
- **CSV Bulk Import**: Upload spreadsheet with flight data
- **Third-Party Services**: Import from TripIt, Google Trips, Tripadvisor
- **Manual Quick Add**: Simplified form with airport autocomplete

### 4.10. Photos & Memories

**Goal:** Create a visual travel diary beyond just flight paths.

**Feature:** Attach photos and notes to flights and trips.

**User Story:** "As a user, I want to upload photos from my trip and see them displayed alongside the flight animation and route."

**Requirements:**

- Upload multiple photos per flight/trip
- Photo gallery view with geolocation tags
- Timeline view mixing flights and photos
- Add rich-text notes and journal entries
- Link photos to specific locations on the globe

### 4.11. Advanced Globe Visualizations

**Goal:** Provide multiple ways to visualize travel data.

**Feature:** Different globe visualization modes.

**Visualization Modes:**

- **All Routes**: Show all historical flights simultaneously
- **Time-Lapse**: Animate travel history chronologically (year by year)
- **Filtered View**: Show only specific year/airline/continent
- **Heatmap Mode**: Color regions by visit frequency
- **Comparison Mode**: Compare two different trips side-by-side
- **Future Routes**: Visualize planned/upcoming trips in different color

**Customization Options:**

- Adjustable arc colors (by airline, by year, by trip type)
- Globe skin selection (realistic earth, flat blue, dark mode, satellite)
- Path thickness and animation speed controls
- Toggle airport markers on/off

### 4.12. Trip Planning & Bucket List

**Goal:** Help users plan future travels.

**Feature:** Bucket list destinations and hypothetical route visualization.

**User Story:** "As a user, I want to add 'Tokyo' to my bucket list and visualize what the route from my home airport would look like."

**Requirements:**

- Add destinations to "Want to Visit" list
- Visualize hypothetical routes on globe (in different style/color)
- Get distance/duration estimates for planned trips
- Receive suggestions based on travel history ("You might enjoy...")
- Seasonal recommendations

## 5. Functional Requirements

### 5.1. Authentication

- Sign up/Login via Email/Password or Google Auth.
- Secure session management.

### 5.2. Database & Storage

**Users Collection:**

- Profile info (name, email, home airport)
- Settings (privacy preferences, default globe theme)
- Account creation date

**Flights Collection:**

- Individual flight segments linked to userId
- All flight data (origin, destination, airline, date, aircraft, seat, etc.)
- Photos array (URLs to storage)
- Notes/memories (rich text)
- Carbon emissions calculated
- Status: completed/upcoming

**Trips Collection:**

- Trip containers grouping multiple flights
- Trip name and dates
- Trip photos and description
- Custom trip metadata

**Achievements Collection:**

- User progress toward badges
- Unlocked achievements with timestamps
- Custom goals set by user

**Bucket List Collection:**

- Desired destinations
- Priority ranking
- Notes and planned dates

**Airports Database:**

- Read-only collection or static JSON
- IATA codes, coordinates, city, country
- Timezone information

**Social Collection (Optional for Phase 3):**

- Shared trips (public visibility)
- User followers/following
- Comments/likes on shared journeys

**File Storage:**

- User-uploaded photos (Cloud Storage/S3)
- Generated exports (PDFs, videos)
- Profile pictures

### 5.3. Visualization Engine

- Must support WebGL for 3D rendering.
- Must support "Arc" layers for flight paths.
- Must support "Point" layers for airports.
- Must support custom object animation (the plane icon moving along the path).
- Must support camera animation and auto-rotation.
- Must support custom textures for globe skins.
- Must handle multiple visualization modes (heatmap, time-lapse, filtered).

### 5.4. Analytics Engine

- Calculate aggregated statistics from flight data
- Carbon footprint calculator based on distance and aircraft type
- Pattern recognition (most visited, travel frequency)
- Achievement unlock logic
- Progress tracking for user goals

### 5.5. Import & Export

- Email parsing service (Gmail API integration)
- CSV parser with validation
- PDF generator for reports
- Video/GIF export of globe animations
- Social media card generator (Open Graph images)

## 6. Non-Functional Requirements

- **Performance:** The 3D globe must render at 60fps on modern devices.
- **Responsiveness:** The dashboard and lists must be fully responsive on mobile. The 3D globe should support touch interaction (pinch zoom, rotate).
- **Aesthetics:** Dark mode is preferred for the globe view to make the flight paths "pop" (neon colors on dark earth).
- **Accessibility:** WCAG 2.1 AA compliance for dashboard and forms.
- **Data Privacy:** GDPR compliant, user data encryption at rest and in transit.
- **Scalability:** Support for 1000+ flights per user without performance degradation.

## 7. Technology Stack Recommendation

### Frontend

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (for dashboard/forms)
- **State Management:** Zustand or React Context
- **Routing:** React Router

### 3D Visualization

- **Core Library:** react-globe.gl (Wrapper around Three.js)
- **Why?** It has built-in support for Arcs (flight paths), Points (airports), and custom HTML markers. It is highly optimized for this exact use case.
- **Additional:** Three.js for custom 3D plane models

### Charts & Analytics

- **Recharts** or **Chart.js**: For statistics visualizations (pie charts, bar graphs)
- **react-calendar-heatmap**: For travel frequency calendar
- **D3.js**: For custom data visualizations if needed

### Backend / Data

- **Platform:** Firebase (BaaS)
- **Firestore:** For storing flight history and user profiles
- **Authentication:** Firebase Auth (Email/Password + Google OAuth)
- **Storage:** Firebase Storage for photos and generated files
- **Functions:** Firebase Cloud Functions for server-side logic (email parsing, analytics calculation)

### External APIs & Data Sources

- **OpenFlights Data:** Static airport database (IATA codes, coordinates)
- **Gmail API** (Phase 2): Email integration for automatic flight detection
- **Carbon Interface API** (Phase 2): Carbon emissions calculation
- **AviationStack** (Optional): Real-time flight data and airline information

### Export & Generation

- **jsPDF** or **react-pdf**: PDF generation for reports
- **html2canvas**: Screenshot generation for social media cards
- **canvas-to-video**: GIF/video export of globe animations

### Development Tools

- **ESLint + Prettier**: Code quality
- **Vitest**: Unit testing
- **Playwright**: E2E testing
- **TypeScript**: Type safety

## 8. UX/UI Wireframe Concepts

### Dashboard Layout

```text
+-------------------------------------------------------------+
|  [Logo]       [My Globe]   [History]      [Profile]         |
+-------------------------------------------------------------+
|                                                             |
|   WELCOME BACK, [USER]                                      |
|                                                             |
|   [ STATS ROW ]                                             |
|   +----------+  +----------+  +----------+  +-----------+   |
|   | Airports |  | Airlines |  | Models   |  | Countries |   |
|   |    12    |  |     8    |  |    5     |  |    15     |   |
|   +----------+  +----------+  +----------+  +-----------+   |
|                                                             |
|   [ BIG INTERACTIVE GLOBE WIDGET ]                          |
|   (Shows all historical paths at once)                      |
|                                                             |
|   RECENT TRIPS                                              |
|   [ NYC -> LHR ] [ DXB -> SIN ] [ SYD -> LAX ]              |
|                                                             |
+-------------------------------------------------------------+
```

### Single Journey Detail Page

```text
+-------------------------------------------------------+
|  < Back to Dashboard                                  |
+-------------------------------------------------------+
|                                                       |
|  [                                                 ]  |
|  [           FULL SCREEN ANIMATED GLOBE            ]  |
|  [     (Camera tracks plane from Origin -> Dest)   ]  |
|  [                                                 ]  |
|                                                       |
|  +-----------------------------------------------+    |
|  |  TRIP DETAILS (Overlay Card)                  |    |
|  |  -------------------------------------------  |    |
|  |  Flight: BA112     | Airline: British Airways |    |
|  |  Date: Oct 2023    | Seat: 4A                 |    |
|  |  Dep: JFK (New York) -> Arr: LHR (London)     |    |
|  +-----------------------------------------------+    |
|                                                       |
+-------------------------------------------------------+
```

### Analytics Page

```text
+-------------------------------------------------------+
|  [Navigation]                                         |
+-------------------------------------------------------+
|  YOUR TRAVEL INSIGHTS                                 |
|                                                       |
|  +----------------------+  +----------------------+   |
|  | CARBON FOOTPRINT     |  | TRAVEL PATTERNS      |   |
|  | [Chart: CO2 trends]  |  | [Calendar Heatmap]   |   |
|  +----------------------+  +----------------------+   |
|                                                       |
|  +----------------------+  +----------------------+   |
|  | AIRLINES FLOWN       |  | GEOGRAPHIC BREAKDOWN |   |
|  | [Pie Chart]          |  | [Regional Map]       |   |
|  +----------------------+  +----------------------+   |
|                                                       |
+-------------------------------------------------------+
```

## 9. Roadmap

### Phase 1 (MVP - 8-10 weeks)

**Core Features:**

- User authentication (Email + Google)
- Manual flight entry with airport autocomplete
- Basic globe with flight path arcs
- Dashboard with statistics (flights, airports, airlines, countries)
- History list with search/filter
- Individual journey detail view
- Responsive design
- Dark mode

**Deliverables:**

- Functioning web app
- Firebase backend setup
- Airport database integrated

### Phase 2 (Enhanced Experience - 6-8 weeks)

**Features:**

- Animated plane icon moving along paths
- Cinema mode camera controls
- Multi-segment trip grouping
- Photos & memories (upload and attach to flights)
- Basic analytics dashboard (travel patterns, CO2 tracking)
- CSV import
- Export trip as PDF

**Deliverables:**

- Advanced globe animations
- Photo storage and display
- Analytics visualizations

### Phase 3 (Social & Advanced - 8-10 weeks)

**Features:**

- Gamification & achievements
- Goal tracking and bucket list
- Social sharing (public trip links)
- Video/GIF export of animations
- Year in Review automated summary
- Gmail integration for auto-import
- Advanced visualizations (heatmap, time-lapse, comparison modes)
- Globe customization options

**Deliverables:**

- Social features
- Email parsing integration
- Advanced export capabilities
- Gamification system

### Future Enhancements (Phase 4+)

- Mobile apps (iOS/Android with React Native)
- Offline mode with data caching
- Social network features (follow friends, leaderboards)
- AR visualization of flight paths
- Integration with loyalty programs
- Real-time flight tracking
- AI-powered travel recommendations

## 10. Success Metrics

### User Engagement

- Daily Active Users (DAU)
- Average flights logged per user
- Time spent on globe visualization
- Return user rate

### Feature Adoption

- Percentage of users who complete profile
- Photo upload rate
- Share/export usage
- Achievement completion rate

### Technical Performance

- Globe rendering FPS (target: 60fps)
- Page load time (target: <2s)
- API response time (target: <500ms)
- Crash-free sessions (target: >99%)

### User Satisfaction

- Net Promoter Score (NPS)
- User retention (7-day, 30-day)
- Feature satisfaction ratings
- Support ticket volume
