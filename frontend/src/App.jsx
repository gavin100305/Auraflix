import Analysis from "./pages/Analysis";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Influencers from "./pages/Influencers";
import ProtectedRoute from "./components/ProtectedRoute";
import InfluencerList from "./components/InfluencerList";
import InfluencerDetail from "./components/InfluencerDetail";
import Suggestions from "./components/Analysis";

import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<Suggestions />} />
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
          <Route
            path="/influencers/:username"
            element={
              <ProtectedRoute>
                <InfluencerDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
