"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyPublisher = void 0;
// messaging/pharmacy.publisher.ts
const rabbitmq_1 = require("../../config/rabbitmq");
const inventory_model_1 = require("../../models/phamarcy/inventory.model");
const PHARMACY_EXCHANGE = "pharmacy_exchange";
class PharmacyPublisher {
    /**
     * Publishes an event when items are successfully dispensed from stock.
     */
    static async publishProductDispensed(eventData) {
        // Runtime schema validation prior to publishing
        const validatedData = inventory_model_1.productDispensedEventSchema.parse(eventData);
        return await (0, rabbitmq_1.publishToQueue)(PHARMACY_EXCHANGE, inventory_model_1.PharmacyRoutingKey.DISPENSED, validatedData);
    }
    /**
     * Publishes an event when stock falls to or below the specified reorder level.
     */
    static async publishReorderLevelReached(eventData) {
        // Runtime schema validation prior to publishing
        const validatedData = inventory_model_1.reorderLevelReachedEventSchema.parse(eventData);
        return await (0, rabbitmq_1.publishToQueue)(PHARMACY_EXCHANGE, inventory_model_1.PharmacyRoutingKey.REORDER_LEVEL_REACHED, validatedData);
    }
}
exports.PharmacyPublisher = PharmacyPublisher;
