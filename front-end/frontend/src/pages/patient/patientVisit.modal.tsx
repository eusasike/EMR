import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import {
  createVisitApi,
  getVisitsByPatientIdApi,
  updateVisitApi,
  type CheckInVisitDTO,
  type VisitType,
  type VisitPriority,
  type VisitStatus,
  type Visit,
} from "../../api/patient/visit";
import { type Patient } from "../../api/patient/patient";

interface PatientVisitModalProps {
  patient: (Patient & { visits?: Visit[] }) | null;
  activeVisit?: Visit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface JwtPayload {
  id?: string;
  sub?: string;
  facilityId?: string;
  facilityIds?: string[];
  [key: string]: unknown;
}

interface StoredUser {
  id?: string;
  facilityId?: string;
  facilityIds?: string[];
}

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decodedJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
    );
    return JSON.parse(decodedJson) as JwtPayload;
  } catch {
    return null;
  }
};

const getUserIdFromAuthToken = (): string => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const decoded = parseJwt(token);
    if (decoded?.id || decoded?.sub) {
      return decoded.id || decoded.sub || "";
    }
  }

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as StoredUser;
      return parsed.id || "";
    } catch {
      /* ignore JSON parse error */
    }
  }

  return "";
};

const getFacilityIdFromStorage = (): string => {
  const directFacilityId = localStorage.getItem("facilityId");
  if (directFacilityId) return directFacilityId;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as StoredUser;
      if (parsed?.facilityId) return parsed.facilityId;
      if (Array.isArray(parsed?.facilityIds) && parsed.facilityIds.length > 0) {
        return parsed.facilityIds[0];
      }
    } catch {
      /* ignore JSON parse error */
    }
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    const decoded = parseJwt(token);
    if (decoded?.facilityId) return decoded.facilityId;
    if (Array.isArray(decoded?.facilityIds) && decoded.facilityIds.length > 0) {
      return decoded.facilityIds[0];
    }
  }

  return "";
};

const getStatusBadgeConfig = (status: VisitStatus = "NOT_STARTED") => {
  switch (status) {
    case "NOT_STARTED":
      return {
        label: "⏱ NOT STARTED",
        bg: "#fffbe6",
        color: "#d97706",
        border: "#fef3c7",
      };
    case "IN_PROGRESS":
      return {
        label: "● IN PROGRESS",
        bg: "#eff6ff",
        color: "#1d4ed8",
        border: "#bfdbfe",
      };
    case "COMPLETED":
      return {
        label: "✓ COMPLETED",
        bg: "#ecfdf5",
        color: "#047857",
        border: "#a7f3d0",
      };
    case "CANCELLED":
      return {
        label: "✕ CANCELLED",
        bg: "#fef2f2",
        color: "#b91c1c",
        border: "#fecaca",
      };
    default:
      return {
        label: "⏱ NOT STARTED",
        bg: "#fffbe6",
        color: "#d97706",
        border: "#fef3c7",
      };
  }
};

