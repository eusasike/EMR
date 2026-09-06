"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const REGIONS_CACHE_KEY = "locations:regions:all";
const CACHE_TTL_SECONDS = 86400; // 24 Hours
class LocationService {
    /**
     * Fetch all regions (Redis Cached)
     */
    async getRegions() {
        try {
            const cachedRegions = await redis_1.redisClient.get(REGIONS_CACHE_KEY);
            if (cachedRegions) {
                return JSON.parse(cachedRegions);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing regions cache: ${error.message}`);
        }
        const regions = await database_1.prisma.region.findMany({
            orderBy: { name: "asc" },
        });
        if (regions.length > 0) {
            await redis_1.redisClient
                .set(REGIONS_CACHE_KEY, JSON.stringify(regions), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return regions;
    }
    /**
     * Fetch districts for a region (Redis Cached)
     */
    async getDistrictsByRegion(regionId) {
        const cacheKey = `locations:region:${regionId}:districts`;
        try {
            const cachedDistricts = await redis_1.redisClient.get(cacheKey);
            if (cachedDistricts) {
                return JSON.parse(cachedDistricts);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing districts cache: ${error.message}`);
        }
        const districts = await database_1.prisma.district.findMany({
            where: { regionId },
            orderBy: { name: "asc" },
        });
        if (districts.length > 0) {
            await redis_1.redisClient
                .set(cacheKey, JSON.stringify(districts), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return districts;
    }
    // =========================================================================
    // ADMINISTRATIVE WRITE OPERATIONS & CACHE INVALIDATION
    // =========================================================================
    /**
     * Create a new region and invalidate the global regions list cache.
     */
    async createRegion(data) {
        const region = await database_1.prisma.region.create({
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
    async updateRegion(id, data) {
        const region = await database_1.prisma.region.update({
            where: { id },
            data,
        });
        await this.invalidateLocationCache();
        return region;
    }
    /**
     * Delete a region and invalidate both global regions and child districts cache.
     */
    async deleteRegion(id) {
        await database_1.prisma.region.delete({
            where: { id },
        });
        await this.invalidateLocationCache(id);
    }
    /**
     * Create a district and purge the specific parent region's districts cache.
     */
    async createDistrict(regionId, data) {
        const district = await database_1.prisma.district.create({
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
    async updateDistrict(id, data) {
        const district = await database_1.prisma.district.update({
            where: { id },
            data,
        });
        await this.invalidateLocationCache(district.regionId);
        return district;
    }
    /**
     * Delete a district and purge its parent region's district cache.
     */
    async deleteDistrict(id) {
        const district = await database_1.prisma.district.delete({
            where: { id },
        });
        await this.invalidateLocationCache(district.regionId);
    }
    /**
     * Targeted Cache Invalidation
     * @param regionId Optional regionId to invalidate specific district list
     */
    async invalidateLocationCache(regionId) {
        try {
            const keysToInvalidate = [REGIONS_CACHE_KEY];
            if (regionId) {
                keysToInvalidate.push(`locations:region:${regionId}:districts`);
            }
            await redis_1.redisClient.del(keysToInvalidate);
        }
        catch (error) {
            console.error(`⚠️ [Redis Error] Location cache invalidation failed: ${error.message}`);
        }
    }
    /**
     * Fetch a Region by exact or case-insensitive name to retrieve its ID.
     */
    async getRegionByName(name) {
        const sanitizedName = name.trim().toLowerCase();
        const cacheKey = `locations:region:name:${sanitizedName}`;
        try {
            const cached = await redis_1.redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
        }
        const region = await database_1.prisma.region.findFirst({
            where: {
                name: { equals: name.trim(), mode: "insensitive" },
            },
        });
        if (region) {
            await redis_1.redisClient
                .set(cacheKey, JSON.stringify(region), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return region;
    }
    /**
     * Fetch a District by name (optionally constrained by regionId) to retrieve its ID.
     */
    async getDistrictByName(name, regionId) {
        const sanitizedName = name.trim().toLowerCase();
        const cacheKey = regionId
            ? `locations:district:region:${regionId}:name:${sanitizedName}`
            : `locations:district:name:${sanitizedName}`;
        try {
            const cached = await redis_1.redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
        }
        const district = await database_1.prisma.district.findFirst({
            where: {
                name: { equals: name.trim(), mode: "insensitive" },
                ...(regionId ? { regionId } : {}),
            },
        });
        if (district) {
            await redis_1.redisClient
                .set(cacheKey, JSON.stringify(district), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return district;
    }
}
exports.LocationService = LocationService;
