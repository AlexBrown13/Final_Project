import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DirectionProvider } from "./context/DirectionProvider.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";

export default function App() {
  return (
    <DirectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DirectionProvider>
  );
}