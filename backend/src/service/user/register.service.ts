import bcrypt from "bcrypt";
import { UserRepository } from "../../models/User/user.repository";
import { RegisterUserDTO } from "../../models/User/user.model";
import { redisClient } from "../../config/redis";
import { publishToQueue } from "../../config/rabbitmq";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerStaffUser(input: RegisterUserDTO) {
    // 1. Check existing email
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("A user with this email address already exists.");
    }

    // 2. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // 3. Save to Database via Repository
    const newUser = await this.userRepository.createUser({
      ...input,
      passwordHash,
    });

    // 4. Invalidate relevant Redis Cache (e.g., cached staff list)
    await redisClient.del("staff:list:all");

    // 5. Publish Event to RabbitMQ (e.g., trigger email/notification worker)
    await publishToQueue("user_events", "USER_REGISTERED", {
      userId: newUser.id,
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName}`,
      role: newUser.role,
      facilityId: input.facilityId,
      tempPassword: input.password,
    });

    return newUser;
  }

  //view user

  async viewUser() {
    const user = await this.userRepository.findAll();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  //find by email

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
