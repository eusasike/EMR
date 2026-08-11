import amqp, { ChannelModel, Channel } from "amqplib";

class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

    try {
      // amqp.connect returns ChannelModel in modern @types/amqplib
      const conn: ChannelModel = await amqp.connect(url);
      this.connection = conn;
      this.channel = await conn.createChannel();

      console.log("🐇 RabbitMQ connected successfully.");

      conn.on("error", (err) => {
        console.error("❌ RabbitMQ Connection Error:", err);
        this.connection = null;
        this.channel = null;
      });

      return this.channel;
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

export const rabbitmq = new RabbitMQService();
