import React, { useState } from "react";
import {
  type RegisterUserPayload,
  type UserRole,
  type UserItem,
  registerStaffUserApi,
  updateUserApi,
} from "../../api/user/user";
import { api } from "../../api/axiosClient";
import axios from "axios";
import { X, UserPlus, Search, Loader2 } from "lucide-react";
import "../../style/component.css";

interface RegisterStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: UserItem | null;
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
  userToEdit,
}) => {
  const isEditing = Boolean(userToEdit);

  // 1. Track previous prop to detect changes during render
  const [prevUserToEdit, setPrevUserToEdit] = useState<
    UserItem | null | undefined
  >(userToEdit);

  // 2. Initialize state lazily
  const [formData, setFormData] = useState<
    RegisterUserPayload & { isActive: boolean }
  >(() => ({
    firstName: userToEdit?.firstName || "",
    lastName: userToEdit?.lastName || "",
    middleName: userToEdit?.middleName || "",
    email: userToEdit?.email || "",
    phone: userToEdit?.phone || "",
    password: "",
    role: (userToEdit?.role || "NURSE") as UserRole,
    isActive: userToEdit?.isActive ?? true,
  }));

  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [facilitySearch, setFacilitySearch] = useState<string>(() =>
    userToEdit?.facility
      ? `${userToEdit.facility.name} (${userToEdit.facility.code})`
      : "",
  );
  const [searchingFacility, setSearchingFacility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userToEdit !== prevUserToEdit) {
    setPrevUserToEdit(userToEdit);
    setFormData({
      firstName: userToEdit?.firstName || "",
      lastName: userToEdit?.lastName || "",
      middleName: userToEdit?.middleName || "",
      email: userToEdit?.email || "",
      phone: userToEdit?.phone || "",
      password: "",
      role: (userToEdit?.role || "NURSE") as UserRole,
      facilityId: userToEdit?.facility?.code || "",
      isActive: userToEdit?.isActive ?? true,
    });
    setFacilitySearch(
      userToEdit?.facility
        ? `${userToEdit.facility.name} (${userToEdit.facility.code})`
        : "",
    );
    setError(null);
  }

  // Facility autocomplete search effect (valid async API effect)
  React.useEffect(() => {
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
        password: formData.password,
        isActive: formData.isActive,
      };

      if (isEditing && userToEdit) {
        await updateUserApi(userToEdit.id, payload);
      } else {
        await registerStaffUserApi(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            (isEditing
              ? "Failed to update staff member."
              : "Failed to register staff member."),
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
            <h2>
              {isEditing
                ? "Manage / Update Staff Member"
                : "Register Staff Member"}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" type="button">
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Account Status Toggle (Shown when editing) */}
          {isEditing && (
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid var(--emr-border)",
                padding: "12px 16px",
                borderRadius: "var(--emr-radius-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    display: "block",
                    color: "var(--emr-text-main)",
                  }}
                >
                  Account Status
                </label>
                <small className="text-muted">
                  {formData.isActive
                    ? "User can log in and access system."
                    : "User account is disabled."}
                </small>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "var(--emr-primary)",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{ color: formData.isActive ? "#047857" : "#dc2626" }}
                >
                  {formData.isActive
                    ? "Active (Enabled)"
                    : "Inactive (Disabled)"}
                </span>
              </label>
            </div>
          )}

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
            <label className="form-label">
              {isEditing
                ? "New Password (leave blank to keep current)"
                : "Temporary Password *"}
            </label>
            <input
              type="password"
              name="password"
              required={!isEditing}
              minLength={8}
              className="form-input"
              placeholder={
                isEditing ? "Optional new password" : "At least 8 characters"
              }
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
              {loading
                ? isEditing
                  ? "Saving Changes..."
                  : "Registering..."
                : isEditing
                  ? "Save Changes"
                  : "Register Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
