// message/publisher/medical-service.publisher.ts
import { publishToQueue } from "../../config/rabbitmq";
import {
  ServiceRoutingKey,
  MedicalServiceCreatedEvent,
  MedicalServiceUpdatedEvent,
  ServiceProvidedEvent,
  medicalServiceCreatedEventSchema,
  medicalServiceUpdatedEventSchema,
  serviceProvidedEventSchema,
} from "../../models/clinical/medical-service.model";

const MEDICAL_EXCHANGE = "medical_exchange";

/**
 * Publishes event when a new medical service is created
 */
export async function publishMedicalServiceCreatedEvent(
  payload: MedicalServiceCreatedEvent,
): Promise<void> {
  const validatedPayload = medicalServiceCreatedEventSchema.parse(payload);

  await publishToQueue(
    MEDICAL_EXCHANGE,
    ServiceRoutingKey.CREATED,
    validatedPayload,
  );
}

/**
 * Publishes event when an existing medical service is updated
 */
export async function publishMedicalServiceUpdatedEvent(
  payload: MedicalServiceUpdatedEvent,
): Promise<void> {
  const validatedPayload = medicalServiceUpdatedEventSchema.parse(payload);

  await publishToQueue(
    MEDICAL_EXCHANGE,
    ServiceRoutingKey.UPDATED,
    validatedPayload,
  );
}

/**
 * Publishes event when a medical service is provided during a patient visit
 */
export async function publishServiceProvidedEvent(
  payload: ServiceProvidedEvent,
): Promise<void> {
  // Validates that providedById, visitId, serviceId, unitPrice, and timestamp are correctly structured
  const validatedPayload = serviceProvidedEventSchema.parse(payload);

  await publishToQueue(
    MEDICAL_EXCHANGE,
    ServiceRoutingKey.PROVIDED,
    validatedPayload,
  );
}
