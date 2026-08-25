import { api } from "../axiosClient";

export interface Region {
  id: string;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  id: string;
  name: string;
  regionId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch region by name or list
export const getRegionByNameApi = async (name: string): Promise<Region> => {
  const response = await api.get<Region>(`/admin/locations/regions/search`, {
    params: { name },
  });
  return response.data;
};

// Fetch district by name (and optional regionId)
export const getDistrictByNameApi = async (
  name: string,
  regionId?: string,
): Promise<District> => {
  const response = await api.get<District>(
    `/admin/locations/districts/search`,
    {
      params: { name, regionId },
    },
  );
  return response.data;
};
