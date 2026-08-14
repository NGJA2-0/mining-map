import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import NewRecordPage from "./pages/NewRecordPage";
import UpdateRecordPage from "./pages/UpdateRecordPage";
import SearchResultPage from "./pages/SearchResultPage";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/new"
            element={
              <ProtectedRoute>
                <NewRecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/update"
            element={
              <ProtectedRoute>
                <UpdateRecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/search-result"
            element={
              <ProtectedRoute>
                <SearchResultPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
