import "dotenv/config";
import amqp, { ChannelModel, Channel } from "amqplib";

class RabbitMQManager {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnecting: boolean = false;
  private readonly url: string =
    process.env.RABBITMQ_URL || "amqp://localhost:5672";

  public async getChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    if (this.isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return this.getChannel();
    }

    return await this.connect();
  }

  private async connect(): Promise<Channel> {
    this.isConnecting = true;

    try {
      console.log("🐰 [RabbitMQ] Connecting to message broker...");
      // amqp.connect() returns Promise<ChannelModel>, matching this.connection type
      this.connection = await amqp.connect(this.url);

      this.connection.on("error", (err: Error) => {
        console.error("❌ [RabbitMQ] Connection error:", err.message);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        console.warn(
          "⚠️ [RabbitMQ] Connection closed. Triggering reconnect sequence...",
        );
        this.handleDisconnect();
      });

      this.channel = await this.connection.createChannel();

      this.channel.on("error", (err: Error) => {
        console.error("❌ [RabbitMQ] Channel error:", err.message);
      });

      this.channel.on("close", () => {
        console.warn("⚠️ [RabbitMQ] Channel closed.");
        this.channel = null;
      });

      console.log("🟢 [RabbitMQ] Connected and active channel established.");
      this.isConnecting = false;
      return this.channel;
    } catch (error: any) {
      this.isConnecting = false;
      console.error("❌ [RabbitMQ] Connection attempt failed:", error.message);
      console.log("🔄 [RabbitMQ] Retrying connection in 5 seconds...");

      await new Promise((resolve) => setTimeout(resolve, 5000));
      return this.connect();
    }
  }

  private handleDisconnect(): void {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;

    setTimeout(() => {
      this.connect().catch((err) =>
        console.error("❌ [RabbitMQ] Reconnect loop failed:", err.message),
      );
    }, 3000);
  }
}

const rabbitManager = new RabbitMQManager();

export const getRabbitChannel = async (): Promise<Channel> => {
  return await rabbitManager.getChannel();
};

export const publishToQueue = async (
  queueName: string,
  event: string,
  data: Record<string, any>,
): Promise<boolean> => {
  try {
    const channel = await getRabbitChannel();
    await channel.assertQueue(queueName, { durable: true });

    const payload = Buffer.from(
      JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    );

    const sent = channel.sendToQueue(queueName, payload, { persistent: true });
    console.log(
      `📥 [RabbitMQ] Published event "${event}" to queue "${queueName}"`,
    );
    return sent;
  } catch (error: any) {
    console.error(
      `❌ [RabbitMQ] Failed to publish message to "${queueName}":`,
      error.message,
    );
    throw error;
  }
};
