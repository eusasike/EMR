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

// Fetch all regions (for the Region dropdown)
export const getRegionsApi = async (): Promise<Region[]> => {
  const response = await api.get<Region[]>(`/admin/locations/regions`);
  return response.data;
};

// Fetch all districts belonging to a region (for the District dropdown)
export const getDistrictsByRegionApi = async (
  regionId: string,
): Promise<District[]> => {
  const response = await api.get<District[]>(`/admin/locations/districts`, {
    params: { regionId },
  });
  return response.data;
};

// Fetch region by name
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
