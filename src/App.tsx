/**
 * Main App Component
 * 
 * Root component handling routing and global modals.
 * Updated: Phase 3 - Added Achievements route and notifications
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import LoadingSpinner from './components/common/LoadingSpinner';
import AddFlightModal from './components/flights/AddFlightModal';
import CreateTripModal from './components/trips/CreateTripModal';
import { AchievementNotificationContainer } from './components/achievements/AchievementNotification';
import { useUIStore } from './store/uiStore';
import { useAchievementsStore } from './store/achievementsStore';

// Pages
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import JourneyDetail from './pages/JourneyDetail';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import YearInReview from './pages/YearInReview';
import SharedTrip from './pages/SharedTrip';
import Social from './pages/Social';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

/**
 * Root route: public landing for visitors, dashboard for signed-in users.
 */
function HomeRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Landing />;
}

function App() {
  useAuth(); // Initialize auth listener
  const {
    isAddFlightModalOpen,
    closeAddFlightModal,
    isCreateTripModalOpen,
    closeCreateTripModal,
  } = useUIStore();
  const { notifications, dismissNotification } = useAchievementsStore();

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journey/:id"
          element={
            <ProtectedRoute>
              <JourneyDetail />
            </ProtectedRoute>
          }
        />
        {/* Phase 2: Trip routes */}
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          }
        />
        {/* Phase 2: Analytics route */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        {/* Phase 3: Achievements route */}
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
        {/* Phase 3: Year in Review route */}
        <Route
          path="/year-review"
          element={
            <ProtectedRoute>
              <YearInReview />
            </ProtectedRoute>
          }
        />
        {/* Phase 4: Social route */}
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <Social />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:tripId" element={<SharedTrip />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Add Flight Modal */}
      <AddFlightModal isOpen={isAddFlightModalOpen} onClose={closeAddFlightModal} />

      {/* Phase 2: Global Create Trip Modal */}
      <CreateTripModal isOpen={isCreateTripModalOpen} onClose={closeCreateTripModal} />

      {/* Phase 3: Achievement Notifications */}
      <AchievementNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </Router>
  );
}

export default App;
