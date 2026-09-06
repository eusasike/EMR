"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabPublisher = exports.LabRoutingKey = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const LAB_EXCHANGE = "lab_events_exchange";
var LabRoutingKey;
(function (LabRoutingKey) {
    LabRoutingKey["ORDERED"] = "lab.ordered";
    LabRoutingKey["COMPLETED"] = "lab.completed";
    LabRoutingKey["VERIFIED"] = "lab.verified";
})(LabRoutingKey || (exports.LabRoutingKey = LabRoutingKey = {}));
class LabPublisher {
    static async publishLabOrdered(data) {
        return await (0, rabbitmq_1.publishToQueue)(LAB_EXCHANGE, LabRoutingKey.ORDERED, data);
    }
    static async publishLabCompleted(data) {
        return await (0, rabbitmq_1.publishToQueue)(LAB_EXCHANGE, LabRoutingKey.COMPLETED, data);
    }
    static async publishLabVerified(data) {
        return await (0, rabbitmq_1.publishToQueue)(LAB_EXCHANGE, LabRoutingKey.VERIFIED, data);
    }
}
exports.LabPublisher = LabPublisher;
