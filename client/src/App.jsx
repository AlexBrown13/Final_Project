import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DirectionProvider } from "./context/DirectionProvider.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";

export default function App() {
  return (
    <DirectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuizPage />} />
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
    </DirectionProvider>
  );
}