export const PatientVisitModal: React.FC<PatientVisitModalProps> = ({
  patient,
  activeVisit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [visitError, setVisitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [fetchedVisits, setFetchedVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  const [visitFormData, setVisitFormData] = useState<
    Omit<CheckInVisitDTO, "patientId" | "attendingId" | "facilityId">
  >({
    visitType: "OPD",
    priority: "NORMAL",
    status: "NOT_STARTED",
    symptoms: "",
    diagnosis: "",
    icdCode: "",
  });

  // Fetch patient visits whenever modal opens
  // Track active record in state so it updates when fetchedVisits changes
  const [activeRecord, setActiveRecord] = useState<Visit | null>(
    activeVisit || null,
  );

  // Fetch patient visits whenever modal opens
  useEffect(() => {
    if (isOpen && patient?.id) {
      const fetchPatientVisits = async () => {
        setIsLoadingVisits(true);
        try {
          const visits = await getVisitsByPatientIdApi(patient.mrn);
          console.log("📥 Fetched Visits API Response:", visits);
          setFetchedVisits(visits);

          // Determine active/latest visit from fetched data
          const combined = [...(patient.visits || []), ...visits].sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );

          const foundActive =
            activeVisit ||
            combined.find(
              (v) => v.status === "IN_PROGRESS" || v.status === "NOT_STARTED",
            ) ||
            combined[0] ||
            null;

          setActiveRecord(foundActive);
        } catch (err) {
          console.error("Failed to fetch patient visits:", err);
        } finally {
          setIsLoadingVisits(false);
        }
      };

      fetchPatientVisits();
    }
  }, [isOpen, patient, activeVisit]);

  if (!isOpen || !patient) return null;

  // Combine and sort all visits
  const allVisits = [...(patient.visits || []), ...fetchedVisits].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  const hasActiveInProgressVisit = activeRecord?.status === "IN_PROGRESS";

  // Effective status calculation
  const effectiveStatus: VisitStatus = isLoadingVisits
    ? "NOT_STARTED"
    : activeRecord?.status
      ? activeRecord.status
      : (visitFormData.status as VisitStatus);

  console.group("🔍 PatientVisitModal Status Debug Logger");
  console.log("Patient Object:", patient);
  console.log("Fetched Visits State:", fetchedVisits);
  console.log("Combined & Sorted allVisits:", allVisits);
  console.log("Selected activeRecord:", activeRecord);
  console.log("Effective Status Calculated:", effectiveStatus);
  console.groupEnd();

  const currentStatusConfig = isLoadingVisits
    ? {
        label: "⌛ LOADING...",
        bg: "#f3f4f6",
        color: "#4b5563",
        border: "#e5e7eb",
      }
    : getStatusBadgeConfig(effectiveStatus);

  // Handle marking the current active visit as COMPLETED so a new one can start
  const handleCompleteActiveVisit = async () => {
    if (!activeRecord?.id) return;

    setVisitError("");
    setSubmittingVisit(true);
    try {
      await updateVisitApi(activeRecord.id, {
        status: "COMPLETED",
      });
      setSuccessMessage("Previous visit marked as completed!");

      // Refresh list
      const visits = await getVisitsByPatientIdApi(patient.id);
      setFetchedVisits(visits);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccessMessage("");
      }, 1500);
    } catch (err: unknown) {
      let msg = "Failed to update visit status.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        msg = err.response.data.message as string;
      }
      setVisitError(msg);
    } finally {
      setSubmittingVisit(false);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setVisitError("");
    setSuccessMessage("");
    setSubmittingVisit(true);

    const attendingId = getUserIdFromAuthToken();
    const facilityId = getFacilityIdFromStorage();

    if (!attendingId) {
      setVisitError("User authentication session invalid. Please re-login.");
      setSubmittingVisit(false);
      return;
    }

    if (!facilityId) {
      setVisitError("No active facility selected. Please select a facility.");
      setSubmittingVisit(false);
      return;
    }

    try {
      const payload: CheckInVisitDTO = {
        ...visitFormData,
        patientId: patient.id,
        attendingId,
        facilityId,
      };

      await createVisitApi(payload);

      setSuccessMessage("New visit session opened successfully!");

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Failed to open visit session:", err);
      let msg = "Failed to open visit session.";

      if (err instanceof AxiosError && err.response?.data?.message) {
        msg = err.response.data.message as string;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setVisitError(msg);
    } finally {
      setSubmittingVisit(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0 }}>
              Visit Management: {patient.firstName} {patient.lastName}
            </h3>
            <span
              style={{
                backgroundColor: currentStatusConfig.bg,
                color: currentStatusConfig.color,
                border: `1px solid ${currentStatusConfig.border}`,
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {currentStatusConfig.label}
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {isLoadingVisits ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Loading patient visit status...
          </div>
        ) : (
          <>
            {/* Active Visit Banner with Management Options */}
            {hasActiveInProgressVisit && activeRecord && (
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  padding: "14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Active Visit in Progress
                </div>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Symptoms/Complaint:</strong>{" "}
                  {activeRecord.symptoms || "None recorded"} <br />
                  <strong>Type:</strong> {activeRecord.visitType} |{" "}
                  <strong>Priority:</strong> {activeRecord.priority} <br />
                  <strong>Attending:</strong>{" "}
                  {activeRecord.attending
                    ? `${activeRecord.attending.firstName} ${activeRecord.attending.lastName}`
                    : "Assigned Clinician"}
                </p>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    onClick={handleCompleteActiveVisit}
                    disabled={submittingVisit}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#047857",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {submittingVisit
                      ? "Updating..."
                      : "✓ Complete Current Visit"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#e5e7eb",
                      color: "#374151",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Close & Return
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="auth-form">
              {successMessage && (
                <div
                  style={{
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #6ee7b7",
                    color: "#065f46",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "12px",
                    fontWeight: 500,
                  }}
                >
                  ✓ {successMessage}
                </div>
              )}

              {visitError && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                    color: "#991b1b",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {visitError}
                </div>
              )}

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                {hasActiveInProgressVisit
                  ? "Or Open a New Concurrent Visit Session:"
                  : "Check-In Details"}
              </div>

              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Visit Type</label>
                    <select
                      className="form-input"
                      disabled={submittingVisit || !!successMessage}
                      value={visitFormData.visitType || "OPD"}
                      onChange={(e) =>
                        setVisitFormData((prev) => ({
                          ...prev,
                          visitType: e.target.value as VisitType,
                        }))
                      }
                    >
                      <option value="OPD">Outpatient (OPD)</option>
                      <option value="IPD">Inpatient (IPD)</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="REFERRAL">Referral</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Triage Priority</label>
                    <select
                      className="form-input"
                      disabled={submittingVisit || !!successMessage}
                      value={visitFormData.priority || "NORMAL"}
                      onChange={(e) =>
                        setVisitFormData((prev) => ({
                          ...prev,
                          priority: e.target.value as VisitPriority,
                        }))
                      }
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Visit Status</label>
                  <select
                    className="form-input"
                    disabled={submittingVisit || !!successMessage}
                    value={visitFormData.status || "NOT_STARTED"}
                    onChange={(e) =>
                      setVisitFormData((prev) => ({
                        ...prev,
                        status: e.target.value as VisitStatus,
                      }))
                    }
                  >
                    <option value="NOT_STARTED">⏱ Not Started / Pending</option>
                    <option value="IN_PROGRESS">● In Progress</option>
                    <option value="COMPLETED">✓ Completed</option>
                    <option value="CANCELLED">✕ Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Chief Complaint / Symptoms
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    disabled={submittingVisit || !!successMessage}
                    placeholder="e.g., High fever, severe headache, chest tightness"
                    required
                    value={visitFormData.symptoms || ""}
                    onChange={(e) =>
                      setVisitFormData((prev) => ({
                        ...prev,
                        symptoms: e.target.value,
                      }))
                    }
                  />
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submittingVisit || !!successMessage}
                className="btn-primary"
                style={{ marginTop: "12px" }}
              >
                {submittingVisit
                  ? "Opening Visit Session..."
                  : successMessage
                    ? "Visit Created!"
                    : "Confirm & Open New Visit"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
