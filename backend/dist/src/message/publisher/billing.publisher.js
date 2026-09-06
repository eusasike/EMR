"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingPublisher = exports.BillingRoutingKey = void 0;
const rabbitmq_1 = require("../../config/rabbitmq");
const BILLING_EXCHANGE = "billing_events_exchange";
var BillingRoutingKey;
(function (BillingRoutingKey) {
    BillingRoutingKey["INVOICE_GENERATED"] = "billing.invoice.generated";
    BillingRoutingKey["PAYMENT_RECEIVED"] = "billing.payment.received";
    BillingRoutingKey["INVOICE_SETTLED"] = "billing.invoice.settled";
})(BillingRoutingKey || (exports.BillingRoutingKey = BillingRoutingKey = {}));
class BillingPublisher {
    static async publishInvoiceGenerated(data) {
        return await (0, rabbitmq_1.publishToQueue)(BILLING_EXCHANGE, BillingRoutingKey.INVOICE_GENERATED, data);
    }
    static async publishPaymentReceived(data) {
        return await (0, rabbitmq_1.publishToQueue)(BILLING_EXCHANGE, BillingRoutingKey.PAYMENT_RECEIVED, data);
    }
}
exports.BillingPublisher = BillingPublisher;
