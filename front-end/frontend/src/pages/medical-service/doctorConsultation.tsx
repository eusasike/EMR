import React, { useState, useEffect, useCallback, useRef } from "react";
import { searchPatientApi, type Patient } from "../../api/patient/patient";
import {
  getMedicalServicesApi,
  getLatestVisitByMrnApi,
  provideServiceApi,
  updateProvidedServiceApi,
  createPrescriptionApi,
  type MedicalService,
  type Visit,
  type ProvidedServiceItem,
} from "../../api/medical-service/medical-service";
import { verifyLabResultApi } from "../../api/lab/lab";
import { getPharmacyProductsApi } from "../../api/inventory/phamarcy";
import axios from "axios";
import { AppLayout } from "../../components/layout/AppLayout";

export interface LabResultItem {
  id: string;
  status: string;
  specimenType?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  findings?: string;
}

export interface ExtendedProvidedServiceItem extends ProvidedServiceItem {
  labResult?: LabResultItem;
}

export interface PharmacyPrescriptionItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  dosage: string;
  duration: string;
  selected: boolean;
}

export interface PrescriptionSummaryItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  dosage?: string;
  duration?: string;
}

export interface PrescriptionSummary {
  id: string;
  notes?: string;
  items: PrescriptionSummaryItem[];
}

