import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DirectionProvider } from "./context/DirectionProvider.jsx";
import { MapProvider } from "./context/MapContext";
import GuestRoute from "./components/GuestRoute.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import CallsMapPage from "./pages/CallsMapPage.jsx";

export default function App() {
  return (
    <DirectionProvider>
      <MapProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<QuizPage />} />
            <Route path="/map" element={<CallsMapPage />} />
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
