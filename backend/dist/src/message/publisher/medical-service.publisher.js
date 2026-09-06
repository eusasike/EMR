"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishMedicalServiceCreatedEvent = publishMedicalServiceCreatedEvent;
exports.publishMedicalServiceUpdatedEvent = publishMedicalServiceUpdatedEvent;
exports.publishServiceProvidedEvent = publishServiceProvidedEvent;
// message/publisher/medical-service.publisher.ts
const rabbitmq_1 = require("../../config/rabbitmq");
const medical_service_model_1 = require("../../models/clinical/medical-service.model");
const MEDICAL_EXCHANGE = "medical_exchange";
/**
 * Publishes event when a new medical service is created
 */
async function publishMedicalServiceCreatedEvent(payload) {
    const validatedPayload = medical_service_model_1.medicalServiceCreatedEventSchema.parse(payload);
    await (0, rabbitmq_1.publishToQueue)(MEDICAL_EXCHANGE, medical_service_model_1.ServiceRoutingKey.CREATED, validatedPayload);
}
/**
 * Publishes event when an existing medical service is updated
 */
async function publishMedicalServiceUpdatedEvent(payload) {
    const validatedPayload = medical_service_model_1.medicalServiceUpdatedEventSchema.parse(payload);
    await (0, rabbitmq_1.publishToQueue)(MEDICAL_EXCHANGE, medical_service_model_1.ServiceRoutingKey.UPDATED, validatedPayload);
}
/**
 * Publishes event when a medical service is provided during a patient visit
 */
async function publishServiceProvidedEvent(payload) {
    // Validates that providedById, visitId, serviceId, unitPrice, and timestamp are correctly structured
    const validatedPayload = medical_service_model_1.serviceProvidedEventSchema.parse(payload);
    await (0, rabbitmq_1.publishToQueue)(MEDICAL_EXCHANGE, medical_service_model_1.ServiceRoutingKey.PROVIDED, validatedPayload);
}
