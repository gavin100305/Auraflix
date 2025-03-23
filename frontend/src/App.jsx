import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Influencers from "./pages/Influencers";
import ProtectedRoute from "./components/ProtectedRoute";
import InfluencerList from "./components/InfluencerList";
import InfluencerDetail from "./components/InfluencerDetail";
import Dashboard from "./components/Dashboard";
import InfluencerSuggestions from "./components/Analysis";
import CollabSimulator from "./components/CollabSimulator"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <InfluencerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencers"
            element={
              <ProtectedRoute>
                <Influencers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/influencers/:username"
            element={
              <ProtectedRoute>
                <InfluencerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <CollabSimulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="leaderboard"
              element={
                <ProtectedRoute>
                  <InfluencerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="suggestions"
              element={
                <ProtectedRoute>
                  <InfluencerSuggestions />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;