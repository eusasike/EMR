import React, { useState, useEffect } from "react";
import {
  type RegisterUserPayload,
  type UserRole,
  registerStaffUserApi,
} from "../../api/user/user";
import { api } from "../../api/axiosClient";
import axios from "axios";
import { X, UserPlus, Search, Loader2 } from "lucide-react";
import "../../style/component.css";

interface RegisterStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FacilityOption {
  id: string;
  name: string;
  code: string;
}

const ROLES: { label: string; value: UserRole }[] = [
  { label: "Doctor", value: "DOCTOR" },
  { label: "Nurse", value: "NURSE" },
  { label: "Clinical Officer", value: "CLINICAL_OFFICER" },
  { label: "Lab Technician", value: "LAB_TECH" },
  { label: "Pharmacist", value: "PHARMACIST" },
  { label: "Receptionist", value: "RECEPTIONIST" },
  { label: "System Administrator", value: "ADMIN" },
];

export const RegisterStaffModal: React.FC<RegisterStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<RegisterUserPayload>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    role: "NURSE",
    facilityId: "",
  });

  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [searchingFacility, setSearchingFacility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Facility autocomplete search effect (purely async)
  useEffect(() => {
    if (!facilitySearch.trim()) return;

    const timer = setTimeout(async () => {
      setSearchingFacility(true);
      try {
        const res = await api.get(
          `/facilities/search?name=${encodeURIComponent(facilitySearch)}`,
        );
        setFacilities(res.data.data || res.data);
      } catch (err) {
        console.warn("Facility search error:", err);
      } finally {
        setSearchingFacility(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [facilitySearch]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilitySearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = e.target.value;
    setFacilitySearch(query);
    setFormData((prev) => ({ ...prev, facilityId: "" }));

    if (!query.trim()) {
      setFacilities([]);
    }
  };

  const handleSelectFacility = (fac: FacilityOption) => {
    setFormData((prev) => ({ ...prev, facilityId: fac.id }));
    setFacilitySearch(`${fac.name} (${fac.code})`);
    setFacilities([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: RegisterUserPayload = {
        ...formData,
        facilityId: formData.facilityId || undefined,
        phone: formData.phone || undefined,
        middleName: formData.middleName || undefined,
      };

      await registerStaffUserApi(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to register staff member.",
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

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="flex-items-center gap-2">
            <UserPlus size={20} />
            <h2>Register Staff Member</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                name="middleName"
                className="form-input"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="staff@hospital.go.tz"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+255700000000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password *</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="form-input"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Autocomplete Facility Lookup */}
          <div className="form-group relative-container">
            <label className="form-label">Assigned Facility</label>
            <div className="input-with-icon">
              <input
                type="text"
                className="form-input"
                placeholder="Search facility by name..."
                value={facilitySearch}
                onChange={handleFacilitySearchChange}
              />
              {searchingFacility ? (
                <Loader2 size={16} className="spinner-icon" />
              ) : (
                <Search size={16} className="search-icon" />
              )}
            </div>

            {facilities.length > 0 && (
              <ul className="dropdown-menu">
                {facilities.map((fac) => (
                  <li
                    key={fac.id}
                    onClick={() => handleSelectFacility(fac)}
                    className="dropdown-item"
                  >
                    <strong>{fac.name}</strong>{" "}
                    <span className="text-muted">({fac.code})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Registering..." : "Register Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
