// src/message/subscriber/vital-sign.subscriber.ts
import { Channel, ConsumeMessage } from "amqplib";
import { getRabbitChannel } from "../../config/rabbitmq";
import {
  VitalSignsRecordedEvent,
  VitalSignsUpdatedEvent,
  VitalSignsRoutingKey,
} from "../publisher/vital-sign.publisher";

const MAIN_EXCHANGE = "vital_signs_exchange";
const RETRY_EXCHANGE = "retry.vital_signs_exchange";
const DLX_NAME = "dlx.vital_signs";
const DLQ_NAME = "vital_signs_dlq";
const DLQ_ROUTING_KEY = "vital_signs.dead_letter";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000; // 2 seconds (Backoff: 2s -> 4s -> 8s)

export async function startVitalSignsSubscribers(): Promise<void> {
  const channel: Channel = await getRabbitChannel();

  // 1. Declare Main Exchange & Dead Letter Exchange (DLX)
  await channel.assertExchange(MAIN_EXCHANGE, "direct", { durable: true });
  await channel.assertExchange(RETRY_EXCHANGE, "direct", { durable: true });
  await channel.assertExchange(DLX_NAME, "direct", { durable: true });

  // 2. Declare DLQ
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_ROUTING_KEY);

  // 3. Declare Main Queues bound to DLX on hard failure
  const queueOptions = {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX_NAME,
      "x-dead-letter-routing-key": DLQ_ROUTING_KEY,
    },
  };

  await channel.assertQueue("critical_vitals_queue", queueOptions);
  await channel.bindQueue(
    "critical_vitals_queue",
    MAIN_EXCHANGE,
    VitalSignsRoutingKey.CRITICAL,
  );

  await channel.assertQueue("vital_signs_queue", queueOptions);
  await channel.bindQueue(
    "vital_signs_queue",
    MAIN_EXCHANGE,
    VitalSignsRoutingKey.RECORDED,
  );
  await channel.bindQueue(
    "vital_signs_queue",
    MAIN_EXCHANGE,
    VitalSignsRoutingKey.UPDATED,
  );

  await channel.prefetch(10);

  // 4. Consumer with Exponential Backoff Retry Strategy
  await channel.consume(
    "critical_vitals_queue",
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: VitalSignsRecordedEvent = JSON.parse(
          msg.content.toString(),
        );
        await processCriticalVitalsAlert(event);
        channel.ack(msg);
      } catch (error) {
        console.error("[Critical Consumer] Processing error:", error);
        await handleRetryWithBackoff(channel, msg, "critical_vitals_queue");
      }
    },
    { noAck: false },
  );

  console.log("⚡ [RabbitMQ] Consumers initialized with exponential backoff.");
}

/**
 * Handles exponential backoff retries using dedicated TTL delay queues
 */
async function handleRetryWithBackoff(
  channel: Channel,
  msg: ConsumeMessage,
  originalQueue: string,
): Promise<void> {
  const headers = msg.properties.headers || {};
  const currentRetryCount = (headers["x-retry-count"] as number) || 0;

  if (currentRetryCount < MAX_RETRIES) {
    const nextRetryCount = currentRetryCount + 1;
    // Calculate exponential delay: 2000 * (2 ^ 0) = 2s, 2000 * (2 ^ 1) = 4s, 2000 * (2 ^ 2) = 8s
    const delayMs = INITIAL_DELAY_MS * Math.pow(2, currentRetryCount);
    const delayQueueName = `retry_wait_${delayMs}ms_queue`;

    console.warn(
      `⚠️ [Retry ${nextRetryCount}/${MAX_RETRIES}] Scheduling retry for message in ${delayMs}ms...`,
    );

    // Assert temporary delay queue that routes back to main queue once TTL expires
    await channel.assertQueue(delayQueueName, {
      durable: true,
      arguments: {
        "x-message-ttl": delayMs,
        "x-dead-letter-exchange": "", // Default exchange
        "x-dead-letter-routing-key": originalQueue, // Return to original queue after delay
      },
    });

    // Publish to delay queue with updated retry counter header
    channel.sendToQueue(delayQueueName, msg.content, {
      persistent: true,
      headers: {
        ...headers,
        "x-retry-count": nextRetryCount,
        "x-original-queue": originalQueue,
      },
    });

    // Acknowledge the original message so it doesn't block the queue
    channel.ack(msg);
  } else {
    console.error(
      `❌ [Max Retries Reached] Exceeded ${MAX_RETRIES} attempts. Rejecting to DLQ...`,
    );
    // nack with requeue=false automatically sends message to the configured DLX
    channel.nack(msg, false, false);
  }
}

async function processCriticalVitalsAlert(event: VitalSignsRecordedEvent) {
  // Business logic execution
}
