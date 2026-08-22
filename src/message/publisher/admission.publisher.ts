import { publishToQueue } from "../../config/rabbitmq";

const ADMISSION_EXCHANGE = "admission_exchange";

export interface PatientAdmittedEventPayload {
  admissionId: string;
  admissionNumber: string;
  visitId: string;
  patientId: string;
  bedId: string;
  wardId: string;
  dailyRate: number;
  admittedAt: string;
}

export interface PatientDischargedEventPayload {
  admissionId: string;
  admissionNumber: string;
  visitId: string;
  patientId: string;
  bedId: string;
  dischargedAt: string;
  totalDays: number;
}

export class AdmissionPublisher {
  /**
   * Publish patient.admitted event
   */
  public static async publishPatientAdmitted(
    payload: PatientAdmittedEventPayload,
  ): Promise<void> {
    await publishToQueue(ADMISSION_EXCHANGE, "patient.admitted", payload);
  }

  /**
   * Publish patient.discharged event
   */
  public static async publishPatientDischarged(
    payload: PatientDischargedEventPayload,
  ): Promise<void> {
    await publishToQueue(ADMISSION_EXCHANGE, "patient.discharged", payload);
  }
}
