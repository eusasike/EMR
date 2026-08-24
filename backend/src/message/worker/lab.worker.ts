// src/workers/lab.worker.ts
import { getRabbitChannel } from "../../config/rabbitmq";

const LAB_EXCHANGE = "lab_events_exchange";
const MAIN_QUEUE = "lab_events_queue";
const DLX_NAME = "lab_events_dlx";
const DLQ_NAME = "lab_events_queue_dlq";

const MAX_RETRIES = 3;

/**
 * Declares the Exchange, DLX, Main Queue, and DLQ topologies.
 */
async function setupLabTopology() {
  const channel = await getRabbitChannel();

  // 1. Declare Main Exchange and Dead Letter Exchange (DLX)
  await channel.assertExchange(LAB_EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(DLX_NAME, "direct", { durable: true });

  // 2. Declare and Bind Dead Letter Queue (DLQ)
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);

  // 3. Declare Main Queue configured to redirect failed messages to DLX
  await channel.assertQueue(MAIN_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX_NAME,
      "x-dead-letter-routing-key": DLQ_NAME,
    },
  });

  // 4. Bind routing keys to main exchange
  await channel.bindQueue(MAIN_QUEUE, LAB_EXCHANGE, "lab.ordered");
  await channel.bindQueue(MAIN_QUEUE, LAB_EXCHANGE, "lab.completed");
  await channel.bindQueue(MAIN_QUEUE, LAB_EXCHANGE, "lab.verified");

  return channel;
}

export async function startLabWorker(): Promise<void> {
  try {
    const channel = await setupLabTopology();
    channel.prefetch(1);

    console.log(`🚀 [Lab Worker] Active and listening on "${MAIN_QUEUE}"`);

    channel.consume(MAIN_QUEUE, async (msg) => {
      if (!msg) return;

      // Extract x-death retry counter safely without breaking TypeScript
      const headers = msg.properties.headers ?? {};
      const xDeath = headers["x-death"];
      const currentRetryCount =
        Array.isArray(xDeath) && xDeath.length > 0 ? xDeath[0].count : 0;

      const routingKey = msg.fields.routingKey;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(
          `📥 [Lab Worker] Event "${routingKey}" (Attempt ${currentRetryCount + 1})`,
        );

        switch (routingKey) {
          case "lab.completed":
            await handleLabCompleted(payload);
            break;

          case "lab.verified":
            await handleLabVerified(payload);
            break;

          case "lab.ordered":
            console.log(
              `📋 [Lab Worker] Lab ordered for visit ${payload.visitId}`,
            );
            break;

          default:
            console.warn(
              `⚠️ [Lab Worker] Unhandled routing key: ${routingKey}`,
            );
        }

        // Acknowledge on success
        channel.ack(msg);
      } catch (error: any) {
        console.error(
          `❌ [Lab Worker] Failed to process ${routingKey}: ${error.message}`,
        );

        if (currentRetryCount < MAX_RETRIES) {
          console.warn(
            `🔄 [Lab Worker] Requeuing event for retry (${currentRetryCount + 1}/${MAX_RETRIES})...`,
          );
          channel.nack(msg, false, true); // Requeue = true
        } else {
          console.error(
            `☠️ [Lab Worker] Max retries (${MAX_RETRIES}) reached. Directing to DLQ "${DLQ_NAME}"`,
          );
          channel.nack(msg, false, false); // Requeue = false -> routes to DLQ
        }
      }
    });
  } catch (error: any) {
    console.error("❌ [Lab Worker] Startup error:", error.message);
  }
}

// Handler: Completed Lab
async function handleLabCompleted(data: {
  labResultId: string;
  visitId: string;
  performedById: string;
  timestamp: string;
}): Promise<void> {
  console.log(
    `📱 [Notification] Lab result #${data.labResultId} is ready! Alerting attending doctor...`,
  );
  // Add logic: Send WebSocket/push alert to physician, update visit workflow state
}

// Handler: Verified Lab
async function handleLabVerified(data: {
  labResultId: string;
  visitId: string;
  verifiedById: string;
  timestamp: string;
}): Promise<void> {
  console.log(
    `🔒 [Audit/EHR] Final verification recorded for lab #${data.labResultId} by user #${data.verifiedById}`,
  );
  // Add logic: Generate PDF lab report, trigger billing/insurance claims
}

startLabWorker();
