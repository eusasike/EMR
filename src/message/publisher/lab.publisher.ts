import { publishToQueue } from "../../config/rabbitmq";

const LAB_EXCHANGE = "lab_events_exchange";

export enum LabRoutingKey {
  ORDERED = "lab.ordered",
  COMPLETED = "lab.completed",
  VERIFIED = "lab.verified",
}

export class LabPublisher {
  public static async publishLabOrdered(data: {
    labResultId: string;
    visitId: string;
    providedServiceId: string;
    timestamp: string;
  }) {
    return await publishToQueue(LAB_EXCHANGE, LabRoutingKey.ORDERED, data);
  }

  public static async publishLabCompleted(data: {
    labResultId: string;
    visitId: string;
    performedById: string;
    timestamp: string;
  }) {
    return await publishToQueue(LAB_EXCHANGE, LabRoutingKey.COMPLETED, data);
  }

  public static async publishLabVerified(data: {
    labResultId: string;
    visitId: string;
    verifiedById: string;
    timestamp: string;
  }) {
    return await publishToQueue(LAB_EXCHANGE, LabRoutingKey.VERIFIED, data);
  }
}
