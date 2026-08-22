// src/workers/prescription.worker.ts
import { getRabbitChannel } from "../../config/rabbitmq";

const QUEUE_NAME = "prescription_queue";
const MAX_RETRIES = 3;

async function startPrescriptionWorker(): Promise<void> {
  try {
    const channel = await getRabbitChannel();

    // Process 1 message at a time per worker instance
    channel.prefetch(1);

    console.log(`🚀 [Worker] Active and consuming from "${QUEUE_NAME}"...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      // Extract x-death header safely with optional chaining & nullish coalescing
      const headers = msg.properties.headers ?? {};
      const xDeath = headers["x-death"];
      const currentRetryCount =
        Array.isArray(xDeath) && xDeath.length > 0 ? xDeath[0].count : 0;

      try {
        const payload = JSON.parse(msg.content.toString());
        const { event, data, timestamp } = payload;

        console.log(
          `📥 [Worker] Processing "${event}" (Attempt ${currentRetryCount + 1})`,
        );

        // Execute processing logic
        await handlePrescriptionEvent(event, data);

        // Acknowledge on success
        channel.ack(msg);
      } catch (error: any) {
        console.error(`❌ [Worker] Error processing message: ${error.message}`);

        if (currentRetryCount < MAX_RETRIES) {
          console.warn(
            `🔄 [Worker] Requeuing message for retry (${currentRetryCount + 1}/${MAX_RETRIES})...`,
          );
          // Requeue back into main queue for another attempt
          channel.nack(msg, false, true);
        } else {
          console.error(
            `☠️ [Worker] Max retries (${MAX_RETRIES}) reached. Routing message to DLQ!`,
          );
          // Requeue = false -> Triggers RabbitMQ to route message to DLX
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error: any) {
    console.error(`❌ [Worker] Worker startup failed:`, error.message);
  }
}

async function handlePrescriptionEvent(
  event: string,
  data: any,
): Promise<void> {
  if (event === "prescription.created") {
    // Add processing logic
  }
}

startPrescriptionWorker();
