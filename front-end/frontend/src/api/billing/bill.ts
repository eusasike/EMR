import { api } from "../axiosClient";

export type ChargeType =
  | "MEDICAL_SERVICE"
  | "PHARMACY_ITEM"
  | "LAB"
  | "RADIOLOGY"
  | "OTHER";
export type PaymentMethod =
  | "CASH"
  | "MOBILE_MONEY"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "INSURANCE";
export type InvoiceStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type InvoiceType = "FINAL" | "PROVISIONAL";

export interface CreateInvoiceItemDTO {
  chargeType: ChargeType;
  referenceId?: string | null;
  description: string;
  quantity?: number;
  unitPrice: number;
}

export interface CreateInvoiceDTO {
  visitId: string;
  notes?: string | null;
  items?: CreateInvoiceItemDTO[];
}

export interface CreatePaymentDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string | null;
  receivedById: string;
}

export interface InvoiceItemResponseDTO {
  id: string;
  invoiceId: string;
  chargeType: ChargeType;
  referenceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponseDTO {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string | null;
  receivedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceResponseDTO {
  id: string;
  facilityId: string;
  visitId: string | null;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  type: InvoiceType;
  notes?: string | null;
  items?: InvoiceItemResponseDTO[];
  payments?: PaymentResponseDTO[];
  createdAt: string;
  updatedAt: string;
}

interface WrappedResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

type ApiResponse<T> = T | WrappedResponse<T>;

const unwrapResponse = <T>(responsePayload: ApiResponse<T>): T => {
  if (
    responsePayload &&
    typeof responsePayload === "object" &&
    "data" in responsePayload
  ) {
    return (responsePayload as WrappedResponse<T>).data;
  }
  return responsePayload as T;
};

// 1. Create a new itemized invoice (Services, Pharmacy items, etc.)
export const createInvoiceApi = async (
  data: CreateInvoiceDTO,
): Promise<InvoiceResponseDTO> => {
  const response = await api.post<ApiResponse<InvoiceResponseDTO>>(
    "/invoices",
    data,
  );
  return unwrapResponse(response.data);
};

// 2. Fetch invoice details by ID, including line items and payment history
export const getInvoiceByIdApi = async (
  invoiceId: string,
): Promise<InvoiceResponseDTO> => {
  const response = await api.get<ApiResponse<InvoiceResponseDTO>>(
    `/invoices/${invoiceId}`,
  );
  return unwrapResponse(response.data);
};

// 3. Process a payment against an outstanding invoice
export const recordPaymentApi = async (
  invoiceId: string,
  data: CreatePaymentDTO,
): Promise<InvoiceResponseDTO> => {
  const response = await api.post<ApiResponse<InvoiceResponseDTO>>(
    `/invoices/${invoiceId}/payments`,
    data,
  );
  return unwrapResponse(response.data);
};

export const getInvoicesByMrnApi = async (
  mrn: string,
): Promise<InvoiceResponseDTO[]> => {
  const response = await api.get<ApiResponse<InvoiceResponseDTO[]>>(
    `/invoices/patient/mrn/${mrn}`,
  );
  return unwrapResponse(response.data);
};
