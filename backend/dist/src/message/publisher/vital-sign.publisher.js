"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalSignsRoutingKey = exports.VITAL_SIGNS_EXCHANGE = void 0;
exports.publishVitalSignsRecordedEvent = publishVitalSignsRecordedEvent;
exports.publishVitalSignsUpdatedEvent = publishVitalSignsUpdatedEvent;
exports.publishRealtimeAlertEvent = publishRealtimeAlertEvent;
const rabbitmq_1 = require("../../config/rabbitmq");
const redis_1 = require("../../config/redis");
const client_1 = require("@prisma/client");
exports.VITAL_SIGNS_EXCHANGE = "vital_signs_exchange";
var VitalSignsRoutingKey;
(function (VitalSignsRoutingKey) {
    VitalSignsRoutingKey["RECORDED"] = "vital_signs.recorded";
    VitalSignsRoutingKey["UPDATED"] = "vital_signs.updated";
    VitalSignsRoutingKey["CRITICAL"] = "vital_signs.critical";
})(VitalSignsRoutingKey || (exports.VitalSignsRoutingKey = VitalSignsRoutingKey = {}));
/**
 * Dispatches vital signs creation events to RabbitMQ queues.
 */
async function publishVitalSignsRecordedEvent(eventPayload) {
    try {
        const isCritical = eventPayload.priority === client_1.TriagePriority.RED;
        const targetQueue = isCritical
            ? "critical_vitals_queue"
            : "vital_signs_queue";
        const eventName = isCritical
            ? VitalSignsRoutingKey.CRITICAL
            : VitalSignsRoutingKey.RECORDED;
        await (0, rabbitmq_1.publishToQueue)(targetQueue, eventName, eventPayload);
    }
    catch (error) {
        console.error("[VitalSignsPublisher] Failed to queue vital sign recorded event:", error);
    }
}
/**
 * Dispatches vital signs modification events to RabbitMQ queues.
 */
async function publishVitalSignsUpdatedEvent(eventPayload) {
    try {
        await (0, rabbitmq_1.publishToQueue)("vital_signs_queue", VitalSignsRoutingKey.UPDATED, eventPayload);
    }
    catch (error) {
        console.error("[VitalSignsPublisher] Failed to queue vital sign updated event:", error);
    }
}
/**
 * Pushes critical alerts to Redis Pub/Sub for immediate WebSocket broadcast.
 */
async function publishRealtimeAlertEvent(eventPayload) {
    try {
        if (eventPayload.priority === client_1.TriagePriority.RED &&
            (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect")) {
            await redis_1.redisClient.publish("emergency:alerts", JSON.stringify(eventPayload));
        }
    }
    catch (error) {
        console.error("[VitalSignsPublisher] Failed to publish Redis alert:", error);
    }
}
