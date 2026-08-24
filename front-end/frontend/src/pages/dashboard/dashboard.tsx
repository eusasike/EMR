import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";

export const DashboardPage: React.FC = () => {
  return (
    <AppLayout pageTitle="Clinical Overview">
      {/* High-level EMR Operational Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Inpatients</div>
          <div className="stat-value">42</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admissions Today</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available Ward Beds</div>
          <div className="stat-value">18</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Lab Results</div>
          <div className="stat-value">7</div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>
          Recent Activity
        </h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Welcome to Eletronic Medical Registry (EMR). Select a module from the
          sidebar to manage Patient Registrations, Wards, or Billing.
        </p>
      </div>
    </AppLayout>
  );
};
