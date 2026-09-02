import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/login";
import { DashboardPage } from "./pages/dashboard/dashboard";
import { PatientsPage } from "./pages/patient/patient";
import { UsersPage } from "./pages/user/register";
import { VitalSignsPage } from "./pages/patient/vital-sign.modal";
import { ManageMedicalServicesPage } from "./pages/medical-service/ManageMedicalServices";
import { DoctorConsultationPage } from "./pages/medical-service/doctorConsultation";
import { LabTechnicianPage } from "./pages/lab/labtechnician";
import { PharmacyManagementPage } from "./pages/inventory/phamarcy";
import { PharmacyDispensePage } from "./pages/inventory/dispense";
import { InvoiceBillingPage } from "./pages/billing/billing";

// Route Guard for authenticated staff members
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Clinical Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/user-register"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/vital-signs"
          element={
            <ProtectedRoute>
              <VitalSignsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/medical-services"
          element={
            <ProtectedRoute>
              <ManageMedicalServicesPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/doctor-consultation"
          element={
            <ProtectedRoute>
              <DoctorConsultationPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/laboratory"
          element={
            <ProtectedRoute>
              <LabTechnicianPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <PharmacyManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/dispense"
          element={
            <ProtectedRoute>
              <PharmacyDispensePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <InvoiceBillingPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
