import React, { useState } from "react";
import axios from "axios";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  getDateRangeReportApi,
  type DailyReportItemDTO,
} from "../../api/report/report";

export const DailyRevenueReportPage: React.FC = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [reportData, setReportData] = useState<DailyReportItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleFetchReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSearched(true);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be later than end date.");
      return;
    }

    try {
      setLoading(true);
      const data = await getDateRangeReportApi(startDate, endDate);
      setReportData(data);

      if (data.length === 0) {
        setError("No records found for the selected date range.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to retrieve report data for the given range.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = reportData.reduce((sum, invoice) => {
    const paid = Number(invoice.amountPaid) || 0;
    return sum + paid;
  }, 0);
  //export to Excel function
  const handleExportCsv = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = [
      "Date",
      "Patient Name",
      "MRN",
      "Services",
      "Laboratory",
      "Pharmacy",
      "Status",
      "Amount Paid (Tsh)",
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = reportData.map((invoice) => {
      const patient = invoice.visit?.patient;
      const fullName = patient
        ? `${patient.firstName} ${patient.lastName}`
        : "Walk-in / Unknown";
      const mrnCode = patient?.mrn || "N/A";
      const invoiceDate = new Date(invoice.createdAt).toLocaleDateString();

      const services = invoice.visit?.services
        ? invoice.visit.services
            .map((s) => s.service?.name)
            .filter(Boolean)
            .join(", ")
        : "";

      const labs = invoice.visit?.labResults
        ? invoice.visit.labResults
            .map((l) => l.providedService?.service?.name)
            .filter(Boolean)
            .join(", ")
        : "";

      const medicines = invoice.visit?.dispenseRecord
        ? invoice.visit.dispenseRecord
            .flatMap((d) =>
              d.items.map(
                (i) => `${i.product?.name || "Medicine"} (Qty: ${i.quantity})`,
              ),
            )
            .join(", ")
        : "";

      const amountPaidVal = (Number(invoice.amountPaid) || 0).toFixed(2);

      return [
        invoiceDate,
        fullName,
        mrnCode,
        services,
        labs,
        medicines,
        invoice.status,
        amountPaidVal,
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_log_${startDate || "all"}_to_${endDate || "all"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout pageTitle="Date Range Patient Services & Revenue Report">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="page-actions mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Financial & Service Report
          </h1>
          <p className="text-sm text-muted">
            Select a custom date range to inspect patient services, labs,
            medications, and collections.
          </p>
        </div>

        {/* Date Range Selector Form */}
        <form
          onSubmit={handleFetchReport}
          className="flex flex-wrap gap-3 mb-6 items-end"
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label text-xs font-semibold text-slate-700 mb-1 block">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="search-input form-input"
              style={{ width: "200px" }}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label text-xs font-semibold text-slate-700 mb-1 block">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              max={todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="search-input form-input"
              style={{ width: "200px" }}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Generating..." : "Generate Range Report"}
          </button>
        </form>

        {error && <div className="alert-danger mb-4">{error}</div>}

        {/* Summary Metric Cards */}
        {searched && reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="table-card p-4 bg-white border-l-4 border-l-sky-600">
              <span className="text-xs text-muted uppercase tracking-wider">
                Date Span
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {startDate} to {endDate}
              </div>
            </div>
            <div className="table-card p-4 bg-white border-l-4 border-l-emerald-600">
              <span className="text-xs text-muted uppercase tracking-wider">
                Total Invoices
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {reportData.length}
              </div>
            </div>
            <div className="table-card p-4 bg-white border-l-4 border-l-indigo-600">
              <span className="text-xs text-muted uppercase tracking-wider">
                Total Collected
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                Tsh{" "}
                {grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        )}

        {/* Report Results Table */}
        {searched && reportData.length > 0 && (
          <div className="table-card">
            <div
              className="p-4 border-b border-slate-100"
              style={{ overflow: "hidden" }}
            >
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  float: "right",
                  backgroundColor: "#0f3d06",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "15px",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Export CSV
              </button>
            </div>

            <table className="emr-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Date</th>
                  <th style={{ width: "160px" }}>Patient Name</th>
                  <th style={{ width: "90px" }}>MRN</th>
                  <th>Clinical Services, Labs & Pharmacy Items</th>
                  <th style={{ width: "110px" }}>Status</th>
                  <th className="text-right" style={{ width: "130px" }}>
                    Amount Paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((invoice) => {
                  const patient = invoice.visit?.patient;
                  const fullName = patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "Walk-in / Unknown";
                  const mrnCode = patient?.mrn || "N/A";
                  const invoiceDate = new Date(
                    invoice.createdAt,
                  ).toLocaleDateString();

                  // Categorized lists
                  const services = invoice.visit?.services
                    ? invoice.visit.services
                        .map((s) => s.service?.name)
                        .filter(Boolean)
                    : [];

                  const labs = invoice.visit?.labResults
                    ? invoice.visit.labResults
                        .map((l) => l.providedService?.service?.name)
                        .filter(Boolean)
                    : [];

                  const medicines = invoice.visit?.dispenseRecord
                    ? invoice.visit.dispenseRecord.flatMap((d) =>
                        d.items.map(
                          (i) =>
                            `${i.product?.name || "Medicine"} (Qty: ${i.quantity})`,
                        ),
                      )
                    : [];

                  const amountPaidVal = Number(invoice.amountPaid) || 0;

                  const hasAnyItems =
                    services.length > 0 ||
                    labs.length > 0 ||
                    medicines.length > 0;

                  return (
                    <tr key={invoice.id}>
                      <td className="text-xs text-muted">{invoiceDate}</td>
                      <td className="font-medium text-slate-900">{fullName}</td>
                      <td>
                        <span className="code-badge">{mrnCode}</span>
                      </td>
                      <td>
                        <div className="space-y-1.5 py-1">
                          {hasAnyItems ? (
                            <>
                              {services.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                    <b>Services: </b>
                                  </span>
                                  <span className="text-xs text-slate-800">
                                    {services.join(", ")}
                                  </span>
                                </div>
                              )}

                              {labs.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    <b>Laboratory: </b>
                                  </span>
                                  <span className="text-xs text-amber-900">
                                    {labs.join(", ")}
                                  </span>
                                </div>
                              )}

                              {medicines.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <b>Pharmacy: </b>
                                  </span>
                                  <span className="text-xs text-emerald-900">
                                    {medicines.join(", ")}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-muted text-xs italic">
                              No items specified
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            invoice.status === "PAID"
                              ? "badge-success"
                              : invoice.status === "PARTIALLY_PAID"
                                ? "badge-warning"
                                : "badge-in-progress"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="text-right font-semibold text-slate-900">
                        Tsh{" "}
                        {amountPaidVal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
