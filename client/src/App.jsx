import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DirectionProvider } from "./context/DirectionProvider.jsx";
import { MapProvider } from "./context/MapContext";
import GuestRoute from "./components/GuestRoute.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import CallsMapPage from "./pages/CallsMapPage.jsx";
import IsraelWarPage from "./pages/IsraelWarPage.jsx";
import AddictionsPage from "./pages/AddictionsPage.jsx";
import HealthPage from "./pages/HealthPage.jsx";
import SleepPage from "./pages/SleepPage.jsx";

export default function App() {
  return (
    <DirectionProvider>
      <MapProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<QuizPage />} />
            <Route path="/map" element={<CallsMapPage />} />
            <Route path="/graphs/israel" element={<IsraelWarPage />} />
            <Route path="/graphs/addictions" element={<AddictionsPage />} />
            <Route path="/graphs/health" element={<HealthPage />} />
            <Route path="/graphs/sleep" element={<SleepPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route
              path="/auth/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/auth/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MapProvider>
    </DirectionProvider>
  );
}
