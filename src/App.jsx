import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MiningMapPage from "./pages/MiningMapPage";
import NewRecordPage from "./pages/NewRecordPage";
import UpdateRecordPage from "./pages/UpdateRecordPage";
import SearchResultPage from "./pages/SearchResultPage";
import ExtendRecordPage from "./pages/ExtendRecordPage";
import AppSelectionPage from "./pages/AppSelectionPage";
import MiniSahanaSelectionPage from "./pages/minisahana/MiniSahanaSelectionPage";
import MiniSahanaForm from "./pages/minisahana/MiniSahanaForm";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/select-app"
            element={
              <ProtectedRoute>
                <AppSelectionPage />
              </ProtectedRoute>
            }
          />
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
            path="/dashboard/extend"
            element={
              <ProtectedRoute>
                <ExtendRecordPage />
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
          <Route path="/dashboard/map" element={<MiningMapPage />} />
          <Route
            path="/minisahana"
            element={
              <ProtectedRoute>
                <MiniSahanaSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/applications"
            element={
              <ProtectedRoute>
                <MiniSahanaForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}