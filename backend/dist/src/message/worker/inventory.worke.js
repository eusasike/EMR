"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReorderWorker = startReorderWorker;
const rabbitmq_1 = require("../../config/rabbitmq");
const inventory_model_1 = require("../../models/phamarcy/inventory.model");
const PHARMACY_EXCHANGE = "pharmacy_exchange";
const REORDER_QUEUE = "pharmacy_reorder_notifications_queue";
/**
 * Starts the reorder level background worker loop.
 */
async function startReorderWorker() {
    try {
        const channel = await (0, rabbitmq_1.getRabbitChannel)();
        // 1. Ensure exchange exists
        await channel.assertExchange(PHARMACY_EXCHANGE, "topic", { durable: true });
        // 2. Ensure durable queue exists
        await channel.assertQueue(REORDER_QUEUE, { durable: true });
        // 3. Bind queue to the reorder level routing key
        await channel.bindQueue(REORDER_QUEUE, PHARMACY_EXCHANGE, inventory_model_1.PharmacyRoutingKey.REORDER_LEVEL_REACHED);
        // 4. Rate-limit message intake per worker process
        await channel.prefetch(10);
        console.log(`[*] Reorder Level Worker running. Bound to queue: "${REORDER_QUEUE}"`);
        // 5. Consume incoming events
        await channel.consume(REORDER_QUEUE, async (msg) => {
            if (!msg)
                return;
            try {
                const rawPayload = JSON.parse(msg.content.toString());
                // Validate structure with Zod schema
                const event = inventory_model_1.reorderLevelReachedEventSchema.parse(rawPayload);
                // Execute background task
                await processReorderAlert(event);
                // Acknowledge successful processing
                channel.ack(msg);
            }
            catch (error) {
                console.error(`[Reorder Worker Error] Non-retryable failure for message ID ${msg.properties.messageId}:`, error);
                // Discard invalid/corrupted message without requeuing (or forward to DLQ if configured)
                channel.nack(msg, false, false);
            }
        }, { noAck: false });
    }
    catch (error) {
        console.error("[Reorder Worker Fatal] Failed to initialize worker:", error);
        throw error;
    }
}
/**
 * Handles processing logic for reorder level alerts (notifications, procurement logs, WS broadcasts).
 */
async function processReorderAlert(event) {
    console.warn(`[REORDER ALERT PROCESSOR] Product: "${event.productName}" (ID: ${event.productId}) ` +
        `| Current Stock: ${event.currentStock} | Reorder Level: ${event.reorderLevel} ` +
        `| Timestamp: ${event.timestamp}`);
    // Todo: Send email notification to procurement team or emit dashboard event
}
