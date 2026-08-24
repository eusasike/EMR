import { getRabbitChannel } from "../../config/rabbitmq";
import {
  EXCHANGES,
  VisitCreatedEventPayload,
  VisitUpdatedEventPayload,
} from "../publisher/visit.publisher";

export const QUEUES = {
  TRIAGE_ROUTING: "q.visit.triage_routing",
  BILLING_INITIATION: "q.visit.billing_initiation",
  VISIT_AUDIT_LOGS: "q.visit.audit_logs",
  DEAD_LETTER_QUEUE: "q.emr.dead_letters",
} as const;

/**
 * Initializes Queues, Dead Letter Exchanges, and Worker Listeners for Visit events.
 */
export const initializeVisitWorkers = async (): Promise<void> => {
  const channel = await getRabbitChannel();

  // 1. Declare Dead Letter Exchange & Queue
  await channel.assertExchange(EXCHANGES.DEAD_LETTER, "topic", {
    durable: true,
  });
  await channel.assertQueue(QUEUES.DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(QUEUES.DEAD_LETTER_QUEUE, EXCHANGES.DEAD_LETTER, "#");

  // 2. Declare Main Exchange for Visit Events
  await channel.assertExchange(EXCHANGES.VISIT_EVENTS, "topic", {
    durable: true,
  });

  const queueOptions = {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": EXCHANGES.DEAD_LETTER,
      "x-dead-letter-routing-key": "dead.letter.visit",
    },
  };

  // 3. Queue A: Triage Queue Worker (Listens for new visits)
  await channel.assertQueue(QUEUES.TRIAGE_ROUTING, queueOptions);
  await channel.bindQueue(
    QUEUES.TRIAGE_ROUTING,
    EXCHANGES.VISIT_EVENTS,
    "visit.created",
  );

  // 4. Queue B: Billing Initiation Worker (Listens for new visits)
  await channel.assertQueue(QUEUES.BILLING_INITIATION, queueOptions);
  await channel.bindQueue(
    QUEUES.BILLING_INITIATION,
    EXCHANGES.VISIT_EVENTS,
    "visit.created",
  );

  // 5. Queue C: Audit Logging Worker (Listens for all visit events: visit.*)
  await channel.assertQueue(QUEUES.VISIT_AUDIT_LOGS, queueOptions);
  await channel.bindQueue(
    QUEUES.VISIT_AUDIT_LOGS,
    EXCHANGES.VISIT_EVENTS,
    "visit.*",
  );

  // Set Fair Dispatch (1 message per worker at a time)
  await channel.prefetch(1);

  // Start Worker 1: Triage Router
  console.log(`🎧 [Worker] Listening on queue: "${QUEUES.TRIAGE_ROUTING}"`);
  channel.consume(
    QUEUES.TRIAGE_ROUTING,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: VisitCreatedEventPayload = JSON.parse(
          msg.content.toString(),
        );
        console.log(
          `🏥 [Triage Worker] Routing Visit ID ${payload.data.visitId} (Priority: ${payload.data.priority}) to Nursing Desk...`,
        );

        // Place business logic here (e.g., notify nursing desk websocket or create triage queue record)

        channel.ack(msg);
      } catch (error: any) {
        console.error(
          `❌ [Triage Worker] Failed. Moving to DLQ:`,
          error.message,
        );
        channel.nack(msg, false, false); // Moves message to DLQ
      }
    },
    { noAck: false },
  );

  // Start Worker 2: Billing Initiator
  console.log(`🎧 [Worker] Listening on queue: "${QUEUES.BILLING_INITIATION}"`);
  channel.consume(
    QUEUES.BILLING_INITIATION,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: VisitCreatedEventPayload = JSON.parse(
          msg.content.toString(),
        );
        console.log(
          `💳 [Billing Worker] Creating draft consultation charge for Visit ID: ${payload.data.visitId}`,
        );

        // Place business logic here (e.g., generate pending invoice or check insurance balance)

        channel.ack(msg);
      } catch (error: any) {
        console.error(
          `❌ [Billing Worker] Failed. Moving to DLQ:`,
          error.message,
        );
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );

  // Start Worker 3: Visit Audit Logger
  console.log(`🎧 [Worker] Listening on queue: "${QUEUES.VISIT_AUDIT_LOGS}"`);
  channel.consume(
    QUEUES.VISIT_AUDIT_LOGS,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: VisitCreatedEventPayload | VisitUpdatedEventPayload =
          JSON.parse(msg.content.toString());

        console.log(
          `📜 [Visit Audit Worker] Recorded event "${payload.eventType}" for Visit ID: ${payload.data.visitId}`,
        );

        channel.ack(msg);
      } catch (error: any) {
        console.error(`❌ [Visit Audit Worker] Logging failed:`, error.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );
};
