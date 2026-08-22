// messaging/pharmacy.publisher.ts
import { publishToQueue } from "../../config/rabbitmq";
import {
  PharmacyRoutingKey,
  ProductDispensedEvent,
  ReorderLevelReachedEvent,
  productDispensedEventSchema,
  reorderLevelReachedEventSchema,
} from "../../models/phamarcy/inventory.model";

const PHARMACY_EXCHANGE = "pharmacy_exchange";

export class PharmacyPublisher {
  /**
   * Publishes an event when items are successfully dispensed from stock.
   */
  static async publishProductDispensed(
    eventData: ProductDispensedEvent,
  ): Promise<boolean> {
    // Runtime schema validation prior to publishing
    const validatedData = productDispensedEventSchema.parse(eventData);

    return await publishToQueue(
      PHARMACY_EXCHANGE,
      PharmacyRoutingKey.DISPENSED,
      validatedData,
    );
  }

  /**
   * Publishes an event when stock falls to or below the specified reorder level.
   */
  static async publishReorderLevelReached(
    eventData: ReorderLevelReachedEvent,
  ): Promise<boolean> {
    // Runtime schema validation prior to publishing
    const validatedData = reorderLevelReachedEventSchema.parse(eventData);

    return await publishToQueue(
      PHARMACY_EXCHANGE,
      PharmacyRoutingKey.REORDER_LEVEL_REACHED,
      validatedData,
    );
  }
}
