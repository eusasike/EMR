import { Channel, ConsumeMessage } from "amqplib";
import { rabbitmq } from "../config/rabitmq";

export interface OrderCreatedPayload {
  event: string;
  data: {
    id: string;
    userId: string;
    totalAmount: number;
    createdAt: string;
  };
}

export class OrderConsumer {
  private readonly EXCHANGE_NAME = "order_events";
  private readonly QUEUE_NAME = "order_processing_queue";
  private readonly ROUTING_KEY = "order.created";

  public async startListening(): Promise<void> {
    const channel: Channel = await rabbitmq.getChannel();

    // 1. Ensure exchange exists
    await channel.assertExchange(this.EXCHANGE_NAME, "topics", {
      durable: true,
    });

    // 2. Assert durable worker queue
    await channel.assertQueue(this.QUEUE_NAME, {
      durable: true,
      deadLetterExchange: "order_events_dlx", // Optional: route failed messages to Dead Letter Exchange
    });

    // 3. Bind queue to the exchange using the routing key
    await channel.bindQueue(
      this.QUEUE_NAME,
      this.EXCHANGE_NAME,
      this.ROUTING_KEY,
    );

    // Process 1 message at a time per worker instance
    await channel.prefetch(1);

    console.log(
      `[Worker] Listening on queue "${this.QUEUE_NAME}" for routing key "${this.ROUTING_KEY}"`,
    );

    // 4. Consume messages
    await channel.consume(
      this.QUEUE_NAME,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const payload: OrderCreatedPayload = JSON.parse(
            msg.content.toString(),
          );

          console.log(
            `[Worker] Processing event "${payload.event}" for Order ID: ${payload.data.id}`,
          );

          // Business logic (e.g., email notification, inventory reservation)
          await this.processOrder(payload);

          // Acknowledge message successfully processed
          channel.ack(msg);
        } catch (error) {
          console.error("[Worker] Error processing message:", error);

          // Reject message without requeueing (sends to Dead Letter Exchange if configured)
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }, // Require explicit manual ACK
    );
  }

  private async processOrder(payload: OrderCreatedPayload): Promise<void> {
    const { id, userId } = payload.data;
    // Simulate async background task (e.g., sending order confirmation email)
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      `[Worker] Successfully sent order confirmation for Order: ${id} to User: ${userId}`,
    );
  }
}

export const orderConsumer = new OrderConsumer();
