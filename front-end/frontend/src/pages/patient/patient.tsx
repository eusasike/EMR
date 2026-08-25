import React, { useEffect, useState, type ChangeEvent } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  getPatientsApi,
  searchPatientApi,
  createPatientApi,
  type Patient,
  type CreatePatientDTO,
} from "../../api/patient/patient";
import {
  getRegionByNameApi,
  getDistrictByNameApi,
  type Region,
  type District,
} from "../../api/location/location";
import { Plus, Search } from "lucide-react";
import "../../style/component.css";

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Region and District states
  const [regionInput, setRegionInput] = useState("");
  const [districtInput, setDistrictInput] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );

  // Autocomplete suggestions and visibility states
  const [regionSuggestions, setRegionSuggestions] = useState<Region[]>([]);
  const [districtSuggestions, setDistrictSuggestions] = useState<District[]>(
    [],
  );
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  // Specific Error states
  const [locationError, setLocationError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [formGeneralError, setFormGeneralError] = useState("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string>("");

  const [formData, setFormData] = useState<CreatePatientDTO>({
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
  });

  const isValidPhoneNumber = (phone?: string): boolean => {
    if (!phone || !phone.trim()) return true;
    const phoneRegex = /^(?:\+255|0)[67]\d{8}$/;
    return phoneRegex.test(phone.trim());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, phone: value }));

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
    setFormData((prev) => ({ ...prev, emergencyContactPhone: value }));

    if (value && !isValidPhoneNumber(value)) {
      setEmergencyPhoneError(
        "Enter a valid emergency contact number (e.g., +255712345678 or 0712345678)",
      );
    } else {
      setEmergencyPhoneError("");
    }
  };

  useEffect(() => {
    let isMounted = true;

    getPatientsApi()
      .then((data) => {
        if (isMounted) setPatients(data);
      })
      .catch((err) => {
        console.error("Failed to load patients:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const openRegistrationModal = () => {
    const parts = searchTerm.trim().split(/\s+/);
    setFormData((prev) => ({
      ...prev,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      regionId: "",
      districtId: "",
    }));
    setRegionInput("");
    setDistrictInput("");
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setRegionSuggestions([]);
    setDistrictSuggestions([]);
    setShowRegionDropdown(false);
    setShowDistrictDropdown(false);
    setLocationError("");
    setRegionError("");
    setDistrictError("");
    setFormGeneralError("");
    setPhoneError("");
    setEmergencyPhoneError("");
    setIsModalOpen(true);
  };

  // Region Autocomplete Handlers
  const handleRegionInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = e.target.value;
    setRegionInput(query);
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setDistrictInput("");
    setRegionError("");
    setFormData((prev) => ({ ...prev, regionId: "", districtId: "" }));

    if (query.trim().length > 1) {
      try {
        const result = await getRegionByNameApi(query.trim());
        setRegionSuggestions(result ? [result] : []);
        setShowRegionDropdown(true);
        setLocationError("");
      } catch {
        setRegionSuggestions([]);
        setShowRegionDropdown(false);
      }
    } else {
      setRegionSuggestions([]);
      setShowRegionDropdown(false);
    }
  };

  const selectRegion = (region: Region) => {
    setRegionInput(region.name);
    setSelectedRegion(region);
    setFormData((prev) => ({ ...prev, regionId: region.id }));
    setShowRegionDropdown(false);
    setRegionError("");
    setLocationError("");
  };

  // District Autocomplete Handlers
  const handleDistrictInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = e.target.value;
    setDistrictInput(query);
    setSelectedDistrict(null);
    setDistrictError("");
    setFormData((prev) => ({ ...prev, districtId: "" }));

    if (query.trim().length > 1) {
      try {
        const result = await getDistrictByNameApi(
          query.trim(),
          selectedRegion?.id,
        );
        setDistrictSuggestions(result ? [result] : []);
        setShowDistrictDropdown(true);
        setLocationError("");
      } catch {
        setDistrictSuggestions([]);
        setShowDistrictDropdown(false);
      }
    } else {
      setDistrictSuggestions([]);
      setShowDistrictDropdown(false);
    }
  };

  const selectDistrict = (district: District) => {
    setDistrictInput(district.name);
    setSelectedDistrict(district);
    setFormData((prev) => ({ ...prev, districtId: district.id }));
    setShowDistrictDropdown(false);
    setDistrictError("");
    setLocationError("");
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormGeneralError("");
    setRegionError("");
    setDistrictError("");

    let isValid = true;

    // Validate Region selection
    if (regionInput.trim() && !formData.regionId) {
      setRegionError("Please select a valid region from the dropdown list.");
      isValid = false;
    }

    // Validate District selection
    if (districtInput.trim() && !formData.districtId) {
      setDistrictError(
        "Please select a valid district from the dropdown list.",
      );
      isValid = false;
    }

    // Validate Phone Numbers
    const isPhoneValid = isValidPhoneNumber(formData.phone);
    const isEmergencyValid = isValidPhoneNumber(
      formData.emergencyContactPhone || "",
    );

    if (!isPhoneValid) {
      setPhoneError("Please enter a valid primary phone number.");
      isValid = false;
    }
    if (!isEmergencyValid) {
      setEmergencyPhoneError(
        "Please enter a valid emergency contact phone number.",
      );
      isValid = false;
    }

    if (!isValid) return;

    setSubmitting(true);
    try {
      await createPatientApi(formData);
      setIsModalOpen(false);
      setFormData({
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
      });
      setRegionInput("");
      setDistrictInput("");
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setLocationError("");
      setRegionError("");
      setDistrictError("");
      setFormGeneralError("");
      setPhoneError("");
      setEmergencyPhoneError("");
      setHasSearched(false);
      setSearchTerm("");
      await refreshPatients();
    } catch (err: unknown) {
      console.error("Failed to register patient:", err);
      // Capture precise backend error message if provided
      const apiMessage =
        "Failed to register patient. Please check required fields.";
      setFormGeneralError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CreatePatientDTO["gender"];
    setFormData((prev) => ({ ...prev, gender: value }));
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
      {/* Top Search Action Bar */}
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
                      <button
                        className="btn-logout"
                        style={{ fontSize: 12, padding: "4px 8px" }}
                      >
                        View Chart
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Register Patient</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="auth-form">
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

              {/* Region and District Autocomplete Search Fields */}
              <div className="form-grid">
                <div className="form-group" style={{ position: "relative" }}>
                  <label className="form-label">Region</label>
                  <input
                    type="text"
                    className={`form-input ${regionError ? "input-error" : ""}`}
                    placeholder="Type to search region..."
                    value={regionInput}
                    onChange={handleRegionInputChange}
                    onFocus={() =>
                      regionSuggestions.length > 0 &&
                      setShowRegionDropdown(true)
                    }
                  />
                  {selectedRegion && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#16a34a",
                        marginTop: "2px",
                        display: "block",
                      }}
                    >
                      ✓ Selected: {selectedRegion.name}
                    </span>
                  )}
                  {regionError && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {regionError}
                    </span>
                  )}
                  {showRegionDropdown && regionSuggestions.length > 0 && (
                    <ul className="autocomplete-dropdown">
                      {regionSuggestions.map((region) => (
                        <li
                          key={region.id}
                          onClick={() => selectRegion(region)}
                        >
                          {region.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group" style={{ position: "relative" }}>
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className={`form-input ${districtError ? "input-error" : ""}`}
                    placeholder="Type to search district..."
                    value={districtInput}
                    onChange={handleDistrictInputChange}
                    onFocus={() =>
                      districtSuggestions.length > 0 &&
                      setShowDistrictDropdown(true)
                    }
                  />
                  {selectedDistrict && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#16a34a",
                        marginTop: "2px",
                        display: "block",
                      }}
                    >
                      ✓ Selected: {selectedDistrict.name}
                    </span>
                  )}
                  {districtError && (
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {districtError}
                    </span>
                  )}
                  {showDistrictDropdown && districtSuggestions.length > 0 && (
                    <ul className="autocomplete-dropdown">
                      {districtSuggestions.map((district) => (
                        <li
                          key={district.id}
                          onClick={() => selectDistrict(district)}
                        >
                          {district.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {locationError && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    display: "block",
                  }}
                >
                  {locationError}
                </span>
              )}

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-input ${phoneError ? "input-error" : ""}`}
                  placeholder="+255712345678"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
                {phoneError && (
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {phoneError}
                  </span>
                )}
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
                    <span
                      style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      {emergencyPhoneError}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
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
                  : "Confirm Patient Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
