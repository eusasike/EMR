import { Region, District } from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  CreateRegionDTO,
  UpdateRegionDTO,
  CreateDistrictDTO,
  UpdateDistrictDTO,
} from "../../models/location/location.model";

const REGIONS_CACHE_KEY = "locations:regions:all";
const CACHE_TTL_SECONDS = 86400; // 24 Hours

export class LocationService {
  /**
   * Fetch all regions (Redis Cached)
   */
  async getRegions(): Promise<Region[]> {
    try {
      const cachedRegions = await redisClient.get(REGIONS_CACHE_KEY);
      if (cachedRegions) {
        return JSON.parse(cachedRegions);
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Warn] Bypassing regions cache: ${error.message}`);
    }

    const regions = await prisma.region.findMany({
      orderBy: { name: "asc" },
    });

    if (regions.length > 0) {
      await redisClient
        .set(
          REGIONS_CACHE_KEY,
          JSON.stringify(regions),
          "EX",
          CACHE_TTL_SECONDS,
        )
        .catch(() => {});
    }

    return regions;
  }

  /**
   * Fetch districts for a region (Redis Cached)
   */
  async getDistrictsByRegion(regionId: string): Promise<District[]> {
    const cacheKey = `locations:region:${regionId}:districts`;

    try {
      const cachedDistricts = await redisClient.get(cacheKey);
      if (cachedDistricts) {
        return JSON.parse(cachedDistricts);
      }
    } catch (error: any) {
      console.warn(
        `⚠️ [Redis Warn] Bypassing districts cache: ${error.message}`,
      );
    }

    const districts = await prisma.district.findMany({
      where: { regionId },
      orderBy: { name: "asc" },
    });

    if (districts.length > 0) {
      await redisClient
        .set(cacheKey, JSON.stringify(districts), "EX", CACHE_TTL_SECONDS)
        .catch(() => {});
    }

    return districts;
  }

  // =========================================================================
  // ADMINISTRATIVE WRITE OPERATIONS & CACHE INVALIDATION
  // =========================================================================

  /**
   * Create a new region and invalidate the global regions list cache.
   */
  async createRegion(data: CreateRegionDTO): Promise<Region> {
    const region = await prisma.region.create({
      data: {
        code: data.code,
        name: data.name,
      },
    });

    await this.invalidateLocationCache();
    return region;
  }

  /**
   * Update a region and purge global list cache.
   */
  async updateRegion(id: string, data: UpdateRegionDTO): Promise<Region> {
    const region = await prisma.region.update({
      where: { id },
      data,
    });

    await this.invalidateLocationCache();
    return region;
  }

  /**
   * Delete a region and invalidate both global regions and child districts cache.
   */
  async deleteRegion(id: string): Promise<void> {
    await prisma.region.delete({
      where: { id },
    });

    await this.invalidateLocationCache(id);
  }

  /**
   * Create a district and purge the specific parent region's districts cache.
   */
  async createDistrict(
    regionId: string,
    data: CreateDistrictDTO,
  ): Promise<District> {
    const district = await prisma.district.create({
      data: {
        name: data.name,
        code: data.code,
        regionId,
      },
    });

    await this.invalidateLocationCache(regionId);
    return district;
  }

  /**
   * Update a district and invalidate its parent region cache.
   */
  async updateDistrict(id: string, data: UpdateDistrictDTO): Promise<District> {
    const district = await prisma.district.update({
      where: { id },
      data,
    });

    await this.invalidateLocationCache(district.regionId);
    return district;
  }

  /**
   * Delete a district and purge its parent region's district cache.
   */
  async deleteDistrict(id: string): Promise<void> {
    const district = await prisma.district.delete({
      where: { id },
    });

    await this.invalidateLocationCache(district.regionId);
  }

  /**
   * Targeted Cache Invalidation
   * @param regionId Optional regionId to invalidate specific district list
   */
  private async invalidateLocationCache(regionId?: string): Promise<void> {
    try {
      const keysToInvalidate = [REGIONS_CACHE_KEY];

      if (regionId) {
        keysToInvalidate.push(`locations:region:${regionId}:districts`);
      }

      await redisClient.del(keysToInvalidate);
    } catch (error: any) {
      console.error(
        `⚠️ [Redis Error] Location cache invalidation failed: ${error.message}`,
      );
    }
  }

  /**
   * Fetch a Region by exact or case-insensitive name to retrieve its ID.
   */
  async getRegionByName(name: string): Promise<Region | null> {
    const sanitizedName = name.trim().toLowerCase();
    const cacheKey = `locations:region:name:${sanitizedName}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
    }

    const region = await prisma.region.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
      },
    });

    if (region) {
      await redisClient
        .set(cacheKey, JSON.stringify(region), "EX", CACHE_TTL_SECONDS)
        .catch(() => {});
    }

    return region;
  }

  /**
   * Fetch a District by name (optionally constrained by regionId) to retrieve its ID.
   */
  async getDistrictByName(
    name: string,
    regionId?: string,
  ): Promise<District | null> {
    const sanitizedName = name.trim().toLowerCase();
    const cacheKey = regionId
      ? `locations:district:region:${regionId}:name:${sanitizedName}`
      : `locations:district:name:${sanitizedName}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
    }

    const district = await prisma.district.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        ...(regionId ? { regionId } : {}),
      },
    });

    if (district) {
      await redisClient
        .set(cacheKey, JSON.stringify(district), "EX", CACHE_TTL_SECONDS)
        .catch(() => {});
    }

    return district;
  }
}
