import { MedicalService, ProvidedService, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  publishMedicalServiceCreatedEvent,
  publishMedicalServiceUpdatedEvent,
  publishServiceProvidedEvent,
} from "../../message/publisher/medical-service.publisher";
import {
  CreateMedicalServiceInput,
  UpdateMedicalServiceInput,
  ProvideServiceInput,
  MedicalServiceQueryInput,
  createMedicalServiceSchema,
  updateMedicalServiceSchema,
  provideServiceSchema,
  medicalServiceQuerySchema,
} from "../../models/clinical/medical-service.model";
import { NotFoundError, ConflictError } from "../../util/custom-error";

const MEDICAL_SERVICE_CACHE_TTL = 3600; // 1 hour TTL

export class MedicalServiceService {
  /**
   * Creates a new medical service, publishes creation event, and manages Redis cache
   */
  async create(input: CreateMedicalServiceInput): Promise<MedicalService> {
    const validatedData = createMedicalServiceSchema.parse(input);

    // 1. Verify service uniqueness by name
    const existingService = await prisma.medicalService.findFirst({
      where: { name: { equals: validatedData.name, mode: "insensitive" } },
    });

    if (existingService) {
      throw new ConflictError(
        `MEDICAL_SERVICE_ALREADY_EXISTS: ${validatedData.name}`,
      );
    }

    // 2. Persist to Database
    const newService = await prisma.medicalService.create({
      data: {
        name: validatedData.name,
        category: validatedData.category,
        price: new Prisma.Decimal(validatedData.price),
      },
    });

    // 3. Publish RabbitMQ asynchronous event
    await publishMedicalServiceCreatedEvent({
      serviceId: newService.id,
      name: newService.name,
      category: newService.category,
      price: Number(newService.price),
      timestamp: newService.createdAt.toISOString(),
    });

    // 4. Cache Management
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.setex(
          `service:${newService.id}`,
          MEDICAL_SERVICE_CACHE_TTL,
          JSON.stringify(newService),
        ),
        redisClient.del("medical_services:all"),
      ]);
    }

    return newService;
  }

  /**
   * Retrieves a medical service by ID with Redis caching
   */
  async findById(id: string): Promise<MedicalService> {
    const cacheKey = `service:${id}`;

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      const cachedService = await redisClient.get(cacheKey);
      if (cachedService) {
        return JSON.parse(cachedService);
      }
    }

    const service = await prisma.medicalService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${id}`);
    }

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.setex(
        cacheKey,
        MEDICAL_SERVICE_CACHE_TTL,
        JSON.stringify(service),
      );
    }

    return service;
  }

  /**
   * Updates medical service details and flushes relevant cache entries
   */
  async update(
    id: string,
    input: UpdateMedicalServiceInput,
  ): Promise<MedicalService> {
    const validatedData = updateMedicalServiceSchema.parse(input);

    const existingService = await prisma.medicalService.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundError(`MEDICAL_SERVICE_NOT_FOUND: ${id}`);
    }

    const updatedService = await prisma.medicalService.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.price !== undefined && {
          price: new Prisma.Decimal(validatedData.price),
        }),
      },
    });

    // Publish update event
    await publishMedicalServiceUpdatedEvent({
      serviceId: updatedService.id,
      name: updatedService.name,
      category: updatedService.category,
      price: Number(updatedService.price),
      timestamp: updatedService.updatedAt.toISOString(),
    });

    // Flush cache
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.del(`service:${id}`),
        redisClient.del("medical_services:all"),
      ]);
    }

    return updatedService;
  }

  /**
   * Retrieves paginated & searchable list of medical services
   */
  async findMany(query: MedicalServiceQueryInput) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
    } = medicalServiceQuerySchema.parse(query);

    const skip = (page - 1) * limit;

    const where: Prisma.MedicalServiceWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, records] = await Promise.all([
      prisma.medicalService.count({ where }),
      prisma.medicalService.findMany({
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
   * Records a service provided to a patient visit and publishes event
   */
  async provideService(
    providedById: string,
    input: ProvideServiceInput,
  ): Promise<ProvidedService> {
    const validatedData = provideServiceSchema.parse({
      ...input,
      providedById: input.providedById || providedById,
    });

    // 1. Parallel check for active visit (with MRN for cache key) and service existence
    const [visit, service] = await Promise.all([
      prisma.patientVisit.findUnique({
        where: { id: validatedData.visitId },
        select: {
          id: true,
          patientId: true,
          patient: { select: { mrn: true } },
        },
      }),
      prisma.medicalService.findUnique({
        where: { id: validatedData.serviceId },
      }),
    ]);

    if (!visit) {
      throw new NotFoundError(
        `PATIENT_VISIT_NOT_FOUND: ${validatedData.visitId}`,
      );
    }
    if (!service) {
      throw new NotFoundError(
        `MEDICAL_SERVICE_NOT_FOUND: ${validatedData.serviceId}`,
      );
    }

    // 2. Transactional persistence
    const record = await prisma.$transaction(async (tx) => {
      return await tx.providedService.create({
        data: {
          visitId: validatedData.visitId,
          serviceId: validatedData.serviceId,
          unitPrice: service.price,
          notes: validatedData.notes,
          providedById: validatedData.providedById,
        },
      });
    });

    // 3. Publish asynchronous RabbitMQ event
    await publishServiceProvidedEvent({
      providedServiceId: record.id,
      visitId: record.visitId,
      serviceId: record.serviceId,
      providedById: record.providedById,
      unitPrice: Number(record.unitPrice),
      timestamp: record.createdAt.toISOString(),
    });

    // 4. Redis Cache Management (Invalidate cached visit records by ID and MRN)
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.del(`visit:${validatedData.visitId}`),
        redisClient.del(`patient:mrn:${visit.patient.mrn}:visits`),
      ]);
    }

    return record;
  }
}
