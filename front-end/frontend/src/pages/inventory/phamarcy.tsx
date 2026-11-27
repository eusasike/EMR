// pages/pharmacy/PharmacyManagementPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  type Product,
  type PharmacyBatch,
  getPharmacyProductsApi,
  createPharmacyProductApi,
  updatePharmacyProductApi,
  createPharmacyBatchApi,
  updatePharmacyBatchApi,
  type ProductCategory,
  PRODUCT_CATEGORIES,
} from "../../api/inventory/phamarcy";
import axios from "axios";

export const PharmacyManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin Modals & Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] =
    useState<boolean>(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] =
    useState<boolean>(false);

  const [productName, setProductName] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");
  const [productDesc, setProductDesc] = useState<string>("");
  const [productCategory, setProductCategory] =
    useState<ProductCategory>("PILLS");
  const [unitPrice, setUnitPrice] = useState<string | "">("");
  const [reorderLevel, setReorderLevel] = useState<string | number>("10");

  // Edit Product State
  const [editingProductId, setEditingProductId] = useState<string>("");
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductCode, setEditProductCode] = useState<string>("");
  const [editProductDesc, setEditProductDesc] = useState<string>("");
  const [editProductCategory, setEditProductCategory] =
    useState<ProductCategory>("PILLS");
  const [editUnitPrice, setEditUnitPrice] = useState<string | "">("");
  const [editReorderLevel, setEditReorderLevel] = useState<string | number>(
    "10",
  );

  // Add Batch State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [batchQty, setBatchQty] = useState<string | "">("");
  const [costPrice, setCostPrice] = useState<string | "">("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  // Edit Batch State
  const [editingBatchId, setEditingBatchId] = useState<string>("");
  const [editingBatchProductName, setEditingBatchProductName] =
    useState<string>("");
  const [editBatchNumber, setEditBatchNumber] = useState<string>("");
  const [editBatchQty, setEditBatchQty] = useState<string | "">("");
  const [editBatchExpiryDate, setEditBatchExpiryDate] = useState<string>("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getPharmacyProductsApi();
      setProducts(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.message ||
            "Failed to load pharmacy product catalog.",
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load pharmacy product catalog.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadProducts();
    }
  }, [loadProducts]);

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const facilityId = localStorage.getItem("facilityId");
    if (!facilityId) {
      setErrorMsg(
        "Active facility context missing from local storage. Please re-select your facility.",
      );
      return;
    }

    try {
      setLoading(true);
      await createPharmacyProductApi({
        name: productName,
        code: productCode || undefined,
        description: productDesc || undefined,
        category: productCategory,
        unitPrice: Number(unitPrice),
        reorderLevel: Number(reorderLevel),
      });
      setSuccessMsg("Product registered successfully.");
      setIsProductModalOpen(false);
      setProductName("");
      setProductCode("");
      setProductDesc("");
      setUnitPrice("");
      loadProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.message || "Failed to register product.",
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to register product.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setEditProductName(product.name);
    setEditProductCode(product.code || "");
    setEditProductDesc(product.description || "");
    setEditProductCategory((product.category as ProductCategory) || "PILLS");
    setEditUnitPrice(String(product.unitPrice));
    setEditReorderLevel(String(product.reorderLevel));
    setErrorMsg(null);
    setIsEditProductModalOpen(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const facilityId = localStorage.getItem("facilityId");
    if (!facilityId) {
      setErrorMsg(
        "Active facility context missing from local storage. Please re-select your facility.",
      );
      return;
    }

    try {
      setLoading(true);
      await updatePharmacyProductApi(editingProductId, {
        name: editProductName,
        code: editProductCode || undefined,
        description: editProductDesc || undefined,
        category: editProductCategory,
        unitPrice: Number(editUnitPrice),
        reorderLevel: Number(editReorderLevel),
      });
      setSuccessMsg("Product updated successfully.");
      setIsEditProductModalOpen(false);
      loadProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Failed to update product.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update product.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const facilityId = localStorage.getItem("facilityId");
    if (!facilityId) {
      setErrorMsg(
        "Active facility context missing from local storage. Please re-select your facility.",
      );
      return;
    }

    try {
      setLoading(true);
      await createPharmacyBatchApi({
        productId: selectedProductId,
        batchNumber,
        quantity: Number(batchQty),
        costPrice: costPrice !== "" ? Number(costPrice) : undefined,
        expiryDate: new Date(expiryDate).toISOString(),
      });
      setSuccessMsg("Stock batch added successfully.");
      setIsBatchModalOpen(false);
      setSelectedProductId("");
      setBatchNumber("");
      setBatchQty("");
      setCostPrice("");
      setExpiryDate("");
      loadProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.message || "Failed to add stock batch.",
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to add stock batch.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Edit Batch ----------------
  const handleOpenEditBatchModal = (
    batch: PharmacyBatch,
    productName: string,
  ) => {
    setEditingBatchId(batch.id);
    setEditingBatchProductName(productName);
    setEditBatchNumber(batch.batchNumber);
    setEditBatchQty(String(batch.quantity));
    setEditBatchExpiryDate(
      batch.expiryDate ? batch.expiryDate.split("T")[0] : "",
    );
    setErrorMsg(null);
    setIsEditBatchModalOpen(true);
  };

  const handleUpdateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const facilityId = localStorage.getItem("facilityId");
    if (!facilityId) {
      setErrorMsg(
        "Active facility context missing from local storage. Please re-select your facility.",
      );
      return;
    }

    try {
      setLoading(true);
      await updatePharmacyBatchApi(editingBatchId, {
        batchNumber: editBatchNumber,
        quantity: Number(editBatchQty),
        expiryDate: new Date(editBatchExpiryDate).toISOString(),
      });
      setSuccessMsg("Stock batch updated successfully.");
      setIsEditBatchModalOpen(false);
      setEditingBatchId("");
      loadProducts();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.message || "Failed to update stock batch.",
        );
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update stock batch.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Pharmacy Administration & Inventory">
      <div className="p-6 max-w-6xl mx-auto">
        <div
          className="page-actions"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 className="text-xl font-bold text-slate-900">
            Pharmacy Admin Operations & Catalog
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setIsProductModalOpen(true);
              }}
              className="btn-primary"
              style={{ width: "auto" }}
            >
              + New Product
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setIsBatchModalOpen(true);
              }}
              className="btn-primary"
              style={{ width: "auto", backgroundColor: "#1e293b" }}
            >
              + Add Stock Batch
            </button>
          </div>
        </div>

        {errorMsg &&
          !isProductModalOpen &&
          !isEditProductModalOpen &&
          !isBatchModalOpen &&
          !isEditBatchModalOpen && (
            <div
              className="alert-danger mb-4"
              style={{ color: "#ef4444", marginBottom: "15px" }}
            >
              {errorMsg}
            </div>
          )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        <div className="table-card">
          <h3 className="text-md font-semibold text-slate-800 p-4 border-b border-slate-100">
            Registered Pharmacy Products & Batches
          </h3>
          <table className="emr-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock Status</th>
                <th>Active Batches</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    Loading pharmacy catalog...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const totalQty =
                    p.batches?.reduce((acc, b) => acc + b.quantity, 0) || 0;
                  const isLow = totalQty <= p.reorderLevel;

                  return (
                    <tr key={p.id}>
                      <td className="font-medium text-slate-900">
                        <strong>{p.name}</strong>
                        {p.code && (
                          <span
                            className="code-badge block mt-1"
                            style={{
                              display: "inline-block",
                              marginTop: "4px",
                            }}
                          >
                            Code: {p.code}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="code-badge">{p.category}</span>
                      </td>
                      <td>${Number(p.unitPrice).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            isLow ? "badge-warning" : "badge-success"
                          }`}
                        >
                          {totalQty} (Min: {p.reorderLevel})
                          {isLow && <span className="ml-1 font-bold">LOW</span>}
                        </span>
                      </td>
                      <td>
                        <div
                          className="space-y-1 text-xs"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {p.batches && p.batches.length > 0 ? (
                            p.batches.map((b) => (
                              <div
                                key={b.id}
                                className="bg-slate-50 p-1.5 rounded border border-slate-200 flex justify-between gap-4"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "12px",
                                  background: "#f8fafc",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <span>
                                  Batch: <strong>{b.batchNumber}</strong>
                                </span>
                                <span>
                                  Qty: <strong>{b.quantity}</strong>
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ color: "#64748b" }}
                                >
                                  Exp:{" "}
                                  {new Date(b.expiryDate).toLocaleDateString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditBatchModal(b, p.name)
                                  }
                                  className="btn-logout"
                                  style={{ fontSize: 11, padding: "2px 6px" }}
                                >
                                  Edit Batch
                                </button>
                              </div>
                            ))
                          ) : (
                            <span
                              className="text-muted"
                              style={{ color: "#64748b" }}
                            >
                              No active batches
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="btn-logout"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Product Modal */}
        {isProductModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>New Pharmacy Product</h3>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateProductSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Code</label>
                  <input
                    type="text"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) =>
                      setProductCategory(e.target.value as ProductCategory)
                    }
                    className="form-input"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reorder Level Threshold</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
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
                    {loading ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditProductModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Edit Pharmacy Product</h3>
                <button
                  type="button"
                  onClick={() => setIsEditProductModalOpen(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProductSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Code</label>
                  <input
                    type="text"
                    value={editProductCode}
                    onChange={(e) => setEditProductCode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editProductCategory}
                    onChange={(e) =>
                      setEditProductCategory(e.target.value as ProductCategory)
                    }
                    className="form-input"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reorder Level Threshold</label>
                  <input
                    type="number"
                    value={editReorderLevel}
                    onChange={(e) => setEditReorderLevel(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsEditProductModalOpen(false)}
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
                    {loading ? "Updating..." : "Update Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batch Modal */}
        {isBatchModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Add Stock Batch</h3>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateBatchSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Batch Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={batchQty}
                    onChange={(e) => setBatchQty(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
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
                    {loading ? "Saving..." : "Save Batch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Batch Modal */}
        {isEditBatchModalOpen && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Edit Stock Batch</h3>
                <button
                  type="button"
                  onClick={() => setIsEditBatchModalOpen(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateBatchSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Product</label>
                  <input
                    type="text"
                    value={editingBatchProductName}
                    className="form-input"
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch Number</label>
                  <input
                    type="text"
                    value={editBatchNumber}
                    onChange={(e) => setEditBatchNumber(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editBatchQty}
                    onChange={(e) => setEditBatchQty(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={editBatchExpiryDate}
                    onChange={(e) => setEditBatchExpiryDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsEditBatchModalOpen(false)}
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
                    {loading ? "Updating..." : "Update Batch"}
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
