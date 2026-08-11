import { Channel, ConsumeMessage } from "amqplib";
import { rabbitmq } from "../config/rabitmq";

export class OrderConsumerWithRetry {
  // Exchanges
  private readonly MAIN_EXCHANGE = "order_events";
  private readonly DLX_EXCHANGE = "order_dlx";

  // Queues
  private readonly MAIN_QUEUE = "order_processing_queue";
  private readonly RETRY_QUEUE = "order_retry_queue";
  private readonly DLQ_QUEUE = "order_dlq";

  // Routing Keys
  private readonly ROUTING_KEY = "order.created";
  private readonly RETRY_ROUTING_KEY = "order.created.retry";
  private readonly DLQ_ROUTING_KEY = "order.created.dlq";

  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000; // 5 seconds delay before retrying

  public async setupAndListen(): Promise<void> {
    const channel: Channel = await rabbitmq.getChannel();

    // 1. Declare Exchanges
    await channel.assertExchange(this.MAIN_EXCHANGE, "topic", {
      durable: true,
    });
    await channel.assertExchange(this.DLX_EXCHANGE, "direct", {
      durable: true,
    });

    // 2. Declare Main Processing Queue
    // Failed messages (NACK without requeue) get routed automatically to DLX_EXCHANGE
    await channel.assertQueue(this.MAIN_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": this.DLX_EXCHANGE,
        "x-dead-letter-routing-key": this.RETRY_ROUTING_KEY,
      },
    });
    await channel.bindQueue(
      this.MAIN_QUEUE,
      this.MAIN_EXCHANGE,
      this.ROUTING_KEY,
    );

    // 3. Declare Retry Queue with TTL
    // Messages wait here for 5s, then automatically dead-letter BACK to the MAIN_EXCHANGE
    await channel.assertQueue(this.RETRY_QUEUE, {
      durable: true,
      arguments: {
        "x-message-ttl": this.RETRY_DELAY_MS,
        "x-dead-letter-exchange": this.MAIN_EXCHANGE,
        "x-dead-letter-routing-key": this.ROUTING_KEY,
      },
    });
    await channel.bindQueue(
      this.RETRY_QUEUE,
      this.DLX_EXCHANGE,
      this.RETRY_ROUTING_KEY,
    );

    // 4. Declare Final Dead Letter Queue (DLQ)
    // Terminal queue for unrecoverable messages exceeding MAX_RETRIES
    await channel.assertQueue(this.DLQ_QUEUE, { durable: true });
    await channel.bindQueue(
      this.DLQ_QUEUE,
      this.DLX_EXCHANGE,
      this.DLQ_ROUTING_KEY,
    );

    // Prefetch limit
    await channel.prefetch(1);

    console.log(
      `[Worker] Setup complete. Listening on queue: "${this.MAIN_QUEUE}"`,
    );

    // 5. Start Consumer
    await channel.consume(
      this.MAIN_QUEUE,
      async (msg) => {
        if (!msg) return;
        await this.handleMessage(channel, msg);
      },
      { noAck: false },
    );
  }

  private async handleMessage(
    channel: Channel,
    msg: ConsumeMessage,
  ): Promise<void> {
    const retryCount = this.getRetryCount(msg);

    try {
      const payload = JSON.parse(msg.content.toString());
      console.log(
        `[Worker] Attempt ${retryCount + 1}/${this.MAX_RETRIES + 1} for Order ID: ${payload.data.id}`,
      );

      // Simulate a business logic error for testing
      await this.processOrder(payload);

      // Successfully processed
      channel.ack(msg);
    } catch (error) {
      console.error(
        `[Worker] Processing failed on attempt ${retryCount + 1}:`,
        (error as Error).message,
      );

      if (retryCount < this.MAX_RETRIES) {
        console.warn(
          `[Worker] Sending message to Retry Queue (Delay: ${this.RETRY_DELAY_MS}ms)`,
        );
        // NACK without requeue triggers 'x-dead-letter-exchange' (sent to RETRY_QUEUE)
        channel.nack(msg, false, false);
      } else {
        console.error(
          `[Worker] Max retries (${this.MAX_RETRIES}) reached. Moving message to DLQ.`,
        );

        // Manually publish to final DLQ routing key and ACK original message from main queue
        channel.publish(this.DLX_EXCHANGE, this.DLQ_ROUTING_KEY, msg.content, {
          headers: msg.properties.headers,
          persistent: true,
        });
        channel.ack(msg);
      }
    }
  }

  /**
   * Extracts current retry count from RabbitMQ's 'x-death' header
   */
  private getRetryCount(msg: ConsumeMessage): number {
    const xDeath = msg.properties.headers?.["x-death"];
    if (!xDeath || !Array.isArray(xDeath) || xDeath.length === 0) {
      return 0;
    }

    // Accumulate total retry count across death cycles
    return xDeath.reduce((count, entry) => count + (entry.count || 0), 0);
  }

  private async processOrder(payload: any): Promise<void> {
    // Example failure condition
    if (payload.data.totalAmount < 0) {
      throw new Error("Invalid order total amount");
    }
    // Normal processing logic...
  }
}

export const orderConsumerWithRetry = new OrderConsumerWithRetry();
