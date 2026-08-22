import { getRabbitChannel, publishToQueue } from "../../config/rabbitmq";

const QUEUE_NAME = "prescription_queue";
const DLX_NAME = "prescription_dlx";
const DLQ_NAME = "prescription_queue_dlq";

export interface PrescriptionCreatedEventData {
  prescriptionId: string;
  prescriptionNumber: string;
  visitId: string;
  prescribedById: string;
  itemCount: number;
  createdAt: Date | string;
}

export class PrescriptionPublisher {
  /**
   * Asserts the DLX, DLQ, and Main Queue with DLX bindings.
   */
  private static async setupQueueTopology(): Promise<void> {
    const channel = await getRabbitChannel();

    // 1. Declare Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ)
    await channel.assertExchange(DLX_NAME, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });
    await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);

    // 2. Declare Main Queue configured with DLX
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_NAME,
        "x-dead-letter-routing-key": DLQ_NAME, // Routes failed messages to DLQ
      },
    });
  }

  public static async publishPrescriptionCreated(
    data: PrescriptionCreatedEventData,
  ): Promise<boolean> {
    // Ensure topology exists before publishing
    await this.setupQueueTopology();

    // Uses your existing unchanged publishToQueue helper
    return await publishToQueue(QUEUE_NAME, "prescription.created", data);
  }
}
