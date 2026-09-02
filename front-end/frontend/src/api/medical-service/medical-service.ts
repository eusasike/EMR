// api/medical-service/medical-service.ts
import { api } from "./../axiosClient";

export interface MedicalService {
  id: string;
  facilityId: string;
  name: string;
  category: string;
  price: number | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalServiceDTO {
  name: string;
  category: string;
  price: number;
  isActive?: boolean;
}

export type UpdateMedicalServiceDTO = Partial<CreateMedicalServiceDTO>;

export interface ProvidedService {
  id: string;
  visitId: string;
  serviceId: string;
  unitPrice: number | string;
  notes?: string;
  providedById: string;
  createdAt?: string;
  service?: MedicalService;
  visit?: {
    id: string;
    createdAt: string;
  };
}

export interface ProvideServiceDTO {
  visitId: string;
  serviceId: string;
  notes?: string;
}

export type UpdateProvidedServiceDTO = Partial<ProvideServiceDTO>;

export interface MedicalServiceListResponse {
  success?: boolean;
  data: MedicalService[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProvidedServiceListResponse {
  success?: boolean;
  data: ProvidedService[];
}

export interface ProvidedServiceItem {
  id: string;
  serviceId?: string;
  unitPrice: number;
  notes?: string;
  service?: {
    id?: string;
    name: string;
    category: string;
  };
}
export interface VitalSignsResponse {
  id?: string;
  weight?: number;
}
// export interface Visit {
//   id: string;
//   visitDate?: string;
//   status?: string;
//   services?: ProvidedServiceItem[];
// }
export interface Visit {
  id: string;
  mrn: string;
  status: string;
  services?: ProvidedServiceItem[];
  vitalSigns?: VitalSignsResponse;
  prescriptions?: Array<{
    id: string;
    notes?: string;
    status?: string;
    items?: Array<{
      id?: string;
      productId: string;
      productName?: string;
      product?: { name: string };
      quantity: number;
      unitPrice: number;
      dosage?: string;
      duration?: string;
    }>;
  }>;
}
export interface PrescriptionItemResponse {
  id: string;
  productId: string;
  quantityOrdered: number;
  unitPrice: number | string;
  dosage: string;
  durationDays?: number;
  product?: {
    id: string;
    name: string;
    sellingPrice?: number | string;
  };
}

export interface PrescriptionResponse {
  id: string;
  prescriptionNumber: string;
  facilityId: string;
  visitId: string;
  status: string;
  notes?: string;
  createdAt: string;
  items: PrescriptionItemResponse[];
}

export const getFacilityIdFromStorage = (): string => {
  const direct = localStorage.getItem("facilityId");
  if (direct) return direct;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed?.facilityId) return parsed.facilityId;
      if (Array.isArray(parsed?.facilityIds) && parsed.facilityIds.length > 0) {
        return parsed.facilityIds[0];
      }
    } catch {
      /* ignore */
    }
  }
  return "";
};

// 1. Get medical services (optionally filtered by category or search term)
export const getMedicalServicesApi = async (query?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<MedicalService[]> => {
  const params = new URLSearchParams();
  if (query?.category) params.append("category", query.category);
  if (query?.search) params.append("search", query.search);
  if (query?.page) params.append("page", query.page.toString());
  if (query?.limit) params.append("limit", query.limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/medical-services?${queryString}`
    : "/medical-services";

  const response = await api.get<MedicalServiceListResponse | MedicalService[]>(
    url,
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || [];
};

// 2. Create medical service
export const createMedicalServiceApi = async (
  data: CreateMedicalServiceDTO,
) => {
  if (data.price <= 0) {
    throw new Error("Price must be a positive number.");
  }
  const facilityId = getFacilityIdFromStorage();

  const response = await api.post("/medical-services", data, {
    headers: {
      "x-facility-id": facilityId,
    },
  });
  return response.data.data || response.data;
};

// 3. Update an existing medical service (Admin)
export const updateMedicalServiceApi = async (
  id: string,
  data: UpdateMedicalServiceDTO,
): Promise<MedicalService> => {
  const facilityId = getFacilityIdFromStorage();
  const response = await api.put(`/medical-services/${id}`, data, {
    headers: {
      "x-facility-id": facilityId,
    },
  });

  return response.data.data || response.data;
};

// 4. Record a medical service provided to a patient visit (Doctor)
export const provideServiceApi = async (
  data: ProvideServiceDTO,
): Promise<ProvidedService> => {
  const facilityId = getFacilityIdFromStorage();
  const response = await api.post("/medical-services/provide", data, {
    headers: {
      "x-facility-id": facilityId,
    },
  });
  return response.data.data || response.data;
};

// 5. Update an existing provided service item (Doctor)
export const updateProvidedServiceApi = async (
  id: string,
  data: UpdateProvidedServiceDTO,
): Promise<ProvidedService> => {
  const facilityId = getFacilityIdFromStorage();
  const response = await api.put(`/medical-services/provide/${id}`, data, {
    headers: {
      "x-facility-id": facilityId,
    },
  });
  return response.data.data || response.data;
};

// 6. Get provided services for a patient by MRN
export const getProvidedServicesByMrnApi = async (
  mrn: string,
): Promise<ProvidedService[]> => {
  const response = await api.get<
    ProvidedServiceListResponse | ProvidedService[]
  >(`/medical-services/patient/mrn/${mrn}`);

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || [];
};

// 7. Get the latest active visit and its provided services by MRN
export const getLatestVisitByMrnApi = async (mrn: string) => {
  const response = await api.get(`/medical-services/visit/latest/mrn/${mrn}`);
  return response.data.data || response.data;
};
export interface CreatePrescriptionDTO {
  visitId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    dosage?: string;
    duration?: string;
  }[];
}

// Add this function to your frontend API file
export const createPrescriptionApi = async (
  data: CreatePrescriptionDTO,
): Promise<PrescriptionResponse> => {
  const facilityId = getFacilityIdFromStorage();
  const response = await api.post("/medical-services/prescriptions", data, {
    headers: {
      "x-facility-id": facilityId,
    },
  });
  return response.data.data || response.data;
};
