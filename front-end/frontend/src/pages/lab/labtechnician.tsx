// pages/lab/LabTechnicianPage.tsx
import React, { useState } from "react";
import { searchPatientApi, type Patient } from "../../api/patient/patient";
import {
  getLabResultsByMrnApi,
  recordLabResultApi,
  type LabResultItem,
} from "../../api/lab/lab";
import axios from "axios";
import { AppLayout } from "../../components/layout/AppLayout";

export const LabTechnicianPage: React.FC = () => {
  const [mrnQuery, setMrnQuery] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labResultsList, setLabResultsList] = useState<LabResultItem[]>([]);

  // Modal State for Recording Results
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLabItem, setActiveLabItem] = useState<LabResultItem | null>(
    null,
  );

  // Form Field States
  const [specimenType, setSpecimenType] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [unit, setUnit] = useState("");
  const [referenceRange, setReferenceRange] = useState("");
  const [findings, setFindings] = useState("");
  const [status, setStatus] = useState<"COMPLETED" | "VERIFIED">("COMPLETED");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLabResultsList([]);
    setPatient(null);

    if (!mrnQuery.trim()) return;

    try {
      setLoading(true);
      const patients = await searchPatientApi(mrnQuery);
      const foundPatient =
        patients.find(
          (p) => p.mrn.toLowerCase() === mrnQuery.trim().toLowerCase(),
        ) || patients[0];

      if (!foundPatient) {
        setError("Patient not found.");
        return;
      }
      setPatient(foundPatient);

      const results = await getLabResultsByMrnApi(foundPatient.mrn);
      setLabResultsList(results);

      if (results.length === 0) {
        setError("No laboratory orders found for this patient.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to retrieve laboratory records for this MRN.",
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

  const handleOpenRecordModal = (item: LabResultItem) => {
    setActiveLabItem(item);
    setSpecimenType(item.specimenType || "");
    setResultValue(item.resultValue || "");
    setUnit(item.unit || "");
    setReferenceRange(item.referenceRange || "");
    setFindings(item.findings || "");
    setStatus("COMPLETED");
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeLabItem || !patient) return;

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      await recordLabResultApi(activeLabItem.id, {
        specimenType: specimenType.trim() || undefined,
        resultValue: resultValue.trim() || undefined,
        unit: unit.trim() || undefined,
        referenceRange: referenceRange.trim() || undefined,
        findings: findings.trim() || undefined,
        status: status,
      });
      setSuccessMsg("Lab results recorded successfully!");

      setIsModalOpen(false);

      // Refresh lab orders list
      const updatedResults = await getLabResultsByMrnApi(patient.mrn);
      setLabResultsList(updatedResults);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to submit laboratory action.",
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

  const getPerformerName = (item: LabResultItem) => {
    const p = item.performedBy;
    if (!p) return "—";
    if (p.name) return `${p.name}}`;
    return p.email || "—";
  };

  return (
    <AppLayout pageTitle="Laboratory Management & Results">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="page-actions">
          <h1 className="text-xl font-bold text-slate-900">
            Laboratory Dashboard & Orders
          </h1>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchPatient} className="flex gap-3 mb-6">
          <input
            type="text"
            value={mrnQuery}
            onChange={(e) => setMrnQuery(e.target.value)}
            placeholder="Enter Patient MRN (e.g., MRN-12345)"
            className="search-input"
            style={{ width: "100%", maxWidth: "400px" }}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search Patient"}
          </button>
        </form>

        {error && !isModalOpen && <div className="alert-danger">{error}</div>}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {/* Patient Profile Card */}
        {patient && (
          <div className="table-card p-5 bg-white border-l-4 border-l-sky-600 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Patient Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted">MRN:</span>{" "}
                <span className="code-badge">{patient.mrn}</span>
              </div>
              <div>
                <span className="text-muted">Name:</span>{" "}
                <span className="font-medium text-slate-800">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div>
                <span className="text-muted">Gender:</span>{" "}
                <span className="font-medium text-slate-800">
                  {patient.gender}
                </span>
              </div>
              <div>
                <span className="text-muted">Total Lab Orders:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {labResultsList.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lab Orders & Results Table */}
        {patient && labResultsList.length > 0 && (
          <div className="table-card">
            <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
              Ordered Lab Tests & Findings
            </h3>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Specimen</th>
                  <th>Result Value</th>
                  <th>Status</th>
                  <th>Performed By</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labResultsList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-slate-900">
                      {item.providedService?.service?.name || "Laboratory Test"}
                    </td>
                    <td>
                      <span className="code-badge">
                        {item.specimenType || "Not Set"}
                      </span>
                    </td>
                    <td>
                      {item.resultValue ? (
                        <span className="font-semibold text-slate-800">
                          {item.resultValue} {item.unit || ""}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">Pending...</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "VERIFIED"
                            ? "badge-success"
                            : item.status === "COMPLETED"
                              ? "badge-warning"
                              : "badge-in-progress"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-muted text-xs">
                      {getPerformerName(item)}
                    </td>
                    <td className="text-right space-x-2">
                      {item.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleOpenRecordModal(item)}
                          className="btn-primary"
                          style={{ fontSize: 12, padding: "4px 10px" }}
                        >
                          {item.status === "ORDERED"
                            ? "Enter Results"
                            : "Edit Results"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Recording Results */}
        {isModalOpen && activeLabItem && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "600px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Record Laboratory Test Results</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="auth-form space-y-4">
                <div className="form-group">
                  <label className="form-label">Specimen Type</label>
                  <input
                    type="text"
                    value={specimenType}
                    onChange={(e) => setSpecimenType(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Blood, Urine, Swab"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="form-group col-span-1">
                    <label className="form-label">Result Value</label>
                    <input
                      type="text"
                      value={resultValue}
                      onChange={(e) => setResultValue(e.target.value)}
                      className="form-input"
                      placeholder="e.g., 5.4"
                    />
                  </div>
                  <div className="form-group col-span-1">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="form-input"
                      placeholder="e.g., mg/dL"
                    />
                  </div>
                  <div className="form-group col-span-1">
                    <label className="form-label">Reference Range</label>
                    <input
                      type="text"
                      value={referenceRange}
                      onChange={(e) => setReferenceRange(e.target.value)}
                      className="form-input"
                      placeholder="e.g., 4.0 - 6.0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Clinical Findings / Remarks
                  </label>
                  <textarea
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="form-input"
                    placeholder="Enter detailed test observations or pathologist notes..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Set Result Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "COMPLETED" | "VERIFIED")
                    }
                    className="form-input"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-logout"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {loading ? "Saving..." : "Save Results"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
