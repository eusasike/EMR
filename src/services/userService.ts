import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { rabbitmq } from "../config/rabitmq";
import {
  CreateUserDTO,
  UpdateUserDTO,
  CreateOrderDTO,
  UserWithOrdersDTO,
  UserSummaryDTO,
} from "../type/dtos";

export class UserService {
  /**
   * Create a new User
   */
  async createUser(dto: CreateUserDTO): Promise<UserSummaryDTO> {
    const user = await prisma.user.create({
      data: dto,
      select: { id: true, name: true, email: true },
    });
    return user;
  }

  /**
   * Fetch User with Orders (Redis Caching Layer)
   */
  async getUserById(id: string): Promise<UserWithOrdersDTO | null> {
    const cacheKey = `user:${id}`;

    // 1. Check Redis cache
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    // 2. Fallback to PostgreSQL via Prisma
    const user = await prisma.user.findUnique({
      where: { id },
      include: { orders: true },
    });

    // 3. Populate Redis cache for 5 minutes (300s) if found
    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), "EX", 300);
    }

    return user;
  }

  /**
   * Create an Order for a User (Invalidates Cache + Publishes RabbitMQ Event)
   */
  async createOrder(userId: string, dto: Omit<CreateOrderDTO, "userId">) {
    const order = await prisma.order.create({
      data: {
        ...dto,
        userId,
      },
    });

    // 1. Invalidate stale User cache in Redis
    await redis.del(`user:${userId}`);

    // 2. Publish event to RabbitMQ fanout/direct exchange
    const channel = await rabbitmq.getChannel();
    await channel.assertExchange("order_events", "topic", { durable: true });

    const eventPayload = { event: "ORDER_CREATED", data: order };
    channel.publish(
      "order_events",
      "order.created",
      Buffer.from(JSON.stringify(eventPayload)),
    );

    return order;
  }
}

export const userService = new UserService();
