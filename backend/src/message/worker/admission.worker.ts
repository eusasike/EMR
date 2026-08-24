// src/workers/admission-billing.consumer.ts

import amqp from "amqplib";
import { PrismaClient, ChargeType, InvoiceStatus } from "@prisma/client";
import { PatientDischargedEventPayload } from "../publisher/admission.publisher";

const prisma = new PrismaClient();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const ADMISSION_EXCHANGE = "admission_exchange";
const ROUTING_KEY = "patient.discharged";
const QUEUE_NAME = "billing_admission_discharged_queue";

export async function startAdmissionBillingConsumer(): Promise<void> {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 1. Assert Topic Exchange
    await channel.assertExchange(ADMISSION_EXCHANGE, "topic", {
      durable: true,
    });

    // 2. Assert Queue & Bind to Routing Key
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, ADMISSION_EXCHANGE, ROUTING_KEY);

    await channel.prefetch(1);

    console.log(
      `[*] Admission Billing Consumer listening on queue: ${QUEUE_NAME}`,
    );

    // 3. Consume Messages
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const payload: PatientDischargedEventPayload = JSON.parse(
          msg.content.toString(),
        );

        console.log(
          `[x] Processing discharge billing item for Admission: ${payload.admissionNumber}`,
        );

        await processBedBilling(payload);

        // Acknowledge processing success
        channel.ack(msg);
      } catch (error) {
        console.error(`[!] Error processing admission billing event:`, error);
        // Nack without requeue to avoid infinite loop (or route to DLQ)
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error("Failed to start Admission Billing Consumer worker:", error);
    process.exit(1);
  }
}

/**
 * Creates an InvoiceItem for ward stay and updates parent Invoice totals.
 */
async function processBedBilling(
  payload: PatientDischargedEventPayload,
): Promise<void> {
  const { admissionId, admissionNumber, visitId, patientId, bedId, totalDays } =
    payload;

  await prisma.$transaction(async (tx) => {
    // 1. Fetch Bed & Ward details to get daily rate
    const bed = await tx.bed.findUnique({
      where: { id: bedId },
      include: { ward: true },
    });

    if (!bed || !bed.ward) {
      throw new Error(`Bed or associated Ward not found for Bed ID: ${bedId}`);
    }

    const unitPrice = Number(bed.ward.dailyRate);
    const totalPrice = unitPrice * totalDays;
    const description = `Ward Stay Charge: ${bed.ward.name} (Bed ${bed.bedNumber}) - ${totalDays} day(s) @ ${unitPrice}/day`;

    // 2. Find active unpaid/partially paid Invoice for this visit
    let invoice = await tx.invoice.findFirst({
      where: {
        visitId,
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
      },
    });

    // 3. Create parent Invoice if non-existent
    if (!invoice) {
      const invoiceNumber = `INV-${Date.now()}`;
      invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          visitId,
          patientId,
          subtotal: 0,
          totalAmount: 0,
          amountPaid: 0,
          balanceDue: 0,
          status: InvoiceStatus.UNPAID,
        },
      });
    }

    // 4. Create the itemized InvoiceItem record
    await tx.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        chargeType: ChargeType.WARD_STAY,
        referenceId: admissionId,
        description,
        quantity: totalDays,
        unitPrice,
        totalPrice,
      },
    });

    // 5. Recalculate Invoice totals safely
    const updatedSubtotal = Number(invoice.subtotal) + totalPrice;
    const updatedTotalAmount = Number(invoice.totalAmount) + totalPrice;
    const updatedBalanceDue = updatedTotalAmount - Number(invoice.amountPaid);

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        subtotal: updatedSubtotal,
        totalAmount: updatedTotalAmount,
        balanceDue: updatedBalanceDue,
      },
    });

    console.log(
      `[✓] Added InvoiceItem (${description}) to Invoice ${updatedInvoice.invoiceNumber}. New Total: ${updatedInvoice.totalAmount}`,
    );
  });
}

// Enable direct worker execution
if (require.main === module) {
  startAdmissionBillingConsumer();
}
