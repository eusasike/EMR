import { publishToQueue } from "../../config/rabbitmq";

const BILLING_EXCHANGE = "billing_events_exchange";

export enum BillingRoutingKey {
  INVOICE_GENERATED = "billing.invoice.generated",
  PAYMENT_RECEIVED = "billing.payment.received",
  INVOICE_SETTLED = "billing.invoice.settled",
}

export class BillingPublisher {
  public static async publishInvoiceGenerated(data: {
    invoiceId: string;
    visitId: string;
    invoiceNumber: string;
    grandTotal: number;
    timestamp: string;
  }) {
    return await publishToQueue(
      BILLING_EXCHANGE,
      BillingRoutingKey.INVOICE_GENERATED,
      data,
    );
  }

  public static async publishPaymentReceived(data: {
    paymentId: string;
    invoiceId: string;
    amount: number;
    balanceRemaining: number;
    paymentMethod: string;
    timestamp: string;
  }) {
    return await publishToQueue(
      BILLING_EXCHANGE,
      BillingRoutingKey.PAYMENT_RECEIVED,
      data,
    );
  }
}
