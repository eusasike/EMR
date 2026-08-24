import React, {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  getPatientsApi,
  createPatientApi,
  type Patient,
  type CreatePatientDTO,
} from "../../api/patient/patient";
import { Plus } from "lucide-react";
import "../../style/component.css";

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreatePatientDTO>({
    firstName: "",
    lastName: "",
    gender: "MALE",
    dateOfBirth: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
  });

  const loadPatients = useCallback(async () => {
    try {
      const data = await getPatientsApi();
      setPatients(data);
    } catch (err: unknown) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getPatientsApi()
      .then((data) => {
        if (isMounted) {
          setPatients(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load patients:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
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
      });
      setLoading(true);
      await loadPatients();
    } catch (err: unknown) {
      console.error("Failed to register patient:", err);
      alert("Failed to register patient.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CreatePatientDTO["gender"];
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      p.mrn?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppLayout pageTitle="Patient Registry & Admissions">
      <div className="page-actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or MRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="btn-primary"
          style={{ width: "auto" }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} style={{ marginRight: 6 }} /> Register New Patient
        </button>
      </div>

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
              {filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "#64748b",
                    }}
                  >
                    No patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Register Patient</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="auth-form">
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

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+255..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
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
                    type="text"
                    className="form-input"
                    placeholder="+255..."
                    value={formData.emergencyContactPhone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                  />
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
