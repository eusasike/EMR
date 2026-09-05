// api/dashboard/dashboard.api.ts
import { api } from "../axiosClient";

export interface StockSummaryItem {
  id: string;
  name: string;
  code: string;
  totalStock: number;
}

export interface FacilityDashboardData {
  facilityId: string;
  activeVisitsCount: number;
  globalPendingLabsCount: number;
  stockSummary: StockSummaryItem[];
  recentVisits: Array<{
    id: string;
    createdAt: string;
    status: string;
    symptoms?: string;
    patient: {
      id: string;
      mrn: string;
      firstName: string;
      lastName: string;
    };
    attending?: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export const getFacilityDashboardApi =
  async (): Promise<FacilityDashboardData> => {
    const response = await api.get<
      { data: FacilityDashboardData } | FacilityDashboardData
    >("/dashboard/overview");
    return "data" in response.data ? response.data.data : response.data;
  };
