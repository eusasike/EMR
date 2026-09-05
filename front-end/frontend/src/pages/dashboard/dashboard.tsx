import React, { useState, useEffect } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  getFacilityDashboardApi,
  type FacilityDashboardData,
} from "../../api/dashboard/dashboard";
import axios from "axios";

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] =
    useState<FacilityDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getFacilityDashboardApi();
        setDashboardData(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              "Failed to retrieve facility dashboard overview.",
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stockSummary = dashboardData?.stockSummary || [];
  const maxStock = Math.max(...stockSummary.map((p) => p.totalStock), 10);

  // Array of distinct color options for chart bars
  const chartColors = [
    "#0ea5e9", // Sky Blue
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#14b8a6", // Teal
    "#f97316", // Orange
  ];

  return (
    <AppLayout pageTitle="Clinical Overview">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="alert-danger p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* High-level EMR Operational Metrics (Horizontal Side-by-Side) */}
        <div className="flex flex-row gap-4">
          <div className="stat-card p-5 bg-white rounded-lg border border-slate-200 shadow-sm flex-1">
            <div className="stat-label text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Active Visits In-Progress
            </div>
            <div className="stat-value text-3xl font-bold text-slate-800 mt-2">
              {loading ? "..." : dashboardData?.activeVisitsCount || 0}
            </div>
          </div>

          <div className="stat-card p-5 bg-white rounded-lg border border-slate-200 shadow-sm flex-1">
            <div className="stat-label text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Pending Lab Results
            </div>
            <div className="stat-value text-3xl font-bold text-amber-600 mt-2">
              {loading ? "..." : dashboardData?.globalPendingLabsCount || 0}
            </div>
          </div>
        </div>

        {/* Recent Facility Visits Table */}
        <div className="table-card bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-md font-semibold text-slate-800">
              Recent Active Visits
            </h3>
            <span className="text-xs text-slate-500">
              Showing latest facility admissions/visits
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="emr-table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-400 text-xs uppercase">
                  <th className="p-3">Patient MRN</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Symptoms</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-6">
                      Loading recent visits...
                    </td>
                  </tr>
                ) : dashboardData?.recentVisits &&
                  dashboardData.recentVisits.length > 0 ? (
                  dashboardData.recentVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-3 code-badge font-mono text-xs">
                        {visit.patient.mrn}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {visit.patient.firstName} {visit.patient.lastName}
                      </td>
                      <td className="p-3 text-slate-600">
                        {visit.symptoms || "—"}
                      </td>
                      <td className="p-3">
                        <span className="badge badge-in-progress px-2 py-1 text-xs rounded bg-sky-50 text-sky-700 font-medium">
                          {visit.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">
                        {new Date(visit.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-6">
                      No active visits recorded for this facility.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Summary Per Product Table */}
        <div className="table-card bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-md font-semibold text-slate-800">
              Pharmacy Product Stock Summary
            </h3>
            <span className="text-xs text-slate-500">
              Total Catalog Items: {stockSummary.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="emr-table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-400 text-xs uppercase">
                  <th className="p-3">Product Code</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Total Stock Available</th>
                  <th className="p-3">Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-500 py-6">
                      Loading inventory summary...
                    </td>
                  </tr>
                ) : stockSummary.length > 0 ? (
                  stockSummary.map((prod) => {
                    const isLow = prod.totalStock <= 10 && prod.totalStock > 0;
                    const isOut = prod.totalStock === 0;

                    return (
                      <tr
                        key={prod.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 code-badge font-mono text-xs">
                          {prod.code}
                        </td>
                        <td className="p-3 font-medium text-slate-900">
                          {prod.name}
                        </td>
                        <td className="p-3 font-semibold">
                          {prod.totalStock} units
                        </td>
                        <td className="p-3">
                          {isOut ? (
                            <span
                              className="badge px-2 py-1 text-xs rounded font-medium"
                              style={{
                                backgroundColor: "#fee2e2",
                                color: "#991b1b",
                              }}
                            >
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span
                              className="badge px-2 py-1 text-xs rounded font-medium"
                              style={{
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                              }}
                            >
                              Low Stock
                            </span>
                          ) : (
                            <span className="badge px-2 py-1 text-xs rounded font-medium bg-green-50 text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-500 py-6">
                      No inventory items found in the catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Status Horizontal Bar Chart Section with Unique Colors */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
          className="space-y-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Stock Level Distribution Bar Chart
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Visual units per product
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {loading ? (
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                Loading chart data...
              </p>
            ) : stockSummary.length > 0 ? (
              stockSummary.map((prod, index) => {
                const percentage = Math.min(
                  Math.round((prod.totalStock / maxStock) * 100),
                  100,
                );
                const isOut = prod.totalStock === 0;

                const barColor = isOut
                  ? "#ef4444"
                  : chartColors[index % chartColors.length];

                return (
                  <div key={prod.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>
                        {prod.name} ({prod.code})
                      </span>
                      <span className="font-bold">{prod.totalStock} units</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "9999px",
                        height: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(percentage, isOut ? 0 : 3)}%`,
                          backgroundColor: barColor,
                          height: "100%",
                          borderRadius: "9999px",
                          transition: "width 0.4s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "12px 0",
                }}
              >
                No stock data available to display in the chart.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
