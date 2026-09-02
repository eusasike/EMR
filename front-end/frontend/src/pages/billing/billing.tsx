// pages/billing/InvoiceBillingPage.tsx
import React, { useState } from "react";
import { searchPatientApi, type Patient } from "../../api/patient/patient";
import {
  getInvoicesByMrnApi,
  recordPaymentApi,
  type InvoiceResponseDTO,
} from "../../api/billing/bill";
import axios from "axios";
import { AppLayout } from "../../components/layout/AppLayout";

export const InvoiceBillingPage: React.FC = () => {
  const [mrnQuery, setMrnQuery] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [invoicesList, setInvoicesList] = useState<InvoiceResponseDTO[]>([]);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceResponseDTO | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MOBILE_MONEY" | "CREDIT_CARD" | "BANK_TRANSFER" | "INSURANCE"
  >("CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [receivedById] = useState("00000000-0000-0000-0000-000000000001");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setPatient(null);
    setInvoicesList([]);
    setSelectedInvoice(null);

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

      const invoices = await getInvoicesByMrnApi(foundPatient.mrn);
      setInvoicesList(invoices);

      if (invoices.length === 0) {
        setError("No invoices found for this patient MRN.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to retrieve invoices for this MRN.",
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

  const handleOpenPaymentModal = (invoice: InvoiceResponseDTO) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balanceDue.toString());
    setPaymentMethod("CASH");
    setTransactionRef("");
    setError(null);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvoice || !patient) return;

    setError(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid payment amount greater than 0.");
      return;
    }

    try {
      setLoading(true);
      await recordPaymentApi(selectedInvoice.id, {
        invoiceId: selectedInvoice.id,
        amount: parsedAmount,
        paymentMethod,
        transactionRef: transactionRef.trim() || null,
        receivedById,
      });

      setSuccessMsg("Payment recorded successfully!");
      setIsPaymentModalOpen(false);

      // Refresh invoices list
      const refreshedInvoices = await getInvoicesByMrnApi(patient.mrn);
      setInvoicesList(refreshedInvoices);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to process payment against invoice.",
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
    <AppLayout pageTitle="Billing & Payment Processing">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="page-actions mb-4">
          <h1 className="text-xl font-bold text-slate-900">
            Billing & Patient Balances by MRN
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
            style={{ flex: 1 }}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search Invoices"}
          </button>
        </form>

        {error && !isPaymentModalOpen && (
          <div className="alert-danger mb-4">{error}</div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {/* Patient Profile Card */}
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
                <span className="text-muted">Total Invoices:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {invoicesList.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Invoices List Table */}
        {patient && invoicesList.length > 0 && (
          <div className="table-card">
            <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
              Outstanding Invoices & Balances
            </h3>
            <table className="emr-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoicesList.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === "PAID"
                            ? "badge-success"
                            : inv.status === "PARTIALLY_PAID"
                              ? "badge-warning"
                              : "badge-in-progress"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td>${inv.totalAmount.toFixed(2)}</td>
                    <td className="text-green-600 font-medium">
                      ${inv.paidAmount.toFixed(2)}
                    </td>
                    <td className="font-bold text-red-600">
                      ${inv.balanceDue.toFixed(2)}
                    </td>
                    <td className="text-right space-x-2">
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="btn-primary"
                          style={{ fontSize: 12, padding: "4px 10px" }}
                        >
                          Process Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Processing Payment */}
        {isPaymentModalOpen && selectedInvoice && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  Record Payment for #{selectedInvoice.invoiceNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
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

              <form
                onSubmit={handlePaymentSubmit}
                className="auth-form space-y-4"
              >
                <div className="form-group">
                  <label className="form-label">
                    Payment Amount (Max: $
                    {selectedInvoice.balanceDue.toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedInvoice.balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as
                          | "CASH"
                          | "MOBILE_MONEY"
                          | "CREDIT_CARD"
                          | "BANK_TRANSFER"
                          | "INSURANCE",
                      )
                    }
                    className="form-input"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="INSURANCE">Insurance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Transaction Reference / Receipt Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="form-input"
                    placeholder="e.g., TXN-987654321"
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
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
                    {loading ? "Processing..." : "Confirm Payment"}
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
