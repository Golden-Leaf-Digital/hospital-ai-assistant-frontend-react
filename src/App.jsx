import HospitalsPage from "@/pages/HospitalsPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
/* ================= ORG ROUTES ================= */
import HomePage from "./pages/[orgId]/HomePage";
import WhatsappWeb from "./pages/[orgId]/WhatsappWeb";

/* ================= AUTH ================= */
import ForgotPasswordPage from "./pages/forgot-password/ForgotPasswordPage";
import LoginPage from "./pages/login/LoginPage";
import SignUpPage from "./pages/sign-up/SignUpPage";

/* ================= QR & VOICE ================= */
import QrPage from "./pages/qr/QrPage";
import VoiceDeepgramSessionsPage from "./pages/voice-deepgram/VoiceDeepgramSessionsPage";
import VoicePage from "./pages/voice/VoicePage";

/* ================= ADMIN ================= */
import AdminDashboardPage from "./pages/admin/dashboard/AdminDashboardPage";
import DashboardPage from "./pages/admin/dashboard/create-org-user/DashboardPage";

/* ================= BILLING ================= */
import BillingLeadsDashboard from "./pages/billing/dashboard/billing-leads/BillingLeadsDashboard";
import BillingDashboard from "./pages/billing/dashboard/BillingDashboard";

/* ================= DOCTOR ================= */
import AddAppointments from "./pages/doctor/dashboard/add-appointments/AddAppointments";
import DoctorDashboard from "./pages/doctor/dashboard/DoctorDashboard";
import DoctorSchedulePage from "./pages/doctor/dashboard/schedule/DoctorSchedulePage";
import DoctorTimeOffPage from "./pages/doctor/dashboard/schedule/time-off/DoctorTimeOffPage";

/* ================= INSURANCE ================= */
import InsuranceLeadsDashboard from "./pages/insurance/dashboard/insurance-leads/InsuranceLeadsDashboard";
import InsuranceDashboard from "./pages/insurance/dashboard/InsuranceDashboard";

/* ================= RECEPTIONIST ================= */
import ReceptionistAddAppointments from "./pages/receptionist/dashboard/add-appointments/AddAppointments";
import ReceptionistDashboard from "./pages/receptionist/dashboard/ReceptionistDashboard";

/* ================= SUPERADMIN ================= */
import CreateOrganizationPage from "./pages/superadmin/dashboard/create-organization/CreateOrganizationPage";
import SuperAdminDashboard from "./pages/superadmin/dashboard/SuperAdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<HospitalsPage />} />
        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/login"
          element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
           
          }
        />

        <Route
          path="/sign-up"
          element={
            <PublicRoute>
                 <SignUpPage />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
           <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
            
          }
        />

        {/* QR + Voice (Optional: protect if needed) */}
        <Route path="/:orgId/qr" element={<QrPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/voice-deepgram" element={<VoiceDeepgramSessionsPage />} />

        {/* ================= ORG DYNAMIC ROUTES ================= */}

        <Route
  path="/:orgId/webchat"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/:orgId/whatsapp"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]}>
      <WhatsappWeb />
    </ProtectedRoute>
  }
/>

        {/* ================= PROTECTED ROUTES ================= */}

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/create-org-user"
          element={
             <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* BILLING */}
        <Route
          path="/billing/dashboard"
          element={
            
              <ProtectedRoute>
              <BillingDashboard />
            </ProtectedRoute>
           
          }
        />

        <Route
          path="/billing/dashboard/billing-leads"
          element={
         <ProtectedRoute>
              <BillingLeadsDashboard />
            </ProtectedRoute>
            
          }
        />

        {/* DOCTOR */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          
          }
        />

        <Route
          path="/doctor/dashboard/add-appointments"
          element={
            <ProtectedRoute>
              <AddAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/dashboard/schedule"
          element={
             <ProtectedRoute>
              <DoctorSchedulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/dashboard/schedule/time-off"
          element={
             <ProtectedRoute>
              <DoctorTimeOffPage />
            </ProtectedRoute>
          }
        />

        {/* INSURANCE */}
        <Route
          path="/insurance/dashboard"
          element={
             <ProtectedRoute>
              <InsuranceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insurance/dashboard/insurance-leads"
          element={
           <ProtectedRoute>
              <InsuranceLeadsDashboard />
            </ProtectedRoute>
          }
        />

        {/* RECEPTIONIST */}
        <Route
          path="/receptionist/dashboard"
          element={
         <ProtectedRoute>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/dashboard/add-appointments"
          element={
            <ProtectedRoute>
              <ReceptionistAddAppointments />
            </ProtectedRoute>
          }
        />
        <Route
  path="/receptionist/dashboard/insurance-leads"
  element={
    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
      <InsuranceLeadsDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/receptionist/dashboard/billing-leads"
  element={
    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
      <BillingLeadsDashboard />
    </ProtectedRoute>
  }
/>

        {/* SUPERADMIN */}
        <Route
          path="/superadmin/dashboard"
          element={
         <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/dashboard/create-organization"
          element={
           <ProtectedRoute>
              <CreateOrganizationPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}