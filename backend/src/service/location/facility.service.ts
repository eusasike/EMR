import { Facility } from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  CreateFacilityDTO,
  UpdateFacilityDTO,
} from "../../models/location/facility.model";

const CACHE_TTL_SECONDS = 86400; // 24 Hours

export class FacilityService {
  /**
   * Find a facility by unique facility code (Redis Cached).
   */
  async getFacilityByCode(code: string): Promise<Facility | null> {
    const sanitizedCode = code.trim().toUpperCase();
    const cacheKey = `facilities:code:${sanitizedCode}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
    }

    const facility = await prisma.facility.findFirst({
      where: {
        code: { equals: sanitizedCode, mode: "insensitive" },
      },
    });

    if (facility) {
      await redisClient
        .set(cacheKey, JSON.stringify(facility), "EX", CACHE_TTL_SECONDS)
        .catch(() => {});
    }

    return facility;
  }

  /**
   * Search facilities by name (Redis Cached).
   */
  async searchFacilitiesByName(name: string): Promise<Facility[]> {
    const sanitizedName = name.trim().toLowerCase();
    const cacheKey = `facilities:search:name:${sanitizedName}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
    }

    const facilities = await prisma.facility.findMany({
      where: {
        name: { contains: name.trim(), mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    if (facilities.length > 0) {
      await redisClient
        .set(cacheKey, JSON.stringify(facilities), "EX", CACHE_TTL_SECONDS)
        .catch(() => {});
    }

    return facilities;
  }

  // =========================================================================
  // ADMINISTRATIVE MUTATIONS & CACHE INVALIDATION
  // =========================================================================

  /**
   * Create facility and purge name search caches.
   */
  async createFacility(data: CreateFacilityDTO): Promise<Facility> {
    const facility = await prisma.facility.create({
      data,
    });

    await this.invalidateFacilityCache(facility.code);
    return facility;
  }

  /**
   * Update facility and invalidate corresponding code and name search keys.
   */
  async updateFacility(id: string, data: UpdateFacilityDTO): Promise<Facility> {
    // Fetch existing facility to handle code changes properly
    const existingFacility = await prisma.facility.findUnique({
      where: { id },
      select: { code: true },
    });

    const updatedFacility = await prisma.facility.update({
      where: { id },
      data,
    });

    // Invalidate old code key if changed, as well as updated code key
    const codesToInvalidate = [updatedFacility.code];
    if (existingFacility && existingFacility.code !== updatedFacility.code) {
      codesToInvalidate.push(existingFacility.code);
    }

    await this.invalidateFacilityCache(codesToInvalidate);
    return updatedFacility;
  }

  /**
   * Delete facility and purge all associated cache entries.
   */
  async deleteFacility(id: string): Promise<void> {
    const facility = await prisma.facility.delete({
      where: { id },
    });

    await this.invalidateFacilityCache(facility.code);
  }

  /**
   * Invalidates specific facility code keys and name search pattern caches.
   */
  private async invalidateFacilityCache(
    codes?: string | string[],
  ): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      if (codes) {
        const codeArray = Array.isArray(codes) ? codes : [codes];
        codeArray.forEach((c) => {
          keysToDelete.push(`facilities:code:${c.trim().toUpperCase()}`);
        });
      }

      // Find and invalidate all dynamic name search cache keys using SCAN
      let cursor = "0";
      do {
        const [nextCursor, foundKeys] = await redisClient.scan(
          cursor,
          "MATCH",
          "facilities:search:name:*",
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (foundKeys.length > 0) {
          keysToDelete.push(...foundKeys);
        }
      } while (cursor !== "0");

      if (keysToDelete.length > 0) {
        // Remove duplicate keys before deletion
        const uniqueKeys = Array.from(new Set(keysToDelete));
        await redisClient.del(uniqueKeys);
      }
    } catch (error: any) {
      console.error(
        `⚠️ [Redis Error] Facility cache invalidation failed: ${error.message}`,
      );
    }
  }
}
