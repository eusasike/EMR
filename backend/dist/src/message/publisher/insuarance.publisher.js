"use strict";
// src/events/publishers/claims.publisher.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsPublisher = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const EXCHANGE_NAME = "billing_exchange";
class ClaimsPublisher {
    /**
     * Publish claim.created event
     */
    static async publishClaimCreated(payload) {
        return await (0, rabbitmq_1.publishToQueue)(EXCHANGE_NAME, "claim.created", payload);
    }
    /**
     * Publish claim.processed event
     */
    static async publishClaimProcessed(payload) {
        return await (0, rabbitmq_1.publishToQueue)(EXCHANGE_NAME, "claim.processed", payload);
    }
}
exports.ClaimsPublisher = ClaimsPublisher;
