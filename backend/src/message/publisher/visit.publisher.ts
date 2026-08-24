import { getRabbitChannel } from "../../config/rabbitmq";

export const EXCHANGES = {
  PATIENT_EVENTS: "patient_events",
  VISIT_EVENTS: "visit_events",
  DEAD_LETTER: "emr_dlx",
} as const;

export const ROUTING_KEYS = {
  PATIENT_REGISTERED: "patient.registered",
  PATIENT_UPDATED: "patient.updated",
  VISIT_CREATED: "visit.created",
  VISIT_UPDATED: "visit.updated",
} as const;

export interface VisitCreatedEventPayload {
  eventId: string;
  eventType: "VISIT_CREATED";
  timestamp: string;
  data: {
    visitId: string;
    patientId: string;
    attendingId: string;
    priority: string;
    visitType: string;
  };
}

export interface VisitUpdatedEventPayload {
  eventId: string;
  eventType: "VISIT_UPDATED";
  timestamp: string;
  data: {
    visitId: string;
    patientId: string;
    attendingId?: string;
    symptoms?: string | null;
    diagnosis?: string | null;
    icdCode?: string | null;
    priority?: string;
  };
}

/**
 * Publishes a VISIT_CREATED event to the RabbitMQ Topic Exchange.
 */
export const publishVisitCreatedEvent = async (
  payload: VisitCreatedEventPayload["data"],
): Promise<boolean> => {
  try {
    const channel = await getRabbitChannel();

    await channel.assertExchange(EXCHANGES.VISIT_EVENTS, "topic", {
      durable: true,
    });

    const fullPayload: VisitCreatedEventPayload = {
      eventId: crypto.randomUUID(),
      eventType: "VISIT_CREATED",
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const buffer = Buffer.from(JSON.stringify(fullPayload));

    const published = channel.publish(
      EXCHANGES.VISIT_EVENTS,
      ROUTING_KEYS.VISIT_CREATED,
      buffer,
      {
        persistent: true,
        contentType: "application/json",
      },
    );

    console.log(
      `📤 [RabbitMQ Publisher] Event "VISIT_CREATED" published for Visit ID: ${payload.visitId}`,
    );
    return published;
  } catch (error: any) {
    console.error(
      `❌ [RabbitMQ Publisher] Failed to publish visit created event:`,
      error.message,
    );
    throw error;
  }
};

/**
 * Publishes a VISIT_UPDATED event to the RabbitMQ Topic Exchange.
 */
export const publishVisitUpdatedEvent = async (
  payload: VisitUpdatedEventPayload["data"],
): Promise<boolean> => {
  try {
    const channel = await getRabbitChannel();

    await channel.assertExchange(EXCHANGES.VISIT_EVENTS, "topic", {
      durable: true,
    });

    const fullPayload: VisitUpdatedEventPayload = {
      eventId: crypto.randomUUID(),
      eventType: "VISIT_UPDATED",
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const buffer = Buffer.from(JSON.stringify(fullPayload));

    const published = channel.publish(
      EXCHANGES.VISIT_EVENTS,
      ROUTING_KEYS.VISIT_UPDATED,
      buffer,
      {
        persistent: true,
        contentType: "application/json",
      },
    );

    console.log(
      `📤 [RabbitMQ Publisher] Event "VISIT_UPDATED" published for Visit ID: ${payload.visitId}`,
    );
    return published;
  } catch (error: any) {
    console.error(
      `❌ [RabbitMQ Publisher] Failed to publish visit updated event:`,
      error.message,
    );
    throw error;
  }
};
