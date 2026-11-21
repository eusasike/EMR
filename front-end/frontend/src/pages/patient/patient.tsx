import React, { useEffect, useState, type ChangeEvent } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  createPatientApi,
  type CreatePatientDTO,
  updatePatientApi,
  getPatientsApi,
  type Patient,
  searchPatientApi,
} from "../../api/patient/patient";
import {
  getRegionsApi,
  getDistrictsByRegionApi,
  type Region,
  type District,
} from "../../api/location/location";
import { PatientVisitModal } from "./patientVisit.modal";
import { Plus, Search, Stethoscope } from "lucide-react";
import "../../style/component.css";

const emptyForm: CreatePatientDTO = {
  firstName: "",
  lastName: "",
  gender: "MALE",
  dateOfBirth: "",
  phone: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  address: "",
  regionId: "",
  districtId: "",
};

const errorTextStyle: React.CSSProperties = {
  color: "#ef4444",
  fontSize: "12px",
  marginTop: "4px",
  display: "block",
};

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // Registration / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  // Visit Check-In Modal state
  const [selectedPatientForVisit, setSelectedPatientForVisit] =
    useState<Patient | null>(null);

  // Region and District dropdown data
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Error states
  const [regionError, setRegionError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [formGeneralError, setFormGeneralError] = useState("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string>("");

  const [formData, setFormData] = useState<CreatePatientDTO>(emptyForm);

  const isValidPhoneNumber = (phone?: string): boolean => {
    if (!phone || !phone.trim()) return true;
    const phoneRegex = /^(?:\+255|0)[67]\d{8}$/;
    return phoneRegex.test(phone.trim());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: CreatePatientDTO) => ({ ...prev, phone: value }));

    if (value && !isValidPhoneNumber(value)) {
      setPhoneError(
        "Enter a valid phone number (e.g., +255712345678 or 0712345678)",
      );
    } else {
      setPhoneError("");
    }
  };

  const handleEmergencyPhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setFormData((prev: CreatePatientDTO) => ({
      ...prev,
      emergencyContactPhone: value,
    }));

    if (value && !isValidPhoneNumber(value)) {
      setEmergencyPhoneError(
        "Enter a valid emergency contact number (e.g., +255712345678 or 0712345678)",
      );
    } else {
      setEmergencyPhoneError("");
    }
  };

  // Load patients on mount
  useEffect(() => {
    let isMounted = true;

    getPatientsApi()
      .then((data: Patient[]) => {
        if (isMounted) setPatients(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to load patients:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load all regions on mount
  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingRegions(true);

    getRegionsApi()
      .then((data: Region[]) => {
        if (isMounted) setRegions(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to load regions:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingRegions(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadDistricts = async (regionId: string) => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    try {
      const data = await getDistrictsByRegionApi(regionId);
      setDistricts(data);
    } catch (err: unknown) {
      console.error("Failed to load districts:", err);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const refreshPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatientsApi();
      setPatients(data);
    } catch (err: unknown) {
      console.error("Failed to reload patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setHasSearched(false);
      await refreshPatients();
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchPatientApi(searchTerm);
      setPatients(results);
    } catch (err: unknown) {
      console.error("Search failed:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim() && hasSearched) {
      setHasSearched(false);
      refreshPatients();
    }
  };

  const resetFormErrors = () => {
    setRegionError("");
    setDistrictError("");
    setFormGeneralError("");
    setPhoneError("");
    setEmergencyPhoneError("");
  };

  const openRegistrationModal = () => {
    setEditingPatientId(null);
    const parts = searchTerm.trim().split(/\s+/);
    setFormData({
      ...emptyForm,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    });
    setDistricts([]);
    resetFormErrors();
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      gender: patient.gender || "MALE",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
      phone: patient.phone || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      address: patient.address || "",
      regionId: patient.regionId || "",
      districtId: patient.districtId || "",
    });

    setDistricts([]);
    if (patient.regionId) {
      loadDistricts(patient.regionId);
    }

    resetFormErrors();
    setIsModalOpen(true);
  };

  // Region dropdown change: reset district and load districts of that region
  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setFormData((prev: CreatePatientDTO) => ({
      ...prev,
      regionId,
      districtId: "",
    }));
    setRegionError("");
    setDistrictError("");
    loadDistricts(regionId);
  };

  const handleDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setFormData((prev: CreatePatientDTO) => ({ ...prev, districtId }));
    setDistrictError("");
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormGeneralError("");
    setRegionError("");
    setDistrictError("");

    let isValid = true;

    if (formData.districtId && !formData.regionId) {
      setRegionError("Please select a region first.");
      isValid = false;
    }

    if (formData.regionId && !formData.districtId) {
      setDistrictError("Please select a district.");
      isValid = false;
    }

    if (!isValidPhoneNumber(formData.phone)) {
      setPhoneError("Please enter a valid primary phone number.");
      isValid = false;
    }
    if (!isValidPhoneNumber(formData.emergencyContactPhone || "")) {
      setEmergencyPhoneError(
        "Please enter a valid emergency contact phone number.",
      );
      isValid = false;
    }

    if (!isValid) return;

    setSubmitting(true);
    try {
      if (editingPatientId) {
        await updatePatientApi(editingPatientId, formData);
        setIsModalOpen(false);
        setEditingPatientId(null);
        await refreshPatients();
      } else {
        const newPatient = await createPatientApi(formData);
        setIsModalOpen(false);
        await refreshPatients();

        // Auto-open visit check-in for newly registered patient
        setSelectedPatientForVisit(newPatient);
      }
    } catch (err: unknown) {
      console.error("Failed to save patient record:", err);
      let apiMessage = "Failed to save record. Please verify input fields.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        if (response?.data?.message) {
          apiMessage = response.data.message;
        }
      } else if (err instanceof Error) {
        apiMessage = err.message;
      }
      setFormGeneralError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CreatePatientDTO["gender"];
    setFormData((prev: CreatePatientDTO) => ({ ...prev, gender: value }));
  };

  const displayedPatients = hasSearched
    ? patients
    : patients.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.mrn?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

  return (
    <AppLayout pageTitle="Patient Registry & Admissions">
      <form onSubmit={handleSearchSubmit} className="page-actions">
        <div style={{ display: "flex", gap: "8px", flex: 1 }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by MRN, First Name, or Last Name..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "auto" }}
          >
            <Search size={16} style={{ marginRight: 6 }} /> Search
          </button>
        </div>
      </form>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            Loading clinical records...
          </div>
        ) : (
          <table className="emr-table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                    }}
                  >
                    {hasSearched ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "15px" }}>
                          No patient records found matching "
                          <strong>{searchTerm}</strong>".
                        </p>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            width: "auto",
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 16px",
                          }}
                          onClick={openRegistrationModal}
                        >
                          <Plus size={16} style={{ marginRight: 6 }} /> Register
                          New Patient
                        </button>
                      </div>
                    ) : (
                      "No patient records found."
                    )}
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="code-badge">
                        {patient.mrn ||
                          patient.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {patient.firstName} {patient.lastName}
                      </strong>
                    </td>
                    <td>{patient.gender}</td>
                    <td>
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td>{patient.phone || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn-primary"
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            width: "auto",
                          }}
                          onClick={() => setSelectedPatientForVisit(patient)}
                        >
                          <Stethoscope size={13} style={{ marginRight: 4 }} />{" "}
                          Open Visit
                        </button>
                        <button
                          className="btn-logout"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => openEditModal(patient)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Patient Registration / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                {editingPatientId ? "Edit Patient Record" : "Register Patient"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitPatient} className="auth-form">
              {formGeneralError && (
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
                  {formGeneralError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={formData.gender}
                    onChange={handleGenderChange}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select
                    className={`form-input ${regionError ? "input-error" : ""}`}
                    value={formData.regionId || ""}
                    onChange={handleRegionChange}
                    disabled={loadingRegions}
                  >
                    <option value="">
                      {loadingRegions ? "Loading regions..." : "Select region"}
                    </option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {regionError && (
                    <span style={errorTextStyle}>{regionError}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <select
                    className={`form-input ${districtError ? "input-error" : ""}`}
                    value={formData.districtId || ""}
                    onChange={handleDistrictChange}
                    disabled={!formData.regionId || loadingDistricts}
                  >
                    <option value="">
                      {!formData.regionId
                        ? "Select region first"
                        : loadingDistricts
                          ? "Loading districts..."
                          : "Select district"}
                    </option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {districtError && (
                    <span style={errorTextStyle}>{districtError}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-input ${phoneError ? "input-error" : ""}`}
                  placeholder="+255712345678"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
                {phoneError && <span style={errorTextStyle}>{phoneError}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContactName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className={`form-input ${emergencyPhoneError ? "input-error" : ""}`}
                    placeholder="+255712345678"
                    value={formData.emergencyContactPhone || ""}
                    onChange={handleEmergencyPhoneChange}
                  />
                  {emergencyPhoneError && (
                    <span style={errorTextStyle}>{emergencyPhoneError}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Village/Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting
                  ? "Saving Record..."
                  : editingPatientId
                    ? "Update Patient Record"
                    : "Confirm Patient Registration"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Render Visit Check-In Modal when a patient is selected */}
      {selectedPatientForVisit && (
        <PatientVisitModal
          patient={selectedPatientForVisit}
          isOpen={Boolean(selectedPatientForVisit)}
          onClose={() => setSelectedPatientForVisit(null)}
        />
      )}
    </AppLayout>
  );
};
