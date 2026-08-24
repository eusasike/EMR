// message/subscriber/medical-service.subscriber.ts
import { Channel, ConsumeMessage } from "amqplib";
import { getRabbitChannel } from "../../config/rabbitmq";
import {
  ServiceRoutingKey,
  serviceProvidedEventSchema,
  ServiceProvidedEvent,
} from "../../models/clinical/medical-service.model";

const MEDICAL_EXCHANGE = "medical_exchange";
const SERVICE_PROVIDED_QUEUE = "billing_service_provided_queue";
const DEAD_LETTER_EXCHANGE = "medical_exchange_dlx";
const DEAD_LETTER_QUEUE = "billing_service_provided_dlq";

/**
 * Initializes and starts consuming `service.provided` events
 */
export async function startServiceProvidedSubscriber(): Promise<void> {
  const channel: Channel = await getRabbitChannel();
  // 1. Setup Dead Letter Exchange and Queue for unprocessable messages
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, "direct", {
    durable: true,
  });
  await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(
    DEAD_LETTER_QUEUE,
    DEAD_LETTER_EXCHANGE,
    SERVICE_PROVIDED_QUEUE,
  );

  // 2. Ensure main topic exchange exists
  await channel.assertExchange(MEDICAL_EXCHANGE, "topic", { durable: true });

  // 3. Assert primary queue configured with Dead Letter options
  await channel.assertQueue(SERVICE_PROVIDED_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DEAD_LETTER_EXCHANGE,
      "x-dead-letter-routing-key": SERVICE_PROVIDED_QUEUE,
    },
  });

  await channel.bindQueue(
    SERVICE_PROVIDED_QUEUE,
    MEDICAL_EXCHANGE,
    ServiceRoutingKey.PROVIDED,
  );

  // 4. Limit unacknowledged messages per consumer
  await channel.prefetch(1);

  console.log(`[*] Subscribed to queue '${SERVICE_PROVIDED_QUEUE}'`);

  // 5. Start consuming
  await channel.consume(
    SERVICE_PROVIDED_QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const rawContent = JSON.parse(msg.content.toString());

        // Validate event structure against Zod schema (guarantees providedById)
        const event: ServiceProvidedEvent =
          serviceProvidedEventSchema.parse(rawContent);

        // Process downstream business logic
        await handleServiceProvided(event);

        channel.ack(msg);
      } catch (error) {
        console.error(
          "[RabbitMQ] Error processing service.provided event:",
          error,
        );

        // Send invalid/corrupted payloads directly to DLQ without requeueing
        const isValidationError =
          error instanceof Error &&
          (error.name === "ZodError" || error instanceof SyntaxError);

        channel.nack(msg, false, !isValidationError);
      }
    },
    { noAck: false },
  );
}

/**
 * Downstream consumer handler for service provided events
 */
async function handleServiceProvided(
  event: ServiceProvidedEvent,
): Promise<void> {
  const {
    providedServiceId,
    visitId,
    serviceId,
    providedById,
    unitPrice,
    timestamp,
  } = event;

  console.log(
    `[Service Provided Event] Service ${serviceId} recorded for visit ${visitId} by staff member ${providedById}. Total: $${unitPrice}`,
  );

  // Downstream tasks:
  // - Post line item to billing service
  // - Audit clinician activity with providedById
  // - Broadcast real-time nursing update
}
