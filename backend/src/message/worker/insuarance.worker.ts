// src/workers/claims.worker.ts

import { ConsumeMessage } from "amqplib";
import { getRabbitChannel } from "../../config/rabbitmq";
import {
  ClaimCreatedPayload,
  ClaimProcessedPayload,
} from "../publisher/insuarance.publisher";

const EXCHANGE_NAME = "billing_exchange";
const MAIN_QUEUE = "billing_claims_queue";
const DLQ_EXCHANGE = "billing_dlx";
const DLQ_QUEUE = "billing_claims_dlq";

export class ClaimsWorker {
  public async start(): Promise<void> {
    try {
      console.log("[Claims Worker] Initializing RabbitMQ connection...");

      // Utilize existing channel setup from your rabbitMQClient
      const channel = await getRabbitChannel();

      // Ensure 1 message per worker at a time
      await channel.prefetch(1);

      // 1. Setup Dead Letter Exchange & Queue
      await channel.assertExchange(DLQ_EXCHANGE, "direct", { durable: true });
      await channel.assertQueue(DLQ_QUEUE, { durable: true });
      await channel.bindQueue(DLQ_QUEUE, DLQ_EXCHANGE, "claims.deadletter");

      // 2. Setup Main Exchange & Queue with DLQ Dead-Lettering
      await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
      await channel.assertQueue(MAIN_QUEUE, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": DLQ_EXCHANGE,
          "x-dead-letter-routing-key": "claims.deadletter",
        },
      });

      // 3. Bind routing keys
      await channel.bindQueue(MAIN_QUEUE, EXCHANGE_NAME, "claim.created");
      await channel.bindQueue(MAIN_QUEUE, EXCHANGE_NAME, "claim.processed");

      console.log(`[*] Claims Worker listening on queue: ${MAIN_QUEUE}`);

      // 4. Start consuming
      await channel.consume(
        MAIN_QUEUE,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          const routingKey = msg.fields.routingKey;
          const content = msg.content.toString();

          try {
            const data = JSON.parse(content);

            if (routingKey === "claim.created") {
              await this.handleClaimCreated(data as ClaimCreatedPayload);
            } else if (routingKey === "claim.processed") {
              await this.handleClaimProcessed(data as ClaimProcessedPayload);
            }

            channel.ack(msg);
          } catch (error) {
            console.error(
              `[Claims Worker Error] Failed processing ${routingKey}:`,
              error,
            );
            // Requeue false sends failed message directly to DLQ
            channel.nack(msg, false, false);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.error("[Claims Worker Fatal] Failed to launch worker:", error);
      process.exit(1);
    }
  }

  private async handleClaimCreated(
    payload: ClaimCreatedPayload,
  ): Promise<void> {
    console.log(`\n--- [EVENT] claim.created ---`);
    console.log(
      `Claim ID: ${payload.claimId} | Claim #: ${payload.claimNumber}`,
    );
    console.log(`Requested Amount: ${payload.requestedAmount} TZS`);
    // Business logic: Send notification, trigger 3rd-party provider verification, etc.
  }

  private async handleClaimProcessed(
    payload: ClaimProcessedPayload,
  ): Promise<void> {
    console.log(`\n--- [EVENT] claim.processed ---`);
    console.log(`Claim ID: ${payload.claimId} | Status: ${payload.status}`);
    console.log(
      `Approved: ${payload.approvedAmount} TZS | Co-Pay: ${payload.coPayAmount} TZS`,
    );
    // Business logic: Update accounting ledger, send billing receipt SMS, etc.
  }
}

// Auto-run if executed directly
const worker = new ClaimsWorker();
worker.start();
