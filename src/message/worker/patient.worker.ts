import { getRabbitChannel } from "../../config/rabbitmq";
import { EXCHANGES } from "../publisher/patient.publisher";

export const QUEUES = {
  SMS_NOTIFICATIONS: "q.patient.sms_notifications",
  AUDIT_LOGS: "q.patient.audit_logs",
  DEAD_LETTER_QUEUE: "q.emr.dead_letters",
} as const;

/**
 * Initializes Queues, Dead Letter Exchanges, and Worker Listeners.
 */
export const initializePatientWorkers = async (): Promise<void> => {
  const channel = await getRabbitChannel();

  // 1. Declare Dead Letter Exchange & Queue
  await channel.assertExchange(EXCHANGES.DEAD_LETTER, "topic", {
    durable: true,
  });
  await channel.assertQueue(QUEUES.DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(QUEUES.DEAD_LETTER_QUEUE, EXCHANGES.DEAD_LETTER, "#");

  // 2. Declare Main Exchange
  await channel.assertExchange(EXCHANGES.PATIENT_EVENTS, "topic", {
    durable: true,
  });

  const queueOptions = {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": EXCHANGES.DEAD_LETTER,
      "x-dead-letter-routing-key": "dead.letter.patient",
    },
  };

  // 3. Queue A: SMS Notifications Worker
  await channel.assertQueue(QUEUES.SMS_NOTIFICATIONS, queueOptions);
  await channel.bindQueue(
    QUEUES.SMS_NOTIFICATIONS,
    EXCHANGES.PATIENT_EVENTS,
    "patient.registered",
  );

  // 4. Queue B: Audit Logging Worker
  await channel.assertQueue(QUEUES.AUDIT_LOGS, queueOptions);
  await channel.bindQueue(
    QUEUES.AUDIT_LOGS,
    EXCHANGES.PATIENT_EVENTS,
    "patient.*",
  );

  // Set Fair Dispatch (1 message per worker at a time)
  await channel.prefetch(1);

  // Start Worker 1: SMS Sender
  console.log(`🎧 [Worker] Listening on queue: "${QUEUES.SMS_NOTIFICATIONS}"`);
  channel.consume(
    QUEUES.SMS_NOTIFICATIONS,
    async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(
          `📱 [SMS Worker] Sending welcome text to ${payload.data.fullName} (${payload.data.phone})...`,
        );

        // Simulate third-party SMS API call
        // await smsProvider.send(...)

        channel.ack(msg); // Acknowledge successful processing
      } catch (error: any) {
        console.error(`❌ [SMS Worker] Failed. Moving to DLQ:`, error.message);
        channel.nack(msg, false, false); // NACK without requeue moves to DLQ
      }
    },
    { noAck: false },
  );

  // Start Worker 2: Audit Logger
  console.log(`🎧 [Worker] Listening on queue: "${QUEUES.AUDIT_LOGS}"`);
  channel.consume(
    QUEUES.AUDIT_LOGS,
    async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(
          `📜 [Audit Worker] Activity logged for MRN ${payload.data.mrn}`,
        );

        channel.ack(msg);
      } catch (error: any) {
        console.error(`❌ [Audit Worker] Logging failed:`, error.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );
};