export const DoctorConsultationPage: React.FC = () => {
  const [mrnQuery, setMrnQuery] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [servicesList, setServicesList] = useState<MedicalService[]>([]);

  // Provide/Update service form state inside a modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvidedServiceId, setEditingProvidedServiceId] = useState<
    string | null
  >(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [notes, setNotes] = useState("");

  // Pharmacy Modal State
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState<
    PharmacyPrescriptionItem[]
  >([]);
  const [pharmacySearchQuery, setPharmacySearchQuery] = useState("");

  // Edit Prescription Modal State
  const [isEditPrescriptionModalOpen, setIsEditPrescriptionModalOpen] =
    useState(false);
  const [activePrescription, setActivePrescription] =
    useState<PrescriptionSummary | null>(null);
  const [editablePrescriptionItems, setEditablePrescriptionItems] = useState<
    PrescriptionSummaryItem[]
  >([]);

  // Lab Result View Modal State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [selectedLabResult, setSelectedLabResult] =
    useState<LabResultItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadPharmacyCatalog = useCallback(async () => {
    try {
      const products = await getPharmacyProductsApi();
      setPrescriptionItems(
        products.map((p) => ({
          productId: p.id,
          productName: p.name,
          unitPrice: Number(p.unitPrice) || 0,
          quantity: 1,
          dosage: "1 tab daily",
          duration: "5",
          selected: false,
        })),
      );
    } catch {
      // Non-blocking fallback if pharmacy catalog fails to fetch
    }
  }, []);

  const hasLoadedPharmacy = useRef(false);
  useEffect(() => {
    if (!hasLoadedPharmacy.current) {
      hasLoadedPharmacy.current = true;
      loadPharmacyCatalog();
    }
  }, [loadPharmacyCatalog]);

  const handleSearchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setActiveVisit(null);
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

      const [visitData, catalogServices] = await Promise.all([
        getLatestVisitByMrnApi(foundPatient.mrn),
        getMedicalServicesApi(),
      ]);

      setActiveVisit(visitData);
      setServicesList(
        catalogServices.filter((s: MedicalService) => s.isActive ?? true),
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "No active visit found for this patient MRN.",
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

  const handleOpenCreateModal = () => {
    setEditingProvidedServiceId(null);
    setSelectedServiceId("");
    setNotes("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenPharmacyModal = () => {
    setError(null);
    setPharmacySearchQuery("");
    setPrescriptionItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: false,
        quantity: 1,
        dosage: "1 tab daily",
        duration: "5",
      })),
    );
    setIsPharmacyModalOpen(true);
  };

  const handleOpenEditPrescriptionModal = (
    prescription: PrescriptionSummary,
  ) => {
    setActivePrescription(prescription);
    setEditablePrescriptionItems(
      prescription.items.map((item) => ({ ...item })),
    );
    setError(null);
    setIsEditPrescriptionModalOpen(true);
  };

  const handleOpenEditModal = (item: ProvidedServiceItem) => {
    setEditingProvidedServiceId(item.id);
    setSelectedServiceId(item.serviceId || item.service?.id || "");
    setNotes(item.notes || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenLabModal = (labResult: LabResultItem) => {
    setSelectedLabResult(labResult);
    setIsLabModalOpen(true);
  };

  const handleVerifyLabResult = async () => {
    if (!selectedLabResult || !patient) return;

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      await verifyLabResultApi(selectedLabResult.id, {
        findings: selectedLabResult.findings,
      });

      setSuccessMsg("Lab results verified and approved successfully!");
      setIsLabModalOpen(false);

      const updatedVisit = await getLatestVisitByMrnApi(patient.mrn);
      setActiveVisit(updatedVisit);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to verify laboratory result.",
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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeVisit || !selectedServiceId) return;

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      if (editingProvidedServiceId) {
        await updateProvidedServiceApi(editingProvidedServiceId, {
          visitId: activeVisit.id,
          serviceId: selectedServiceId,
          notes: notes.trim() || undefined,
        });
        setSuccessMsg("Medical service order updated successfully!");
      } else {
        await provideServiceApi({
          visitId: activeVisit.id,
          serviceId: selectedServiceId,
          notes: notes.trim() || undefined,
        });
        setSuccessMsg("Medical service ordered/provided successfully!");
      }

      setIsModalOpen(false);

      if (patient) {
        const updatedVisit = await getLatestVisitByMrnApi(patient.mrn);
        setActiveVisit(updatedVisit);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to save service action.",
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

  const handlePharmacyItemToggle = (productId: string) => {
    setPrescriptionItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const handlePharmacyQtyChange = (productId: string, qty: number) => {
    setPrescriptionItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, qty) }
          : item,
      ),
    );
  };

  const handlePharmacyDosageChange = (productId: string, dosage: string) => {
    setPrescriptionItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, dosage } : item,
      ),
    );
  };

  const handlePharmacyDurationChange = (
    productId: string,
    duration: string,
  ) => {
    setPrescriptionItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, duration } : item,
      ),
    );
  };

  const handleEditableItemChange = (
    index: number,
    field: keyof PrescriptionSummaryItem,
    value: string | number,
  ) => {
    setEditablePrescriptionItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveEditableItem = (index: number) => {
    setEditablePrescriptionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalPharmacyCost = () => {
    return prescriptionItems
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  };

  const calculateEditableTotalCost = () => {
    return editablePrescriptionItems.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
  };

  const handlePharmacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;

    const selectedProducts = prescriptionItems.filter((i) => i.selected);
    if (selectedProducts.length === 0) {
      setError("Please select at least one pharmacy product.");
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      const payload = {
        visitId: activeVisit.id,
        notes: "Pharmacy Prescription Order",
        items: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          dosage: item.dosage,
          duration: item.duration,
        })),
      };

      await createPrescriptionApi(payload);

      setSuccessMsg(
        `Pharmacy prescription ordered successfully! Total Cost: $${calculateTotalPharmacyCost().toFixed(2)}`,
      );
      setIsPharmacyModalOpen(false);

      if (patient) {
        const updatedVisit = await getLatestVisitByMrnApi(patient.mrn);
        setActiveVisit(updatedVisit);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to submit pharmacy prescription.",
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

  const handleUpdatePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit || !activePrescription) return;

    if (editablePrescriptionItems.length === 0) {
      setError("Prescription must contain at least one item.");
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);

      const payload = {
        visitId: activeVisit.id,
        notes: activePrescription.notes || "Updated Prescription Order",
        items: editablePrescriptionItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          dosage: item.dosage || "",
          duration: item.duration || "",
        })),
      };

      await createPrescriptionApi(payload);

      setSuccessMsg("Prescription order updated successfully!");
      setIsEditPrescriptionModalOpen(false);

      if (patient) {
        const updatedVisit = await getLatestVisitByMrnApi(patient.mrn);
        setActiveVisit(updatedVisit);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to update prescription order.",
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

  const isPharmacyCategory = (category?: string): boolean => {
    const cat = category?.toLowerCase() || "";
    return cat === "pharmacy" || cat === "medicine" || cat === "drug";
  };

  const isLabCategory = (category?: string): boolean => {
    const cat = category?.toLowerCase() || "";
    return cat === "laboratory" || cat === "lab";
  };

  const filteredPharmacyItems = prescriptionItems.filter((item) =>
    item.productName.toLowerCase().includes(pharmacySearchQuery.toLowerCase()),
  );

  return (
    <AppLayout pageTitle="Doctor Consultation & Services">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="page-actions">
          <h1 className="text-xl font-bold text-slate-900">
            Doctor Consultation & Services
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
            {loading ? "Searching..." : "Search Visit"}
          </button>
        </form>

        {error &&
          !isModalOpen &&
          !isLabModalOpen &&
          !isPharmacyModalOpen &&
          !isEditPrescriptionModalOpen && (
            <div className="alert-danger">{error}</div>
          )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {/* Patient & Active Visit Display */}
        {patient && activeVisit && (
          <div className="space-y-6">
            {/* Patient Profile Card */}
            <div className="table-card p-5 bg-white border-l-4 border-l-sky-600">
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
                  <span className="text-muted">Weight:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {activeVisit.vitalSigns?.weight} kg
                  </span>
                </div>
                <div>
                  <span className="text-muted">Visit Status:</span>{" "}
                  <span className="badge badge-in-progress">
                    {activeVisit.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Services Section Header */}
            <div className="flex justify-between items-center gap-3">
              <div style={{ display: "flex", gap: "2cm" }}>
                <button
                  onClick={handleOpenPharmacyModal}
                  className="btn-primary text-sm py-2 px-4"
                  style={{ backgroundColor: "#033909" }}
                >
                  + Order Pharmacy Products
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="btn-primary text-sm py-2 px-4"
                >
                  + Order New Service
                </button>
              </div>
            </div>

            {/* Prescriptions Table (Ordered Medications) */}
            {activeVisit.prescriptions &&
              activeVisit.prescriptions.length > 0 && (
                <div className="table-card mb-6">
                  <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
                    Ordered Pharmacy Prescriptions
                  </h3>
                  <table className="emr-table">
                    <thead>
                      <tr>
                        <th>Prescription ID</th>
                        <th>Notes</th>
                        <th>Items Summary</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVisit.prescriptions.map((rx) => (
                        <tr key={rx.id}>
                          <td className="font-medium text-slate-900 code-badge">
                            {rx.id.substring(0, 8)}...
                          </td>
                          <td className="text-muted text-xs">
                            {rx.notes || "—"}
                          </td>
                          <td>
                            {rx.items?.map((item) => (
                              <div
                                key={item.id || item.productId}
                                className="text-xs"
                              >
                                <span className="font-medium">
                                  {item.product?.name ||
                                    item.productName ||
                                    "Product"}
                                </span>{" "}
                                ({item.quantity} units)
                              </div>
                            ))}
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {rx.status || "PRESCRIBED"}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() =>
                                handleOpenEditPrescriptionModal({
                                  id: rx.id,
                                  notes: rx.notes,
                                  items: (rx.items || []).map((i) => ({
                                    id: i.id,
                                    productId: i.productId,
                                    productName:
                                      i.product?.name ||
                                      i.productName ||
                                      "Product",
                                    quantity: i.quantity,
                                    unitPrice: Number(i.unitPrice || 0),
                                    dosage: i.dosage,
                                    duration: i.duration,
                                  })),
                                })
                              }
                              className="btn-logout"
                              style={{ fontSize: 12, padding: "4px 10px" }}
                            >
                              Edit Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            {/* Table of Provided Services */}
            <div className="table-card">
              <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
                Medical Service Orders
              </h3>
              <table className="emr-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Notes</th>
                    <th>Unit Price</th>
                    <th>Status / Details</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVisit.services && activeVisit.services.length > 0 ? (
                    (activeVisit.services as ExtendedProvidedServiceItem[]).map(
                      (item) => {
                        const isLab = isLabCategory(item.service?.category);
                        const isPharm = isPharmacyCategory(
                          item.service?.category,
                        );
                        const labStatus =
                          item.labResult?.status || (isLab ? "ORDERED" : "N/A");

                        return (
                          <tr key={item.id}>
                            <td className="font-medium text-slate-900">
                              {item.service?.name || "Medical Service"}
                            </td>
                            <td>
                              <span className="code-badge">
                                {item.service?.category || "General"}
                              </span>
                            </td>
                            <td className="text-muted text-xs">
                              {item.notes || "—"}
                            </td>
                            <td className="font-medium">
                              ${Number(item.unitPrice).toFixed(2)}
                            </td>
                            <td>
                              {isLab ? (
                                <span
                                  className={`badge ${labStatus === "VERIFIED" ? "badge-success" : labStatus === "COMPLETED" ? "badge-warning" : "badge-in-progress"}`}
                                >
                                  {labStatus}
                                </span>
                              ) : isPharm ? (
                                <span className="badge badge-success">
                                  PRESCRIBED
                                </span>
                              ) : (
                                <span className="text-muted text-xs">—</span>
                              )}
                            </td>
                            <td className="text-right space-x-2">
                              {isLab && item.labResult && (
                                <button
                                  onClick={() =>
                                    handleOpenLabModal(
                                      item.labResult as LabResultItem,
                                    )
                                  }
                                  className="btn-primary"
                                  style={{
                                    fontSize: 12,
                                    padding: "4px 10px",
                                    backgroundColor: "#0284c7",
                                  }}
                                >
                                  View Lab Result
                                </button>
                              )}
                              {labStatus !== "VERIFIED" && !isPharm && (
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="btn-logout"
                                  style={{ fontSize: 12, padding: "4px 10px" }}
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-6">
                        No services or orders recorded yet for this active
                        visit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Prescription Modal */}
        {isEditPrescriptionModalOpen && activePrescription && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "850px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Edit Ordered Prescription</h3>
                <button
                  type="button"
                  onClick={() => setIsEditPrescriptionModalOpen(false)}
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
                    marginTop: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdatePrescriptionSubmit}>
                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md my-3 p-2 bg-slate-50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-muted text-xs">
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editablePrescriptionItems.map((item, index) => {
                        const subtotal = item.unitPrice * item.quantity;
                        return (
                          <tr
                            key={item.productId || index}
                            className="border-b border-slate-100 hover:bg-white"
                          >
                            <td className="p-2 font-medium text-slate-800">
                              {item.productName}
                            </td>
                            <td className="p-2">
                              ${Number(item.unitPrice).toFixed(2)}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleEditableItemChange(
                                    index,
                                    "quantity",
                                    Number(e.target.value),
                                  )
                                }
                                className="form-input text-center"
                                style={{ width: "60px", padding: "2px 4px" }}
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.dosage || ""}
                                onChange={(e) =>
                                  handleEditableItemChange(
                                    index,
                                    "dosage",
                                    e.target.value,
                                  )
                                }
                                className="form-input"
                                style={{ width: "110px", padding: "2px 6px" }}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.duration || ""}
                                onChange={(e) =>
                                  handleEditableItemChange(
                                    index,
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                className="form-input"
                                style={{ width: "90px", padding: "2px 6px" }}
                              />
                            </td>
                            <td className="p-2 text-right font-semibold">
                              ${subtotal.toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveEditableItem(index)}
                                className="text-red-600 hover:text-red-800 text-xs font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-sky-50 p-3 rounded-md flex justify-between items-center mb-4">
                  <span className="font-semibold text-slate-800">
                    Total Prescription Cost:
                  </span>
                  <span className="text-lg font-bold text-sky-700">
                    ${calculateEditableTotalCost().toFixed(2)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditPrescriptionModalOpen(false)}
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
                    {loading ? "Updating..." : "Save Prescription Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order New Service Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  {editingProvidedServiceId
                    ? "Edit Service Order"
                    : "Order New Service"}
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

              <form onSubmit={handleFormSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Medical Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select Service --</option>
                    {servicesList.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} (${Number(svc.price).toFixed(2)}) -{" "}
                        {svc.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                    placeholder="Optional clinical notes..."
                    rows={3}
                  />
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
                    {loading
                      ? "Saving..."
                      : editingProvidedServiceId
                        ? "Update Order"
                        : "Submit Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Pharmacy Products Modal */}
        {isPharmacyModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "850px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Order Pharmacy Products</h3>
                <button
                  type="button"
                  onClick={() => setIsPharmacyModalOpen(false)}
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

              <div className="my-3">
                <input
                  type="text"
                  value={pharmacySearchQuery}
                  onChange={(e) => setPharmacySearchQuery(e.target.value)}
                  placeholder="Search pharmacy products..."
                  className="search-input w-full mb-3"
                />

                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-muted text-xs">
                        <th className="p-2 text-center w-10">Select</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPharmacyItems.map((item) => {
                        const subtotal = item.unitPrice * item.quantity;
                        return (
                          <tr
                            key={item.productId}
                            className={`border-b border-slate-100 hover:bg-white ${item.selected ? "bg-sky-50/60" : ""}`}
                          >
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() =>
                                  handlePharmacyItemToggle(item.productId)
                                }
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  cursor: "pointer",
                                }}
                              />
                            </td>
                            <td className="p-2 font-medium text-slate-800">
                              {item.productName}
                            </td>
                            <td className="p-2">
                              ${Number(item.unitPrice).toFixed(2)}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                disabled={!item.selected}
                                onChange={(e) =>
                                  handlePharmacyQtyChange(
                                    item.productId,
                                    Number(e.target.value),
                                  )
                                }
                                className="form-input text-center disabled:opacity-50"
                                style={{ width: "60px", padding: "2px 4px" }}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.dosage}
                                disabled={!item.selected}
                                onChange={(e) =>
                                  handlePharmacyDosageChange(
                                    item.productId,
                                    e.target.value,
                                  )
                                }
                                className="form-input disabled:opacity-50"
                                style={{ width: "110px", padding: "2px 6px" }}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.duration}
                                disabled={!item.selected}
                                onChange={(e) =>
                                  handlePharmacyDurationChange(
                                    item.productId,
                                    e.target.value,
                                  )
                                }
                                className="form-input disabled:opacity-50"
                                style={{ width: "90px", padding: "2px 6px" }}
                              />
                            </td>
                            <td className="p-2 text-right font-semibold">
                              ${subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-sky-50 p-3 rounded-md flex justify-between items-center mb-4">
                <span className="font-semibold text-slate-800">
                  Total Prescription Cost:
                </span>
                <span className="text-lg font-bold text-sky-700">
                  ${calculateTotalPharmacyCost().toFixed(2)}
                </span>
              </div>

              <form onSubmit={handlePharmacySubmit}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsPharmacyModalOpen(false)}
                    className="btn-logout"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1, backgroundColor: "#033909" }}
                  >
                    {loading ? "Submitting..." : "Submit Prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View/Verify Lab Result Modal */}
        {isLabModalOpen && selectedLabResult && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Laboratory Results Review</h3>
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
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

              <div className="space-y-3 text-sm my-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="badge badge-success">
                    {selectedLabResult.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Specimen Type:</span>{" "}
                  <span className="font-medium">
                    {selectedLabResult.specimenType || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Result Value:</span>{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedLabResult.resultValue || "—"}{" "}
                    {selectedLabResult.unit || ""}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Reference Range:</span>{" "}
                  <span>{selectedLabResult.referenceRange || "—"}</span>
                </div>
                <div>
                  <span className="text-muted">Findings / Notes:</span>
                  <p className="mt-1 font-medium text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {selectedLabResult.findings || "No findings recorded."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="btn-logout"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                {selectedLabResult.status !== "VERIFIED" && (
                  <button
                    type="button"
                    onClick={handleVerifyLabResult}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1, backgroundColor: "#16a34a" }}
                  >
                    {loading ? "Verifying..." : "Verify & Approve Result"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
