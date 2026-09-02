import React, { useState, useEffect } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  getMedicalServicesApi,
  createMedicalServiceApi,
  updateMedicalServiceApi,
  type MedicalService,
  type CreateMedicalServiceDTO,
} from "../../api/medical-service/medical-service";
import axios from "axios";

export const ManageMedicalServicesPage: React.FC = () => {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchServices = async (searchTerm?: string) => {
    try {
      setLoading(true);

      const data = await getMedicalServicesApi({
        search: searchTerm,
      });
      setServices(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to load medical services.",
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

  useEffect(() => {
    let isMounted = true;

    getMedicalServicesApi()
      .then((data) => {
        if (isMounted) setServices(data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Failed to load medical services.",
          );
        } else {
          setError("Failed to load medical services.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchServices(val);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setIsActive(true);
    setError(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: MedicalService & { isActive?: boolean }) => {
    setEditingId(service.id);
    setName(service.name);
    setCategory(service.category);
    setPrice(Number(service.price));
    setIsActive(service.isActive ?? true);
    setError(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !category || price === "") {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const facilityId = localStorage.getItem("facilityId");
      if (!facilityId) {
        setError(
          "Active facility context missing from local storage. Please re-select your facility.",
        );
        return;
      }

      const payload = {
        name,
        category,
        price: Number(price),
        isActive,
      };

      if (editingId) {
        await updateMedicalServiceApi(editingId, payload);
        setSuccessMsg("Medical service updated successfully!");
      } else {
        await createMedicalServiceApi(payload as CreateMedicalServiceDTO);
        setSuccessMsg("Medical service created successfully!");
      }

      setIsModalOpen(false);
      fetchServices(search);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to save medical service.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <AppLayout pageTitle="Manage Medical Services">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Action Bar */}
        <div
          className="page-actions"
          style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
        >
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search services by name or category..."
            className="search-input"
          />
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary"
            style={{ width: "auto" }}
          >
            + Add Medical Service
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}
        {error && !isModalOpen && (
          <div
            className="alert-danger"
            style={{ color: "#ef4444", marginBottom: "15px" }}
          >
            {error}
          </div>
        )}

        {/* Services Table Card */}
        <div className="table-card">
          <table className="emr-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    No medical services found.
                  </td>
                </tr>
              ) : (
                services.map((s) => {
                  const active = s.isActive ?? true;
                  return (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>
                        <span className="code-badge">{s.category}</span>
                      </td>
                      <td>${Number(s.price).toFixed(2)}</td>
                      <td>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 500,
                            backgroundColor: active ? "#dcfce7" : "#fee2e2",
                            color: active ? "#166534" : "#b91c1c",
                          }}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          display: "flex",
                          gap: "6px",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(s)}
                          className="btn-logout"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Dialog */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  {editingId ? "Edit Medical Service" : "Add Medical Service"}
                </h3>
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

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Malaria Rapid Test"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Laboratory"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="isActiveCheckbox"
                    className="form-label"
                    style={{ margin: 0, cursor: "pointer" }}
                  >
                    Active Status
                  </label>
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
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {editingId ? "Save Changes" : "Create Service"}
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
