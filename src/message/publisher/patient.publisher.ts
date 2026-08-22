import { getRabbitChannel } from "../../config/rabbitmq"; // Your RabbitMQ config file

export const EXCHANGES = {
  PATIENT_EVENTS: "patient_events",
  DEAD_LETTER: "emr_dlx",
} as const;

export const ROUTING_KEYS = {
  PATIENT_REGISTERED: "patient.registered",
  PATIENT_UPDATED: "patient.updated",
} as const;

export interface PatientRegisteredEventPayload {
  eventId: string;
  eventType: string;
  timestamp: string;
  data: {
    patientId: string;
    mrn: string;
    fullName: string;
    phone?: string | null;
  };
}

/**
 * Publishes a PATIENT_REGISTERED event to the RabbitMQ Topic Exchange.
 */
export const publishPatientRegisteredEvent = async (
  payload: PatientRegisteredEventPayload["data"],
): Promise<boolean> => {
  try {
    const channel = await getRabbitChannel();

    // Ensure exchange exists
    await channel.assertExchange(EXCHANGES.PATIENT_EVENTS, "topic", {
      durable: true,
    });

    const fullPayload: PatientRegisteredEventPayload = {
      eventId: crypto.randomUUID(),
      eventType: "PATIENT_REGISTERED",
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const buffer = Buffer.from(JSON.stringify(fullPayload));

    const published = channel.publish(
      EXCHANGES.PATIENT_EVENTS,
      ROUTING_KEYS.PATIENT_REGISTERED,
      buffer,
      {
        persistent: true,
        contentType: "application/json",
      },
    );

    console.log(
      `📤 [RabbitMQ Publisher] Event "PATIENT_REGISTERED" published for MRN: ${payload.mrn}`,
    );
    return published;
  } catch (error: any) {
    console.error(
      `❌ [RabbitMQ Publisher] Failed to publish registration event:`,
      error.message,
    );
    throw error;
  }
};
