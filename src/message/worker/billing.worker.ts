// src/workers/billing.worker.ts
import { getRabbitChannel } from "../../config/rabbitmq";

const BILLING_EXCHANGE = "billing_events_exchange";
const MAIN_QUEUE = "billing_events_queue";
const DLX_NAME = "billing_events_dlx";
const DLQ_NAME = "billing_events_queue_dlq";

const MAX_RETRIES = 3;

/**
 * Initializes topologies: Exchanges, Queues, DLQ, and Routing Bindings.
 */
async function setupBillingTopology() {
  const channel = await getRabbitChannel();

  // 1. Declare Main Exchange and Dead Letter Exchange
  await channel.assertExchange(BILLING_EXCHANGE, "topic", { durable: true });
  await channel.assertExchange(DLX_NAME, "direct", { durable: true });

  // 2. Declare and Bind DLQ
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);

  // 3. Declare Main Queue configured with DLX redirect on failure
  await channel.assertQueue(MAIN_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX_NAME,
      "x-dead-letter-routing-key": DLQ_NAME,
    },
  });

  // 4. Bind Billing Routing Keys
  await channel.bindQueue(
    MAIN_QUEUE,
    BILLING_EXCHANGE,
    "billing.invoice.generated",
  );
  await channel.bindQueue(
    MAIN_QUEUE,
    BILLING_EXCHANGE,
    "billing.payment.received",
  );
  await channel.bindQueue(
    MAIN_QUEUE,
    BILLING_EXCHANGE,
    "billing.invoice.settled",
  );

  return channel;
}

export async function startBillingWorker(): Promise<void> {
  try {
    const channel = await setupBillingTopology();
    channel.prefetch(1);

    console.log(`🚀 [Billing Worker] Active and listening on "${MAIN_QUEUE}"`);

    channel.consume(MAIN_QUEUE, async (msg) => {
      if (!msg) return;

      // Extract x-death retry count safely
      const headers = msg.properties.headers ?? {};
      const xDeath = headers["x-death"];
      const currentRetryCount =
        Array.isArray(xDeath) && xDeath.length > 0 ? xDeath[0].count : 0;

      const routingKey = msg.fields.routingKey;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(
          `📥 [Billing Worker] Processing "${routingKey}" (Attempt ${currentRetryCount + 1})`,
        );

        switch (routingKey) {
          case "billing.invoice.generated":
            await handleInvoiceGenerated(payload);
            break;

          case "billing.payment.received":
            await handlePaymentReceived(payload);
            break;

          case "billing.invoice.settled":
            await handleInvoiceSettled(payload);
            break;

          default:
            console.warn(
              `⚠️ [Billing Worker] Unhandled routing key: ${routingKey}`,
            );
        }

        channel.ack(msg);
      } catch (error: any) {
        console.error(
          `❌ [Billing Worker] Error processing ${routingKey}: ${error.message}`,
        );

        if (currentRetryCount < MAX_RETRIES) {
          console.warn(
            `🔄 [Billing Worker] Retrying event (${currentRetryCount + 1}/${MAX_RETRIES})...`,
          );
          channel.nack(msg, false, true); // Requeue
        } else {
          console.error(
            `☠️ [Billing Worker] Max retries reached. Routing to DLQ "${DLQ_NAME}"`,
          );
          channel.nack(msg, false, false); // Route to DLQ
        }
      }
    });
  } catch (error: any) {
    console.error("❌ [Billing Worker] Startup failed:", error.message);
  }
}

// Handler: Invoice Generated
async function handleInvoiceGenerated(data: {
  invoiceId: string;
  visitId: string;
  invoiceNumber: string;
  grandTotal: number;
  timestamp: string;
}): Promise<void> {
  console.log(
    `🧾 [Billing Event] Invoice #${data.invoiceNumber} created for Visit #${data.visitId}. Total: TZS ${data.grandTotal}`,
  );
  // Add logic: Sync with accounting software, trigger SMS invoice notification
}

// Handler: Partial/Full Payment Received
async function handlePaymentReceived(data: {
  paymentId: string;
  invoiceId: string;
  amount: number;
  balanceRemaining: number;
  paymentMethod: string;
  receivedById: string;
  timestamp: string;
}): Promise<void> {
  console.log(
    `💳 [Billing Event] Payment of TZS ${data.amount} received via ${data.paymentMethod}. Balance remaining: TZS ${data.balanceRemaining}`,
  );
  // Add logic: Send digital receipt to patient, update cash drawer logs
}

// Handler: Invoice Fully Settled
async function handleInvoiceSettled(data: {
  invoiceId: string;
  visitId: string;
  settledAt: string;
}): Promise<void> {
  console.log(
    `🎉 [Billing Event] Invoice #${data.invoiceId} FULLY SETTLED. Unlocking patient discharge workflow...`,
  );
  // Add logic: Mark visit ready for discharge, notify pharmacy to release takeaway medications
}

startBillingWorker();
