"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeVisitWorkers = exports.QUEUES = void 0;
const client_1 = require("@prisma/client");
const rabbitmq_1 = require("../../config/rabbitmq");
const visit_publisher_1 = require("../publisher/visit.publisher");
exports.QUEUES = {
    TRIAGE_ROUTING: "q.visit.triage_routing",
    BILLING_INITIATION: "q.visit.billing_initiation",
    BILLING_FINALIZATION: "q.visit.billing_finalization",
    VISIT_AUDIT_LOGS: "q.visit.audit_logs",
    DEAD_LETTER_QUEUE: "q.emr.dead_letters",
};
/**
 * Initializes Queues, Dead Letter Exchanges, and Worker Listeners for Visit events.
 */
const initializeVisitWorkers = async () => {
    const channel = await (0, rabbitmq_1.getRabbitChannel)();
    // 1. Declare Dead Letter Exchange & Queue
    await channel.assertExchange(visit_publisher_1.EXCHANGES.DEAD_LETTER, "topic", {
        durable: true,
    });
    await channel.assertQueue(exports.QUEUES.DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(exports.QUEUES.DEAD_LETTER_QUEUE, visit_publisher_1.EXCHANGES.DEAD_LETTER, "#");
    // 2. Declare Main Exchange for Visit Events
    await channel.assertExchange(visit_publisher_1.EXCHANGES.VISIT_EVENTS, "topic", {
        durable: true,
    });
    const queueOptions = {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": visit_publisher_1.EXCHANGES.DEAD_LETTER,
            "x-dead-letter-routing-key": "dead.letter.visit",
        },
    };
    // 3. Queue A: Triage Queue Worker (Listens for new visits)
    await channel.assertQueue(exports.QUEUES.TRIAGE_ROUTING, queueOptions);
    await channel.bindQueue(exports.QUEUES.TRIAGE_ROUTING, visit_publisher_1.EXCHANGES.VISIT_EVENTS, "visit.created");
    // 4. Queue B: Billing Initiation Worker (Listens for new visits)
    await channel.assertQueue(exports.QUEUES.BILLING_INITIATION, queueOptions);
    await channel.bindQueue(exports.QUEUES.BILLING_INITIATION, visit_publisher_1.EXCHANGES.VISIT_EVENTS, "visit.created");
    // 5. Queue C: Billing Finalization Worker (Listens for updated visit events)
    await channel.assertQueue(exports.QUEUES.BILLING_FINALIZATION, queueOptions);
    await channel.bindQueue(exports.QUEUES.BILLING_FINALIZATION, visit_publisher_1.EXCHANGES.VISIT_EVENTS, "visit.updated");
    // 6. Queue D: Audit Logging Worker (Listens for all visit events: visit.*)
    await channel.assertQueue(exports.QUEUES.VISIT_AUDIT_LOGS, queueOptions);
    await channel.bindQueue(exports.QUEUES.VISIT_AUDIT_LOGS, visit_publisher_1.EXCHANGES.VISIT_EVENTS, "visit.*");
    // Set Fair Dispatch (1 message per worker at a time)
    await channel.prefetch(1);
    // Worker 1: Triage Router
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.TRIAGE_ROUTING}"`);
    channel.consume(exports.QUEUES.TRIAGE_ROUTING, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`🏥 [Triage Worker] Routing Visit ID ${payload.data.visitId} [Status: ${payload.data.status}, Priority: ${payload.data.priority}] to Nursing Desk...`);
            // Place business logic here (e.g., notify nursing desk websocket or create triage queue record)
            channel.ack(msg);
        }
        catch (error) {
            console.error(`❌ [Triage Worker] Failed. Moving to DLQ:`, error.message);
            channel.nack(msg, false, false); // Moves message to DLQ
        }
    }, { noAck: false });
    // Worker 2: Billing Initiator
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.BILLING_INITIATION}"`);
    channel.consume(exports.QUEUES.BILLING_INITIATION, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`💳 [Billing Worker] Creating draft consultation charge for Visit ID: ${payload.data.visitId} [Status: ${payload.data.status}]`);
            // Place business logic here (e.g., generate pending invoice or check insurance balance)
            channel.ack(msg);
        }
        catch (error) {
            console.error(`❌ [Billing Worker] Failed. Moving to DLQ:`, error.message);
            channel.nack(msg, false, false);
        }
    }, { noAck: false });
    // Worker 3: Billing Finalizer (Handles COMPLETED & CANCELLED status updates)
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.BILLING_FINALIZATION}"`);
    channel.consume(exports.QUEUES.BILLING_FINALIZATION, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            if (payload.data.status === client_1.VisitStatus.COMPLETED) {
                console.log(`🏁 [Billing Worker] Finalizing billing & closing invoices for COMPLETED Visit ID: ${payload.data.visitId}`);
                // Place business logic for visit completion (e.g., finalize invoice, release lock)
            }
            else if (payload.data.status === client_1.VisitStatus.CANCELLED) {
                console.log(`🚫 [Billing Worker] Voiding pending charges for CANCELLED Visit ID: ${payload.data.visitId}`);
                // Place business logic for cancellation (e.g., void invoice items)
            }
            else {
                console.log(`ℹ️ [Billing Worker] Ignored update for Visit ID: ${payload.data.visitId} with status: ${payload.data.status}`);
            }
            channel.ack(msg);
        }
        catch (error) {
            console.error(`❌ [Billing Finalizer Worker] Failed. Moving to DLQ:`, error.message);
            channel.nack(msg, false, false);
        }
    }, { noAck: false });
    // Worker 4: Visit Audit Logger
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.VISIT_AUDIT_LOGS}"`);
    channel.consume(exports.QUEUES.VISIT_AUDIT_LOGS, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`📜 [Visit Audit Worker] Recorded event "${payload.eventType}" for Visit ID: ${payload.data.visitId} [Status: ${payload.data.status}]`);
            channel.ack(msg);
        }
        catch (error) {
            console.error(`❌ [Visit Audit Worker] Logging failed:`, error.message);
            channel.nack(msg, false, false);
        }
    }, { noAck: false });
};
exports.initializeVisitWorkers = initializeVisitWorkers;
