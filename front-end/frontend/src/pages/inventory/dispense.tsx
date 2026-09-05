// src/pages/pharmacy/PharmacyDispensePage.tsx
import React, { useState } from "react";
import { searchPatientApi, type Patient } from "../../api/patient/patient";
import {
  getPrescriptionsByMrnApi,
  createDispenseRecordApi,
  updatePrescriptionStatusApi,
  type Prescription,
  type PrescriptionItem,
  type PrescriptionBatch,
} from "../../api/inventory/phamarcy";
import axios from "axios";
import { AppLayout } from "../../components/layout/AppLayout";

interface DispenseFormItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  batchId: string;
  maxQty: number;
  batches: PrescriptionBatch[];
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  instructions?: string;
}

export const PharmacyDispensePage: React.FC = () => {
  const [mrnQuery, setMrnQuery] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [dispenseItems, setDispenseItems] = useState<DispenseFormItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setPrescriptions([]);
    setSelectedPrescription(null);
    setDispenseItems([]);
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

      const rxList = await getPrescriptionsByMrnApi(foundPatient.mrn);
      const activeRxList = rxList.filter(
        (rx: Prescription) =>
          rx.status !== "DISPENSED" && rx.status !== "COMPLETED",
      );
      setPrescriptions(activeRxList);

      if (activeRxList.length === 0) {
        setError("No active prescriptions found for this patient.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to retrieve prescriptions for this MRN.",
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

  const handleSelectPrescription = (rx: Prescription) => {
    setSelectedPrescription(rx);
    const initialItems: DispenseFormItem[] = rx.items.map(
      (
        item: PrescriptionItem & {
          quantityOrdered?: number;
          dosage?: string;
          frequency?: string;
          durationDays?: number;
          instructions?: string;
        },
      ) => {
        const availableBatch: PrescriptionBatch | undefined =
          item.product.batches?.[0];
        return {
          productId: item.productId,
          productName: item.product.name,
          // 👈 Mapped to quantityOrdered from your backend payload
          quantity: item.quantityOrdered ?? item.quantity ?? 1,
          unitPrice: Number(
            item.product.unitPrice || item.product.unitPrice || 0,
          ),
          batchId: availableBatch?.id || "",
          maxQty: availableBatch?.quantity || 999,
          batches: item.product.batches || [],
          dosage: item.dosage || "",
          frequency: item.frequency || "",
          durationDays: item.durationDays,
          instructions: item.instructions || "",
        };
      },
    );
    setDispenseItems(initialItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof DispenseFormItem,
    value: string | number,
  ) => {
    setDispenseItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "batchId") {
        const selectedBatch = updated[index].batches.find(
          (b) => b.id === value,
        );
        if (selectedBatch) {
          updated[index].maxQty = selectedBatch.quantity;
        }
      }
      return updated;
    });
  };

  const calculateTotal = (): number => {
    return dispenseItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
  };

  const handleSubmitDispense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPrescription || !patient) return;

    for (const item of dispenseItems) {
      if (!item.batchId) {
        setError(`Please select a valid batch for ${item.productName}`);
        return;
      }
    }

    setError(null);
    setSuccessMsg(null);

    try {
      setLoading(true);
      const payload = {
        visitId: selectedPrescription.visit?.id,
        prescriptionId: selectedPrescription.id,
        notes: "Dispensed via MRN Pharmacy Portal",
        items: dispenseItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          batchId: i.batchId,
        })),
      };

      // 1. Create the dispense record and decrease batch quantities
      await createDispenseRecordApi(payload);

      // 2. Explicitly update the prescription status to DISPENSED
      // (Skip this if your backend automatically updates prescription status inside createDispenseRecordApi)
      await updatePrescriptionStatusApi(selectedPrescription.id, "COMPLETED");

      setSuccessMsg(
        "Items successfully dispensed and prescription status updated!",
      );
      setSelectedPrescription(null);
      setDispenseItems([]);

      // Refresh the active prescriptions list for the patient
      const updatedRxList = await getPrescriptionsByMrnApi(patient.mrn);
      const activeUpdatedList = updatedRxList.filter(
        (rx: Prescription) =>
          rx.status !== "DISPENSED" && rx.status !== "COMPLETED",
      );
      setPrescriptions(activeUpdatedList);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to complete dispensing.",
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
    <AppLayout pageTitle="Pharmacy Dispensing Portal">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="page-actions">
          <h1 className="text-xl font-bold text-slate-900">
            Pharmacy Dispensing & Prescriptions
          </h1>
        </div>

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
            {loading ? "Searching..." : "Search Patient"}
          </button>
        </form>

        {error && <div className="alert-danger mb-4">{error}</div>}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {patient && (
          <div className="table-card p-5 bg-white border-l-4 border-l-sky-600 mb-6">
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
                <span className="text-muted">Active Prescriptions:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {prescriptions.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {patient && prescriptions.length > 0 && !selectedPrescription && (
          <div className="table-card mb-6">
            <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
              Active Prescriptions
            </h3>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Prescription #</th>
                  <th>Notes</th>
                  <th>Items Count</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td className="font-medium text-slate-900 code-badge">
                      {rx.id || rx.id.substring(0, 8)}
                    </td>
                    <td>{rx.notes || "—"}</td>
                    <td>{rx.items?.length || 0} items</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleSelectPrescription(rx)}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "4px 10px" }}
                      >
                        Dispense Items
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedPrescription && (
          <div className="table-card p-6 bg-white">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dispense Prescribed Items (
                  {selectedPrescription.id.substring(0, 8)})
                </h3>
                <p className="text-xs text-muted">
                  Prescription ID: {selectedPrescription.id}
                </p>
              </div>
              <span className="badge badge-in-progress">VISIT ACTIVE</span>
            </div>

            <form onSubmit={handleSubmitDispense}>
              <div className="overflow-x-auto mb-4">
                <table className="emr-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Doctor's Instructions</th>
                      <th>Prescribed Qty</th>
                      <th>Batch & Stock</th>
                      <th>Dispense Qty</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispenseItems.map((item, idx) => (
                      <tr key={item.productId}>
                        <td className="font-medium text-slate-900">
                          {item.productName}
                        </td>
                        <td>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#1e293b",
                            }}
                          >
                            {item.dosage ? `Dosage: ${item.dosage}` : ""}
                            {item.frequency ? ` • ${item.frequency}` : ""}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {item.durationDays
                              ? `Duration: ${item.durationDays} days`
                              : ""}
                            {item.instructions
                              ? ` | Note: ${item.instructions}`
                              : ""}
                            {!item.dosage &&
                              !item.durationDays &&
                              !item.instructions &&
                              "—"}
                          </div>
                        </td>
                        <td className="text-xs text-muted font-medium">
                          {item.quantity}
                        </td>
                        <td>
                          <select
                            value={item.batchId}
                            onChange={(e) =>
                              handleItemChange(idx, "batchId", e.target.value)
                            }
                            className="form-input text-xs"
                            required
                          >
                            <option value="">-- Select Batch --</option>
                            {item.batches.map((batch) => (
                              <option key={batch.id} value={batch.id}>
                                Batch: {batch.batchNumber} (Avail:{" "}
                                {batch.quantity})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            max={item.maxQty}
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="form-input text-center text-xs"
                            style={{ width: "80px" }}
                            required
                          />
                        </td>
                        <td className="text-right font-semibold">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-sky-50 p-4 rounded-md flex justify-between items-center mb-6">
                <span className="font-semibold text-slate-800">
                  Total Cost:
                </span>
                <span className="text-xl font-bold text-sky-700">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPrescription(null)}
                  className="btn-logout"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? "Processing..." : "Complete Dispensing"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
