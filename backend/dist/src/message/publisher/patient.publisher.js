"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPatientRegisteredEvent = exports.ROUTING_KEYS = exports.EXCHANGES = void 0;
const rabbitmq_1 = require("../../config/rabbitmq"); // Your RabbitMQ config file
exports.EXCHANGES = {
    PATIENT_EVENTS: "patient_events",
    DEAD_LETTER: "emr_dlx",
};
exports.ROUTING_KEYS = {
    PATIENT_REGISTERED: "patient.registered",
    PATIENT_UPDATED: "patient.updated",
};
/**
 * Publishes a PATIENT_REGISTERED event to the RabbitMQ Topic Exchange.
 */
const publishPatientRegisteredEvent = async (payload) => {
    try {
        const channel = await (0, rabbitmq_1.getRabbitChannel)();
        // Ensure exchange exists
        await channel.assertExchange(exports.EXCHANGES.PATIENT_EVENTS, "topic", {
            durable: true,
        });
        const fullPayload = {
            eventId: crypto.randomUUID(),
            eventType: "PATIENT_REGISTERED",
            timestamp: new Date().toISOString(),
            data: payload,
        };
        const buffer = Buffer.from(JSON.stringify(fullPayload));
        const published = channel.publish(exports.EXCHANGES.PATIENT_EVENTS, exports.ROUTING_KEYS.PATIENT_REGISTERED, buffer, {
            persistent: true,
            contentType: "application/json",
        });
        console.log(`📤 [RabbitMQ Publisher] Event "PATIENT_REGISTERED" published for MRN: ${payload.mrn}`);
        return published;
    }
    catch (error) {
        console.error(`❌ [RabbitMQ Publisher] Failed to publish registration event:`, error.message);
        throw error;
    }
};
exports.publishPatientRegisteredEvent = publishPatientRegisteredEvent;
