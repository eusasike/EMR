"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDashboardService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FacilityDashboardService {
    async getFacilityDashboard(facilityId) {
        const [activeVisitsCount, globalPendingLabsCount, stockSummary, recentVisits,] = await Promise.all([
            prisma.patientVisit.count({
                where: {
                    facilityId,
                    status: "IN_PROGRESS",
                },
            }),
            prisma.labResult.count({
                where: {
                    visit: { facilityId },
                    status: { not: "VERIFIED" },
                },
            }),
            prisma.product.findMany({
                where: { facilityId },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    batches: {
                        select: {
                            quantity: true,
                        },
                    },
                },
            }),
            prisma.patientVisit.findMany({
                where: { facilityId, status: "IN_PROGRESS" },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    patient: {
                        select: {
                            id: true,
                            mrn: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    attending: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
        ]);
        const formattedStock = stockSummary.map((p) => {
            const totalStock = p.batches.reduce((sum, b) => sum + b.quantity, 0);
            return {
                id: p.id,
                name: p.name,
                code: p.code || "—",
                totalStock,
            };
        });
        return {
            facilityId,
            activeVisitsCount,
            globalPendingLabsCount,
            stockSummary: formattedStock,
            recentVisits,
        };
    }
}
exports.FacilityDashboardService = FacilityDashboardService;
