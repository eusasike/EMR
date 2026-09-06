"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionPublisher = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const QUEUE_NAME = "prescription_queue";
const DLX_NAME = "prescription_dlx";
const DLQ_NAME = "prescription_queue_dlq";
class PrescriptionPublisher {
    /**
     * Asserts the DLX, DLQ, and Main Queue with DLX bindings.
     */
    static async setupQueueTopology() {
        const channel = await (0, rabbitmq_1.getRabbitChannel)();
        // 1. Declare Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ)
        await channel.assertExchange(DLX_NAME, "direct", { durable: true });
        await channel.assertQueue(DLQ_NAME, { durable: true });
        await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);
        // 2. Declare Main Queue configured with DLX
        await channel.assertQueue(QUEUE_NAME, {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": DLX_NAME,
                "x-dead-letter-routing-key": DLQ_NAME, // Routes failed messages to DLQ
            },
        });
    }
    static async publishPrescriptionCreated(data) {
        // Ensure topology exists before publishing
        await this.setupQueueTopology();
        // Uses your existing unchanged publishToQueue helper
        return await (0, rabbitmq_1.publishToQueue)(QUEUE_NAME, "prescription.created", data);
    }
}
exports.PrescriptionPublisher = PrescriptionPublisher;
