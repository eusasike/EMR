"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionPublisher = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const ADMISSION_EXCHANGE = "admission_exchange";
class AdmissionPublisher {
    /**
     * Publish patient.admitted event
     */
    static async publishPatientAdmitted(payload) {
        await (0, rabbitmq_1.publishToQueue)(ADMISSION_EXCHANGE, "patient.admitted", payload);
    }
    /**
     * Publish patient.discharged event
     */
    static async publishPatientDischarged(payload) {
        await (0, rabbitmq_1.publishToQueue)(ADMISSION_EXCHANGE, "patient.discharged", payload);
    }
}
exports.AdmissionPublisher = AdmissionPublisher;
