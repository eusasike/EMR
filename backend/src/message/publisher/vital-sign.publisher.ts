import { publishToQueue } from "../../config/rabbitmq";
import { redisClient } from "../../config/redis";
import { TriagePriority } from "@prisma/client";

export const VITAL_SIGNS_EXCHANGE = "vital_signs_exchange";

export enum VitalSignsRoutingKey {
  RECORDED = "vital_signs.recorded",
  UPDATED = "vital_signs.updated",
  CRITICAL = "vital_signs.critical",
}

export interface VitalSignsRecordedEvent {
  vitalSignsId: string;
  visitId: string;
  patientId: string;
  recordedById: string;
  priority: TriagePriority;
  spo2: number;
  systolicBP: number;
  diastolicBP: number;
  pulseRate: number;
  timestamp: string;
}

export interface VitalSignsUpdatedEvent {
  vitalSignsId: string;
  visitId: string;
  priority: TriagePriority;
}

/**
 * Dispatches vital signs creation events to RabbitMQ queues.
 */
export async function publishVitalSignsRecordedEvent(
  eventPayload: VitalSignsRecordedEvent,
): Promise<void> {
  try {
    const isCritical = eventPayload.priority === TriagePriority.RED;
    const targetQueue = isCritical
      ? "critical_vitals_queue"
      : "vital_signs_queue";
    const eventName = isCritical
      ? VitalSignsRoutingKey.CRITICAL
      : VitalSignsRoutingKey.RECORDED;

    await publishToQueue(targetQueue, eventName, eventPayload);
  } catch (error) {
    console.error(
      "[VitalSignsPublisher] Failed to queue vital sign recorded event:",
      error,
    );
  }
}

/**
 * Dispatches vital signs modification events to RabbitMQ queues.
 */
export async function publishVitalSignsUpdatedEvent(
  eventPayload: VitalSignsUpdatedEvent,
): Promise<void> {
  try {
    await publishToQueue(
      "vital_signs_queue",
      VitalSignsRoutingKey.UPDATED,
      eventPayload,
    );
  } catch (error) {
    console.error(
      "[VitalSignsPublisher] Failed to queue vital sign updated event:",
      error,
    );
  }
}

/**
 * Pushes critical alerts to Redis Pub/Sub for immediate WebSocket broadcast.
 */
export async function publishRealtimeAlertEvent(
  eventPayload: VitalSignsRecordedEvent,
): Promise<void> {
  try {
    if (
      eventPayload.priority === TriagePriority.RED &&
      (redisClient.status === "ready" || redisClient.status === "connect")
    ) {
      await redisClient.publish(
        "emergency:alerts",
        JSON.stringify(eventPayload),
      );
    }
  } catch (error) {
    console.error(
      "[VitalSignsPublisher] Failed to publish Redis alert:",
      error,
    );
  }
}
