import Analysis from "./pages/Analysis";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Influencers from "./pages/Influencers";
import ProtectedRoute from "./components/ProtectedRoute";
import InfluencerList from "./components/InfluencerList";
import InfluencerDetail from "./components/InfluencerDetail";
import Suggestions from "./components/Analysis";
import Dashboard from "./components/Dashboard";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import InfluencerSuggestions from "./components/Analysis";


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
          <Route
            path="/influencers/:username"
            element={
              <ProtectedRoute>
                <InfluencerDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={ <ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route
            path="leaderboard"
            element={
              <ProtectedRoute>
                <InfluencerList />
              </ProtectedRoute>
            }
          />
          <Route path="test" element={<InfluencerSuggestions/>} />
          <Route path="reports" element={<h1>reports</h1>} />
          <Route path="insights" element={<h1>insights</h1>} />
        </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
