"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishVisitUpdatedEvent = exports.publishVisitCreatedEvent = exports.ROUTING_KEYS = exports.EXCHANGES = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
exports.EXCHANGES = {
    PATIENT_EVENTS: "patient_events",
    VISIT_EVENTS: "visit_events",
    DEAD_LETTER: "emr_dlx",
};
exports.ROUTING_KEYS = {
    PATIENT_REGISTERED: "patient.registered",
    PATIENT_UPDATED: "patient.updated",
    VISIT_CREATED: "visit.created",
    VISIT_UPDATED: "visit.updated",
};
/**
 * Publishes a VISIT_CREATED event to the RabbitMQ Topic Exchange.
 */
const publishVisitCreatedEvent = async (payload) => {
    try {
        const channel = await (0, rabbitmq_1.getRabbitChannel)();
        await channel.assertExchange(exports.EXCHANGES.VISIT_EVENTS, "topic", {
            durable: true,
        });
        const fullPayload = {
            eventId: crypto.randomUUID(),
            eventType: "VISIT_CREATED",
            timestamp: new Date().toISOString(),
            data: payload,
        };
        const buffer = Buffer.from(JSON.stringify(fullPayload));
        const published = channel.publish(exports.EXCHANGES.VISIT_EVENTS, exports.ROUTING_KEYS.VISIT_CREATED, buffer, {
            persistent: true,
            contentType: "application/json",
        });
        console.log(`📤 [RabbitMQ Publisher] Event "VISIT_CREATED" published for Visit ID: ${payload.visitId}`);
        return published;
    }
    catch (error) {
        console.error(`❌ [RabbitMQ Publisher] Failed to publish visit created event:`, error.message);
        throw error;
    }
};
exports.publishVisitCreatedEvent = publishVisitCreatedEvent;
/**
 * Publishes a VISIT_UPDATED event to the RabbitMQ Topic Exchange.
 */
const publishVisitUpdatedEvent = async (payload) => {
    try {
        const channel = await (0, rabbitmq_1.getRabbitChannel)();
        await channel.assertExchange(exports.EXCHANGES.VISIT_EVENTS, "topic", {
            durable: true,
        });
        const fullPayload = {
            eventId: crypto.randomUUID(),
            eventType: "VISIT_UPDATED",
            timestamp: new Date().toISOString(),
            data: payload,
        };
        const buffer = Buffer.from(JSON.stringify(fullPayload));
        const published = channel.publish(exports.EXCHANGES.VISIT_EVENTS, exports.ROUTING_KEYS.VISIT_UPDATED, buffer, {
            persistent: true,
            contentType: "application/json",
        });
        console.log(`📤 [RabbitMQ Publisher] Event "VISIT_UPDATED" published for Visit ID: ${payload.visitId}`);
        return published;
    }
    catch (error) {
        console.error(`❌ [RabbitMQ Publisher] Failed to publish visit updated event:`, error.message);
        throw error;
    }
};
exports.publishVisitUpdatedEvent = publishVisitUpdatedEvent;
