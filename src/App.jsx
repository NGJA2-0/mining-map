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
import MiniSahanaDashboardPage from "./pages/minisahana/MiniSahanaDashboardPage";
import MiniSahanaFormPage from "./pages/minisahana/application/MiniSahanaFormPage";
import ReportCardsDashboardPage from "./pages/minisahana/reportcards/ReportCardsDashboardPage";
import ReportCardForm from "./pages/minisahana/reportcards/ReportCardForm";
import ReportCardSearchPage from "./pages/minisahana/reportcards/ReportCardSearchPage";
import PaymentsPage from "./pages/minisahana/payments/PaymentsPage";
import PaymentsDashboardPage from "./pages/minisahana/payments/PaymentsDashboardPage";
import AnnualReportPage from "./pages/minisahana/payments/AnnualReportPage";
import StudentReportPage from "./pages/minisahana/payments/StudentReportPage";
import SideNav from "./pages/SideNav";
import "./index.css";
import MiniSahanaApplicationPreview from './pages/minisahana/application/MiniSahanaApplicationPreview';
import MiniSahanaAccountNumberEditForm from './pages/minisahana/application/MiniSahanaAccountNumberEditForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SideNav />
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
          <Route path="/dashboard/map" element={<ProtectedRoute><MiningMapPage /></ProtectedRoute>} />
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
                <MiniSahanaDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/applications/new"
            element={
              <ProtectedRoute>
                <MiniSahanaFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/report-cards"
            element={
              <ProtectedRoute>
                <ReportCardsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/report-cards/new"
            element={
              <ProtectedRoute>
                <ReportCardForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/report-cards/search"
            element={
              <ProtectedRoute>
                <ReportCardSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/payments"
            element={
              <ProtectedRoute>
                <PaymentsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minisahana/payments/pay"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/minisahana/payments/annual-report"
            element={
              <ProtectedRoute>
                <AnnualReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/minisahana/payments/student-report"
            element={
              <ProtectedRoute>
                <StudentReportPage />
              </ProtectedRoute>
            }
          />

          <Route path="/minisahana/applications/:id" element={<ProtectedRoute>
            <MiniSahanaApplicationPreview />
          </ProtectedRoute>} />
          
          <Route
            path="/minisahana/applications/:id/edit-account-number"
            element={
              <ProtectedRoute>
                <MiniSahanaAccountNumberEditForm />
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/select-app" replace />} />

          {/* Catch-all — must be last */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}