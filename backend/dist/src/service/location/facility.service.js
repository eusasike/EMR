"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityService = void 0;
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const CACHE_TTL_SECONDS = 86400; // 24 Hours
class FacilityService {
    /**
     * Find a facility by unique facility code (Redis Cached).
     */
    async getFacilityByCode(code) {
        const sanitizedCode = code.trim().toUpperCase();
        const cacheKey = `facilities:code:${sanitizedCode}`;
        try {
            const cached = await redis_1.redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
        }
        const facility = await database_1.prisma.facility.findFirst({
            where: {
                code: { equals: sanitizedCode, mode: "insensitive" },
            },
        });
        if (facility) {
            await redis_1.redisClient
                .set(cacheKey, JSON.stringify(facility), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return facility;
    }
    /**
     * Search facilities by name (Redis Cached).
     */
    async searchFacilitiesByName(name) {
        const sanitizedName = name.trim().toLowerCase();
        const cacheKey = `facilities:search:name:${sanitizedName}`;
        try {
            const cached = await redis_1.redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.warn(`⚠️ [Redis Warn] Bypassing cache: ${error.message}`);
        }
        const facilities = await database_1.prisma.facility.findMany({
            where: {
                name: { contains: name.trim(), mode: "insensitive" },
            },
            orderBy: { name: "asc" },
            take: 20,
        });
        if (facilities.length > 0) {
            await redis_1.redisClient
                .set(cacheKey, JSON.stringify(facilities), "EX", CACHE_TTL_SECONDS)
                .catch(() => { });
        }
        return facilities;
    }
    // =========================================================================
    // ADMINISTRATIVE MUTATIONS & CACHE INVALIDATION
    // =========================================================================
    /**
     * Create facility and purge name search caches.
     */
    async createFacility(data) {
        const facility = await database_1.prisma.facility.create({
            data,
        });
        await this.invalidateFacilityCache(facility.code);
        return facility;
    }
    /**
     * Update facility and invalidate corresponding code and name search keys.
     */
    async updateFacility(id, data) {
        // Fetch existing facility to handle code changes properly
        const existingFacility = await database_1.prisma.facility.findUnique({
            where: { id },
            select: { code: true },
        });
        const updatedFacility = await database_1.prisma.facility.update({
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
    async deleteFacility(id) {
        const facility = await database_1.prisma.facility.delete({
            where: { id },
        });
        await this.invalidateFacilityCache(facility.code);
    }
    /**
     * Invalidates specific facility code keys and name search pattern caches.
     */
    async invalidateFacilityCache(codes) {
        try {
            const keysToDelete = [];
            if (codes) {
                const codeArray = Array.isArray(codes) ? codes : [codes];
                codeArray.forEach((c) => {
                    keysToDelete.push(`facilities:code:${c.trim().toUpperCase()}`);
                });
            }
            // Find and invalidate all dynamic name search cache keys using SCAN
            let cursor = "0";
            do {
                const [nextCursor, foundKeys] = await redis_1.redisClient.scan(cursor, "MATCH", "facilities:search:name:*", "COUNT", 100);
                cursor = nextCursor;
                if (foundKeys.length > 0) {
                    keysToDelete.push(...foundKeys);
                }
            } while (cursor !== "0");
            if (keysToDelete.length > 0) {
                // Remove duplicate keys before deletion
                const uniqueKeys = Array.from(new Set(keysToDelete));
                await redis_1.redisClient.del(uniqueKeys);
            }
        }
        catch (error) {
            console.error(`⚠️ [Redis Error] Facility cache invalidation failed: ${error.message}`);
        }
    }
}
exports.FacilityService = FacilityService;
