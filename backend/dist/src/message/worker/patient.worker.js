"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePatientWorkers = exports.QUEUES = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const patient_publisher_1 = require("../publisher/patient.publisher");
exports.QUEUES = {
    SMS_NOTIFICATIONS: "q.patient.sms_notifications",
    AUDIT_LOGS: "q.patient.audit_logs",
    DEAD_LETTER_QUEUE: "q.emr.dead_letters",
};
/**
 * Initializes Queues, Dead Letter Exchanges, and Worker Listeners.
 */
const initializePatientWorkers = async () => {
    const channel = await (0, rabbitmq_1.getRabbitChannel)();
    // 1. Declare Dead Letter Exchange & Queue
    await channel.assertExchange(patient_publisher_1.EXCHANGES.DEAD_LETTER, "topic", {
        durable: true,
    });
    await channel.assertQueue(exports.QUEUES.DEAD_LETTER_QUEUE, { durable: true });
    await channel.bindQueue(exports.QUEUES.DEAD_LETTER_QUEUE, patient_publisher_1.EXCHANGES.DEAD_LETTER, "#");
    // 2. Declare Main Exchange
    await channel.assertExchange(patient_publisher_1.EXCHANGES.PATIENT_EVENTS, "topic", {
        durable: true,
    });
    const queueOptions = {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": patient_publisher_1.EXCHANGES.DEAD_LETTER,
            "x-dead-letter-routing-key": "dead.letter.patient",
        },
    };
    // 3. Queue A: SMS Notifications Worker
    await channel.assertQueue(exports.QUEUES.SMS_NOTIFICATIONS, queueOptions);
    await channel.bindQueue(exports.QUEUES.SMS_NOTIFICATIONS, patient_publisher_1.EXCHANGES.PATIENT_EVENTS, "patient.registered");
    // 4. Queue B: Audit Logging Worker
    await channel.assertQueue(exports.QUEUES.AUDIT_LOGS, queueOptions);
    await channel.bindQueue(exports.QUEUES.AUDIT_LOGS, patient_publisher_1.EXCHANGES.PATIENT_EVENTS, "patient.*");
    // Set Fair Dispatch (1 message per worker at a time)
    await channel.prefetch(1);
    // Start Worker 1: SMS Sender
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.SMS_NOTIFICATIONS}"`);
    channel.consume(exports.QUEUES.SMS_NOTIFICATIONS, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`📱 [SMS Worker] Sending welcome text to ${payload.data.fullName} (${payload.data.phone})...`);
            // Simulate third-party SMS API call
            // await smsProvider.send(...)
            channel.ack(msg); // Acknowledge successful processing
        }
        catch (error) {
            console.error(`❌ [SMS Worker] Failed. Moving to DLQ:`, error.message);
            channel.nack(msg, false, false); // NACK without requeue moves to DLQ
        }
    }, { noAck: false });
    // Start Worker 2: Audit Logger
    console.log(`🎧 [Worker] Listening on queue: "${exports.QUEUES.AUDIT_LOGS}"`);
    channel.consume(exports.QUEUES.AUDIT_LOGS, async (msg) => {
        if (!msg)
            return;
        try {
            const payload = JSON.parse(msg.content.toString());
            console.log(`📜 [Audit Worker] Activity logged for MRN ${payload.data.mrn}`);
            channel.ack(msg);
        }
        catch (error) {
            console.error(`❌ [Audit Worker] Logging failed:`, error.message);
            channel.nack(msg, false, false);
        }
    }, { noAck: false });
};
exports.initializePatientWorkers = initializePatientWorkers;
