// src/pages/doctor/DoctorConsultationPage.tsx
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
import {
  type LabResultItem,
  type ExtendedProvidedServiceItem,
  type PrescriptionBatch,
  type PharmacyProduct,
  type PharmacyPrescriptionItem,
  type PrescriptionSummaryItem,
  type PrescriptionSummary,
} from "../../api/medical-service/doctorConsultation"; // Adjust path to types file if necessary

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
      const rawProducts = (await getPharmacyProductsApi()) as PharmacyProduct[];
      const products = Array.isArray(rawProducts) ? rawProducts : [];
      setPrescriptionItems(
        products.map((p) => {
          let parsedBatches: PrescriptionBatch[] = [];
          if (Array.isArray(p.batches)) {
            parsedBatches = p.batches;
          } else if (typeof p.batches === "string") {
            try {
              const parsed = JSON.parse(p.batches as unknown as string);
              if (Array.isArray(parsed)) parsedBatches = parsed;
            } catch {
              parsedBatches = [];
            }
          }
          return {
            productId: p.id,
            productName: p.name,
            unitPrice: Number(p.unitPrice) || 0,
            quantity: 1,
            dosage: "1 tab daily",
            duration: "5",
            selected: false,
            batches: parsedBatches,
          };
        }),
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
        (Array.isArray(catalogServices) ? catalogServices : []).filter(
          (s: MedicalService) => s.isActive ?? true,
        ),
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
        findings: selectedLabResult.findings?.trim() || undefined,
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
      prev.map((item) => {
        if (item.productId === productId) {
          const totalStock = item.batches.reduce(
            (sum, b) => sum + (b.quantity || 0),
            0,
          );
          const clampedQty = Math.max(
            1,
            totalStock > 0 ? Math.min(qty, totalStock) : qty,
          );
          return { ...item, quantity: clampedQty };
        }
        return item;
      }),
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
      if (field === "quantity") {
        const item = updated[index];
        const enteredVal = Number(value);
        updated[index] = { ...item, [field]: Math.max(1, enteredVal) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
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

    for (const item of selectedProducts) {
      const totalStock = item.batches.reduce(
        (sum, b) => sum + (b.quantity || 0),
        0,
      );
      if (item.quantity > totalStock) {
        setError(
          `Quantity for "${item.productName}" exceeds available stock (${totalStock} left).`,
        );
        return;
      }
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
                  <span className="text-muted">Symptoms:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {activeVisit.symptoms}
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
                  type="button"
                  onClick={handleOpenPharmacyModal}
                  className="btn-primary text-sm py-2 px-4"
                  style={{ backgroundColor: "#033909" }}
                >
                  + Order Pharmacy Products
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn-primary text-sm py-2 px-4"
                >
                  + Order New Service
                </button>
              </div>
            </div>

            {/* Prescriptions Table */}
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
                      {activeVisit.prescriptions.map((rx) => {
                        const isCompleted =
                          rx.status?.toUpperCase() === "COMPLETED";

                        return (
                          <tr key={rx.id}>
                            <td className="font-medium text-slate-900 code-badge">
                              {rx.id.substring(0, 8)}...
                            </td>
                            <td className="text-muted text-xs">
                              {rx.notes || "—"}
                            </td>
                            <td>
                              {Array.isArray(rx.items) &&
                                rx.items.map((item) => {
                                  const typedItem =
                                    item as PrescriptionSummaryItem;
                                  return (
                                    <div
                                      key={typedItem.id || typedItem.productId}
                                      className="text-xs"
                                    >
                                      <span className="font-medium">
                                        {typedItem.productName || "Product"}
                                      </span>{" "}
                                      ({typedItem.quantity} units)
                                    </div>
                                  );
                                })}
                            </td>
                            <td>
                              <span
                                className={`badge ${isCompleted ? "badge-success" : "badge-in-progress"}`}
                              >
                                {rx.status || "PRESCRIBED"}
                              </span>
                            </td>
                            <td className="text-right">
                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditPrescriptionModal({
                                      id: rx.id,
                                      notes: rx.notes,
                                      items: (Array.isArray(rx.items)
                                        ? rx.items
                                        : []
                                      ).map((i) => {
                                        const typedI =
                                          i as PrescriptionSummaryItem;
                                        return {
                                          id: typedI.id,
                                          productId: typedI.productId,
                                          productName:
                                            typedI.productName || "Product",
                                          quantity: typedI.quantity,
                                          unitPrice: Number(
                                            typedI.unitPrice || 0,
                                          ),
                                          dosage: typedI.dosage,
                                          duration: typedI.duration,
                                        };
                                      }),
                                    })
                                  }
                                  className="btn-logout"
                                  style={{ fontSize: 12, padding: "4px 10px" }}
                                >
                                  Edit Order
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
                                  type="button"
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
                                  type="button"
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

        {/* Pharmacy Order Modal with Batch Balances */}
        {isPharmacyModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "950px" }}>
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
                    marginTop: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="my-3">
                <input
                  type="text"
                  placeholder="Search medication catalog..."
                  value={pharmacySearchQuery}
                  onChange={(e) => setPharmacySearchQuery(e.target.value)}
                  className="search-input w-full"
                  style={{ width: "100%" }}
                />
              </div>

              <form onSubmit={handlePharmacySubmit}>
                <div
                  className="overflow-y-auto border border-slate-200 rounded-md my-3 p-2 bg-slate-50"
                  style={{ maxHeight: "350px" }}
                >
                  <table
                    className="w-full text-sm"
                    border={1}
                    cellPadding={4}
                    cellSpacing={0}
                  >
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-muted text-xs">
                        <th className="p-2">Select</th>
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Available Batch Balances</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2">Order Qty</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPharmacyItems.map((item) => {
                        const totalStock = item.batches.reduce(
                          (sum, b) => sum + (b.quantity || 0),
                          0,
                        );

                        return (
                          <tr
                            key={item.productId}
                            className="border-b border-slate-100 hover:bg-white"
                          >
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() =>
                                  handlePharmacyItemToggle(item.productId)
                                }
                              />
                            </td>
                            <td className="p-2 font-medium text-slate-800">
                              {item.productName}
                            </td>
                            <td className="p-2 text-xs text-slate-600">
                              {item.batches && item.batches.length > 0 ? (
                                <div className="space-y-1">
                                  {item.batches.map((b) => (
                                    <div
                                      key={b.id}
                                      className="flex items-center gap-2"
                                    >
                                      <span>Qty: {b.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-red-500">No stock</span>
                              )}
                            </td>
                            <td className="p-2">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                max={totalStock > 0 ? totalStock : undefined}
                                value={item.quantity}
                                onChange={(e) =>
                                  handlePharmacyQtyChange(
                                    item.productId,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="form-input text-xs"
                                style={{ width: "60px" }}
                                disabled={!item.selected}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.dosage}
                                onChange={(e) =>
                                  handlePharmacyDosageChange(
                                    item.productId,
                                    e.target.value,
                                  )
                                }
                                className="form-input text-xs"
                                style={{ width: "90px" }}
                                disabled={!item.selected}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.duration}
                                onChange={(e) =>
                                  handlePharmacyDurationChange(
                                    item.productId,
                                    e.target.value,
                                  )
                                }
                                className="form-input text-xs"
                                style={{ width: "60px" }}
                                disabled={!item.selected}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="font-semibold text-sm">
                    Total Estimated Cost:{" "}
                    <span className="text-green-600">
                      ${calculateTotalPharmacyCost().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPharmacyModalOpen(false)}
                      className="btn-logout text-sm py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary text-sm py-2 px-4"
                      style={{ backgroundColor: "#033909" }}
                    >
                      {loading
                        ? "Ordering..."
                        : "Confirm & Order Prescriptions"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Prescription Modal */}
        {isEditPrescriptionModalOpen && activePrescription && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "800px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  Edit Prescription #{activePrescription.id.substring(0, 8)}
                </h3>
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
                <div
                  className="overflow-y-auto border border-slate-200 rounded-md my-3 p-2 bg-slate-50"
                  style={{ maxHeight: "350px" }}
                >
                  <table
                    className="w-full text-sm"
                    border={1}
                    cellPadding={4}
                    cellSpacing={0}
                  >
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-muted text-xs">
                        <th className="p-2">Product Name</th>
                        <th className="p-2">Unit Price</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editablePrescriptionItems.map((item, index) => (
                        <tr
                          key={item.id || item.productId}
                          className="border-b border-slate-100 hover:bg-white"
                        >
                          <td className="p-2 font-medium text-slate-800">
                            {item.productName || "Product"}
                          </td>
                          <td className="p-2">
                            ${Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleEditableItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className="form-input text-xs"
                              style={{ width: "60px" }}
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
                              className="form-input text-xs"
                              style={{ width: "90px" }}
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
                              className="form-input text-xs"
                              style={{ width: "60px" }}
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveEditableItem(index)}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="font-semibold text-sm">
                    Updated Total Cost:{" "}
                    <span className="text-green-600">
                      ${calculateEditableTotalCost().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditPrescriptionModalOpen(false)}
                      className="btn-logout text-sm py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Creating/Editing Service Order */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  {editingProvidedServiceId
                    ? "Edit Medical Service Order"
                    : "Order New Medical Service"}
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

              <form onSubmit={handleFormSubmit} className="auth-form space-y-4">
                <div className="form-group">
                  <label className="form-label">Select Medical Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">-- Choose Service --</option>
                    {servicesList.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} (${Number(service.price).toFixed(2)})
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
                    rows={3}
                    placeholder="Optional clinical notes..."
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
                    {loading ? "Saving..." : "Save Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lab Result View Modal */}
        {isLabModalOpen && selectedLabResult && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "600px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Laboratory Test Results</h3>
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

              <div className="space-y-4 my-4 text-sm">
                <div>
                  <span className="text-muted">Result:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedLabResult.resultValue || "Laboratory Analysis"}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="badge badge-success">
                    {selectedLabResult.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Findings / Results:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mt-1 text-slate-800 whitespace-pre-wrap">
                    {selectedLabResult.findings || "No findings recorded yet."}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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
                    style={{ flex: 1, backgroundColor: "#059669" }}
                  >
                    {loading ? "Verifying..." : "Verify & Approve Results"}
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
