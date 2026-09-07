import { api } from "../axiosClient";
import type {
  InvoiceStatus,
  InvoiceItemResponseDTO,
  PaymentResponseDTO,
} from "../billing/bill";

export interface ServiceItemDTO {
  id: string;
  service?: {
    name: string;
  };
}

export interface LabResultItemDTO {
  id: string;
  providedService?: {
    service?: {
      name: string;
    };
  };
}

export interface DispenseItemDTO {
  id: string;
  quantity: number;
  product?: {
    name: string;
  };
}

export interface DispenseRecordDTO {
  id: string;
  items: DispenseItemDTO[];
}

export interface VisitSummaryDTO {
  id: string;
  patient?: {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
  };
  services?: ServiceItemDTO[];
  labResults?: LabResultItemDTO[];
  dispenseRecord?: DispenseRecordDTO[];
}

export interface DailyReportItemDTO {
  id: string;
  invoiceNumber: string;
  grandTotal: string | number;
  amountPaid: string | number;
  balance: string | number;
  status: InvoiceStatus | string;
  createdAt: string;
  invoiceItems?: InvoiceItemResponseDTO[];
  payments?: PaymentResponseDTO[];
  visit?: VisitSummaryDTO | null;
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

/**
 * Fetch daily billing/revenue report by date (YYYY-MM-DD)
 */
export const getDailyReportApi = async (
  dateStr: string,
): Promise<DailyReportItemDTO[]> => {
  const response = await api.get<ApiResponse<DailyReportItemDTO[]>>(
    `/reports/daily?date=${dateStr}`,
  );
  return unwrapResponse(response.data);
};

// src/api/report/report.ts
export const getDateRangeReportApi = async (
  startDate: string,
  endDate: string,
): Promise<DailyReportItemDTO[]> => {
  const response = await api.get<ApiResponse<DailyReportItemDTO[]>>(
    `/reports/range?startDate=${startDate}&endDate=${endDate}`,
  );
  return unwrapResponse(response.data);
};
