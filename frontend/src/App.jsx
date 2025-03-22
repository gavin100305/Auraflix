import Analysis from "./pages/Analysis";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Influencers from "./pages/Influencers"; // Import the new Influencers page
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InfluencerList from "./components/InfluencerList";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;