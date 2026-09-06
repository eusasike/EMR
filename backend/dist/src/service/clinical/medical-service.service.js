"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalServiceService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const medical_service_publisher_1 = require("../../message/publisher/medical-service.publisher");
const medical_service_model_1 = require("../../models/clinical/medical-service.model");
const custom_error_1 = require("../../util/custom-error");
const invoice_helper_1 = require("../../helper/invoice.helper"); // <-- Import your invoice recalculation helper
const MEDICAL_SERVICE_CACHE_TTL = 3600; // 1 hour TTL
class MedicalServiceService {
    /**
     * [ADMIN]: Creates a new medical service scoped to a facility
     */
    async create(input) {
        const validatedData = medical_service_model_1.createMedicalServiceSchema.parse(input);
        // 1. Verify facility exists
        const facility = await database_1.prisma.facility.findUnique({
            where: { id: validatedData.facilityId },
        });
        if (!facility) {
            throw new custom_error_1.NotFoundError(`FACILITY_NOT_FOUND: ${validatedData.facilityId}`);
        }
        // 2. Verify service uniqueness by name within the specific facility
        const existingService = await database_1.prisma.medicalService.findFirst({
            where: {
                facilityId: validatedData.facilityId,
                name: { equals: validatedData.name, mode: "insensitive" },
            },
        });
        if (existingService) {
            throw new custom_error_1.ConflictError(`MEDICAL_SERVICE_ALREADY_EXISTS_IN_FACILITY: ${validatedData.name}`);
        }
        // 3. Persist to Database
        const newService = await database_1.prisma.medicalService.create({
            data: {
                facilityId: validatedData.facilityId,
                name: validatedData.name,
                category: validatedData.category,
                price: new client_1.Prisma.Decimal(validatedData.price),
                isActive: validatedData.isActive,
            },
        });
        // 4. Publish RabbitMQ event
        await (0, medical_service_publisher_1.publishMedicalServiceCreatedEvent)({
            serviceId: newService.id,
            facilityId: newService.facilityId,
            name: newService.name,
            category: newService.category,
            price: Number(newService.price),
            isActive: newService.isActive,
            timestamp: newService.createdAt.toISOString(),
        });
        // 5. Cache Management
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.setex(`service:${newService.id}`, MEDICAL_SERVICE_CACHE_TTL, JSON.stringify(newService)),
                redis_1.redisClient.del(`medical_services:facility:${validatedData.facilityId}`),
            ]);
        }
        return newService;
    }
    /**
     * [ADMIN/DOCTOR]: Retrieves a medical service by ID
     */
    async findById(id) {
        const cacheKey = `service:${id}`;
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            const cachedService = await redis_1.redisClient.get(cacheKey);
            if (cachedService) {
                return JSON.parse(cachedService);
            }
        }
        const service = await database_1.prisma.medicalService.findUnique({
            where: { id },
        });
        if (!service) {
            throw new custom_error_1.NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${id}`);
        }
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await redis_1.redisClient.setex(cacheKey, MEDICAL_SERVICE_CACHE_TTL, JSON.stringify(service));
        }
        return service;
    }
    /**
     * [ADMIN]: Updates facility medical service details
     */
    async update(id, input) {
        const validatedData = medical_service_model_1.updateMedicalServiceSchema.parse(input);
        const existingService = await database_1.prisma.medicalService.findUnique({
            where: { id },
        });
        if (!existingService) {
            throw new custom_error_1.NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${id}`);
        }
        const updatedService = await database_1.prisma.medicalService.update({
            where: { id },
            data: {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.isActive !== undefined && {
                    isActive: validatedData.isActive,
                }),
                ...(validatedData.category && { category: validatedData.category }),
                ...(validatedData.price !== undefined && {
                    price: new client_1.Prisma.Decimal(validatedData.price),
                }),
            },
        });
        await (0, medical_service_publisher_1.publishMedicalServiceUpdatedEvent)({
            serviceId: updatedService.id,
            name: updatedService.name,
            category: updatedService.category,
            price: Number(updatedService.price),
            isActive: updatedService.isActive,
            timestamp: updatedService.updatedAt.toISOString(),
        });
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`service:${id}`),
                redis_1.redisClient.del(`medical_services:facility:${updatedService.facilityId}`),
            ]);
        }
        return updatedService;
    }
    /**
     * [ADMIN/DOCTOR]: Retrieves paginated list of medical services filtered by facility
     */
    async findMany(query) {
        const { facilityId, page = 1, limit = 20, category, search, } = medical_service_model_1.medicalServiceQuerySchema.parse(query);
        const skip = (page - 1) * limit;
        const where = {
            ...(facilityId && { facilityId }),
            ...(category && { category }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { category: { contains: search, mode: "insensitive" } },
                ],
            }),
        };
        const [total, records] = await Promise.all([
            database_1.prisma.medicalService.count({ where }),
            database_1.prisma.medicalService.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
            }),
        ]);
        return {
            data: records,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * [DOCTOR]: Records a service provided to a patient visit
     */
    async provideService(providedById, input) {
        const validatedData = medical_service_model_1.provideServiceSchema.parse({
            ...input,
            providedById: input.providedById || providedById,
        });
        // 1. Parallel check for visit and service existence
        const [visit, service] = await Promise.all([
            database_1.prisma.patientVisit.findUnique({
                where: { id: validatedData.visitId },
                select: {
                    id: true,
                    patientId: true,
                    facilityId: true, // <-- Ensure facilityId is retrieved for invoice recalculation
                    patient: { select: { mrn: true } },
                },
            }),
            database_1.prisma.medicalService.findUnique({
                where: { id: validatedData.serviceId },
            }),
        ]);
        if (!visit) {
            throw new custom_error_1.NotFoundError(`PATIENT_VISIT_NOT_FOUND: ${validatedData.visitId}`);
        }
        if (!service) {
            throw new custom_error_1.NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${validatedData.serviceId}`);
        }
        // 2. Transactional persistence (Creates ProvidedService and auto-initializes LabResult if category is Laboratory)
        const record = await database_1.prisma.$transaction(async (tx) => {
            const providedService = await tx.providedService.create({
                data: {
                    visitId: validatedData.visitId,
                    serviceId: validatedData.serviceId,
                    unitPrice: service.price,
                    notes: validatedData.notes,
                    providedById: validatedData.providedById,
                },
            });
            // Automatically create a LabResult entry if the service category is laboratory/lab
            const isLabService = service.category?.toLowerCase() === "laboratory" ||
                service.category?.toLowerCase() === "lab";
            if (isLabService) {
                await tx.labResult.create({
                    data: {
                        providedServiceId: providedService.id,
                        visitId: validatedData.visitId,
                        status: "ORDERED",
                    },
                });
            }
            return providedService;
        });
        // 3. Automatically Recalculate Visit Invoice
        await (0, invoice_helper_1.recalculateVisitInvoice)(validatedData.visitId, visit.facilityId);
        // 4. Publish asynchronous event
        await (0, medical_service_publisher_1.publishServiceProvidedEvent)({
            providedServiceId: record.id,
            visitId: record.visitId,
            serviceId: record.serviceId,
            providedById: record.providedById,
            unitPrice: Number(record.unitPrice),
            timestamp: record.createdAt.toISOString(),
        });
        // 5. Redis Cache Invalidation
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`visit:${validatedData.visitId}`),
                redis_1.redisClient.del(`patient:mrn:${visit.patient.mrn}:visits`),
                redis_1.redisClient.del(`cache:lab_results:visit:${validatedData.visitId}`),
            ]);
        }
        return record;
    }
    /**
     * [DOCTOR]: Fetch provided services for a patient using MRN
     */
    async getProvidedServicesByMrn(mrn, facilityId) {
        const patient = await database_1.prisma.patient.findFirst({
            where: {
                mrn,
                ...(facilityId && { facilityId }),
            },
            select: { id: true },
        });
        if (!patient) {
            throw new custom_error_1.NotFoundError(`PATIENT_NOT_FOUND_FOR_MRN: ${mrn}`);
        }
        return await database_1.prisma.providedService.findMany({
            where: {
                visit: {
                    patientId: patient.id,
                },
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        category: true,
                    },
                },
                visit: {
                    select: {
                        id: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    /**
     * [DOCTOR]: Updates an existing provided service item
     */
    async updateProvidedService(id, input) {
        const existingRecord = await database_1.prisma.providedService.findUnique({
            where: { id },
            include: {
                visit: {
                    select: {
                        id: true,
                        facilityId: true, // <-- Include facilityId for invoice recalculation
                        patient: { select: { mrn: true } },
                    },
                },
            },
        });
        if (!existingRecord) {
            throw new custom_error_1.NotFoundError(`PROVIDED_SERVICE_NOT_FOUND: ${id}`);
        }
        let newUnitPrice = existingRecord.unitPrice;
        if (input.serviceId && input.serviceId !== existingRecord.serviceId) {
            const service = await database_1.prisma.medicalService.findUnique({
                where: { id: input.serviceId },
            });
            if (!service) {
                throw new custom_error_1.NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${input.serviceId}`);
            }
            newUnitPrice = service.price;
        }
        const updatedRecord = await database_1.prisma.$transaction(async (tx) => {
            return await tx.providedService.update({
                where: { id },
                data: {
                    ...(input.visitId && { visitId: input.visitId }),
                    ...(input.serviceId && { serviceId: input.serviceId }),
                    ...(input.serviceId && { unitPrice: newUnitPrice }),
                    ...(input.notes !== undefined && { notes: input.notes }),
                    ...(input.providedById && { providedById: input.providedById }),
                },
                include: {
                    service: true,
                    visit: {
                        select: {
                            id: true,
                            createdAt: true,
                        },
                    },
                },
            });
        });
        // Automatically Recalculate Visit Invoice after service update
        await (0, invoice_helper_1.recalculateVisitInvoice)(updatedRecord.visitId, existingRecord.visit.facilityId);
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`visit:${updatedRecord.visitId}`),
                redis_1.redisClient.del(`patient:mrn:${existingRecord.visit.patient.mrn}:visits`),
            ]);
        }
        return updatedRecord;
    }
    async getLatestVisitByMrn(mrn) {
        const visit = await database_1.prisma.patientVisit.findFirst({
            where: {
                patient: { mrn },
                status: "IN_PROGRESS",
            },
            include: {
                vitalSigns: true,
                services: {
                    include: {
                        service: true,
                        labResult: true,
                    },
                },
                prescriptions: {
                    include: {
                        items: {
                            include: { product: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        if (!visit) {
            throw new custom_error_1.NotFoundError(`NO_ACTIVE_VISIT_FOUND_FOR_MRN: ${mrn}`);
        }
        return visit;
    }
    async generatePrescriptionNumber(facilityId, tx) {
        const lastPrescription = await tx.prescription.findFirst({
            where: { facilityId },
            orderBy: { createdAt: "desc" },
            select: { prescriptionNumber: true },
        });
        if (!lastPrescription || !lastPrescription.prescriptionNumber) {
            return "PRN-001";
        }
        const parts = lastPrescription.prescriptionNumber.split("-");
        const lastNum = parseInt(parts[1], 10);
        if (isNaN(lastNum)) {
            return "PRN-001";
        }
        const nextNum = lastNum + 1;
        return `PRN-${String(nextNum).padStart(3, "0")}`;
    }
    async createPrescription(prescribedById, input) {
        const visit = await database_1.prisma.patientVisit.findUnique({
            where: { id: input.visitId },
            include: { patient: { select: { mrn: true, facilityId: true } } },
        });
        if (!visit) {
            throw new custom_error_1.NotFoundError(`PATIENT_VISIT_NOT_FOUND: ${input.visitId}`);
        }
        const prescription = await database_1.prisma.$transaction(async (tx) => {
            const prescriptionNumber = await this.generatePrescriptionNumber(visit.patient.facilityId, tx);
            return await tx.prescription.create({
                data: {
                    facilityId: visit.patient.facilityId,
                    prescriptionNumber,
                    visitId: input.visitId,
                    prescribedById,
                    notes: input.notes,
                    status: "PENDING",
                    items: {
                        create: input.items.map((item) => ({
                            productId: item.productId,
                            quantityOrdered: item.quantity,
                            unitPrice: new client_1.Prisma.Decimal(item.unitPrice),
                            dosage: item.dosage || "As directed",
                            frequency: "Daily",
                            durationDays: 5,
                        })),
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
        });
        // Automatically Recalculate Visit Invoice for prescription additions
        await (0, invoice_helper_1.recalculateVisitInvoice)(input.visitId, visit.patient.facilityId);
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`visit:${input.visitId}`),
                redis_1.redisClient.del(`patient:mrn:${visit.patient.mrn}:visits`),
            ]);
        }
        return prescription;
    }
}
exports.MedicalServiceService = MedicalServiceService;
