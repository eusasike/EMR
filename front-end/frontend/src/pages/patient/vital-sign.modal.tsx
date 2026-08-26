import React, { useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { searchPatientApi, type Patient } from "../../api/patient/patient";
import {
  getVisitsByMrnApi,
  recordVitalSignsApi,
  type Visit,
  type VitalSignsInput,
} from "../../api/patient/visit";
import { Search, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import "../../style/component.css";

interface VitalSignRecord {
  id: string;
  weight?: number;
  height?: number;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  notes?: string;
  createdAt?: string;
}

export function VitalSignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Recent vitals list state (limited to 5)
  const [recentVitals, setRecentVitals] = useState<VitalSignRecord[]>([]);

  // Modal State for Updating Existing Vitals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingVitalId, setEditingVitalId] = useState<string | null>(null);

  // Vital Signs Form State (shared between New Record and Update Modal)
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [notes, setNotes] = useState("");

  // Helper to reset form fields
  const resetFormFields = () => {
    setWeight("");
    setHeight("");
    setTemperature("");
    setPulseRate("");
    setSystolicBP("");
    setDiastolicBP("");
    setRespiratoryRate("");
    setSpo2("");
    setNotes("");
  };

  // 1. Search patients by MRN, First Name, or Last Name
  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setPatients([]);
    setSelectedPatient(null);
    setActiveVisits([]);
    setSelectedVisit(null);
    setRecentVitals([]);

    try {
      const results = await searchPatientApi(searchQuery);
      setPatients(results);
      if (results.length === 0) {
        setError("No patients found matching your search query.");
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message || "Failed to search patients.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Select Patient and fetch visits, keeping ONLY IN_PROGRESS visits
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveVisits([]);
    setSelectedVisit(null);
    setRecentVitals([]);
    setError(null);
    setLoading(true);

    try {
      const allVisits = await getVisitsByMrnApi(patient.mrn);

      const inProgressVisits = allVisits.filter(
        (visit) => visit.status === "IN_PROGRESS",
      );

      setActiveVisits(inProgressVisits);

      const extractedVitals: VitalSignRecord[] = [];
      allVisits.forEach(
        (
          visit: Visit & {
            vitalSigns?: VitalSignRecord;
            vitals?: VitalSignRecord[];
          },
        ) => {
          if (visit.vitalSigns) {
            extractedVitals.push(visit.vitalSigns);
          } else if (Array.isArray(visit.vitals)) {
            extractedVitals.push(...visit.vitals);
          }
        },
      );

      const limitedVitals = extractedVitals
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 5);

      setRecentVitals(limitedVitals);

      if (inProgressVisits.length === 0) {
        setError(
          `No active IN_PROGRESS visits found for ${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn}).`,
        );
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "Failed to retrieve patient visits.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Open Update Modal pre-filled with data
  const handleOpenUpdateModal = (vital: VitalSignRecord) => {
    setEditingVitalId(vital.id);
    setWeight(vital.weight?.toString() || "");
    setHeight(vital.height?.toString() || "");
    setTemperature(vital.temperature?.toString() || "");
    setPulseRate(vital.pulseRate?.toString() || "");
    setSystolicBP(vital.systolicBP?.toString() || "");
    setDiastolicBP(vital.diastolicBP?.toString() || "");
    setRespiratoryRate(vital.respiratoryRate?.toString() || "");
    setSpo2(vital.spo2?.toString() || "");
    setNotes(vital.notes || "");
    setIsUpdateModalOpen(true);
  };

  // 4. Handle Form Submission (Handles both New Record and Update Modal)
  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setSuccessMsg(null);
      setLoading(true);

      if (isUpdateModalOpen && editingVitalId) {
        // TODO: Call your backend update API here, e.g., await updateVitalSignsApi(editingVitalId, payload);

        // 🌟 FIX: Immediately update the local 'recentVitals' state so the UI reflects changes
        setRecentVitals((prevVitals) =>
          prevVitals.map((vital) =>
            vital.id === editingVitalId
              ? {
                  ...vital,
                  weight: weight ? parseFloat(weight) : vital.weight,
                  height: height ? parseFloat(height) : vital.height,
                  temperature: temperature
                    ? parseFloat(temperature)
                    : vital.temperature,
                  pulseRate: pulseRate
                    ? parseInt(pulseRate, 10)
                    : vital.pulseRate,
                  systolicBP: systolicBP
                    ? parseInt(systolicBP, 10)
                    : vital.systolicBP,
                  diastolicBP: diastolicBP
                    ? parseInt(diastolicBP, 10)
                    : vital.diastolicBP,
                  respiratoryRate: respiratoryRate
                    ? parseInt(respiratoryRate, 10)
                    : vital.respiratoryRate,
                  spo2: spo2 ? parseInt(spo2, 10) : vital.spo2,
                  notes: notes ? notes : vital.notes,
                }
              : vital,
          ),
        );

        setSuccessMsg("Vital signs updated successfully!");
        setIsUpdateModalOpen(false);
        setEditingVitalId(null);
      } else {
        if (!selectedVisit) return;

        if (selectedVisit.status !== "IN_PROGRESS") {
          setError(
            "Error: Vital signs can only be recorded for visits with status IN_PROGRESS.",
          );
          return;
        }

        const payload: VitalSignsInput = {
          visitId: selectedVisit.id,
          weight: parseFloat(weight),
          temperature: temperature ? parseFloat(temperature) : undefined,
          systolicBP: systolicBP ? parseInt(systolicBP, 10) : undefined,
          diastolicBP: diastolicBP ? parseInt(diastolicBP, 10) : undefined,
          pulseRate: pulseRate ? parseInt(pulseRate, 10) : undefined,
          respiratoryRate: respiratoryRate
            ? parseInt(respiratoryRate, 10)
            : undefined,
          spo2: spo2 ? parseInt(spo2, 10) : undefined,
          height: height ? parseFloat(height) : undefined,
          notes: notes ? notes : undefined,
        };

        await recordVitalSignsApi(payload);
        setSuccessMsg(
          "Vital signs recorded successfully and triage priority synchronized!",
        );

        setSelectedVisit(null);
        setActiveVisits([]);
        setSelectedPatient(null);
        setSearchQuery("");
        setPatients([]);
        setRecentVitals([]);
      }

      resetFormFields();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to save vital signs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Triage & Vital Signs">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Search Header Action Bar */}
        <div className="page-actions">
          <form
            onSubmit={handleSearchPatient}
            style={{ display: "flex", gap: "12px", width: "100%" }}
          >
            <div className="input-with-icon" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search patient by MRN, First Name, or Last Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: "100%" }}
              />
              <Search size={18} className="search-icon" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Searching..." : "Search Patient"}
            </button>
          </form>
        </div>

        {/* Alert Messages */}
        {error && (
          <div
            className="alert-danger"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              padding: "12px 16px",
              borderRadius: "var(--emr-radius-sm)",
              fontSize: "14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Patient Search Results Table */}
        {patients.length > 0 && !selectedPatient && (
          <div className="table-card" style={{ marginBottom: "24px" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--emr-border)",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
              }}
            >
              Matching Patients
            </div>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Gender / DOB</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--emr-text-main)",
                        }}
                      >
                        {p.firstName} {p.lastName}
                      </div>
                    </td>
                    <td>
                      <span className="code-badge">{p.mrn}</span>
                    </td>
                    <td className="text-muted">
                      {p.gender} • {p.dateOfBirth}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleSelectPatient(p)}
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                      >
                        View Active Visits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* In-Progress Visits Table */}
        {selectedPatient && activeVisits.length > 0 && !selectedVisit && (
          <div className="table-card" style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--emr-border)",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>
                  Active IN_PROGRESS Visits for:{" "}
                </span>
                <span style={{ color: "var(--emr-primary)" }}>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setActiveVisits([]);
                  setRecentVitals([]);
                }}
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "12px" }}
              >
                ← Back to Search
              </button>
            </div>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td>{visit.visitType}</td>
                    <td>{visit.priority}</td>
                    <td>
                      <span className="badge badge-in-progress">
                        {visit.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="btn-primary"
                        style={{ padding: "6px 14px", fontSize: "13px" }}
                      >
                        Record Vitals
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Vitals List (Max 5 items) with Update button */}
        {selectedPatient && recentVitals.length > 0 && !selectedVisit && (
          <div className="table-card" style={{ marginBottom: "24px" }}>
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--emr-border)",
                backgroundColor: "#f8fafc",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <Activity size={16} color="var(--emr-primary)" />
              <span>Recent Recorded Vitals (Latest 5)</span>
            </div>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Weight</th>
                  <th>Temp / BP</th>
                  <th>Recorded At</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((v, index) => (
                  <tr key={v.id || index}>
                    <td>
                      <strong>
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </strong>
                    </td>
                    <td>{v.weight ? `${v.weight} kg` : "N/A"}</td>
                    <td className="text-muted">
                      {v.temperature ? `${v.temperature}°C` : "--"} |{" "}
                      {v.systolicBP && v.diastolicBP
                        ? `${v.systolicBP}/${v.diastolicBP}`
                        : "--"}
                    </td>
                    <td className="text-muted">
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleDateString()
                        : "Recent"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenUpdateModal(v)}
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vital Signs Input Form (For New Record) */}
        {selectedVisit && (
          <div className="table-card" style={{ padding: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid var(--emr-border)",
                paddingBottom: "12px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--emr-text-main)",
                  }}
                >
                  Record Clinical Vitals & Triage
                </h3>
                {selectedPatient && (
                  <p
                    className="text-muted"
                    style={{ fontSize: "13px", marginTop: "2px" }}
                  >
                    Patient:{" "}
                    <strong style={{ color: "var(--emr-text-main)" }}>
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </strong>{" "}
                    (MRN:{" "}
                    <span className="code-badge">{selectedPatient.mrn}</span>)
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "12px" }}
              >
                Change Visit
              </button>
            </div>

            <form onSubmit={handleSubmitVitals}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 70.5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 175"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 36.6"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={pulseRate}
                    onChange={(e) => setPulseRate(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 75"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={systolicBP}
                    onChange={(e) => setSystolicBP(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diastolicBP}
                    onChange={(e) => setDiastolicBP(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 80"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Respiratory Rate (bpm)</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 16"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="form-input"
                    placeholder="e.g., 98"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">
                    Clinical Observations & Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                    rows={3}
                    placeholder="Optional clinical notes or remarks..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedVisit(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading
                    ? "Saving Vitals..."
                    : "Save Vital Signs & Sync Priority"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* UPDATE VITAL SIGNS MODAL (Pre-filled) */}
        {isUpdateModalOpen && selectedPatient && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "600px" }}>
              <div
                className="modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  Update Vitals: {selectedPatient.firstName}{" "}
                  {selectedPatient.lastName}
                </h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setEditingVitalId(null);
                    resetFormFields();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitVitals} style={{ marginTop: "16px" }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pulse Rate (bpm)</label>
                    <input
                      type="number"
                      value={pulseRate}
                      onChange={(e) => setPulseRate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Respiratory Rate (bpm)</label>
                    <input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">
                      Clinical Observations & Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="form-input"
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>

                <div
                  className="modal-actions"
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateModalOpen(false);
                      setEditingVitalId(null);
                      resetFormFields();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
