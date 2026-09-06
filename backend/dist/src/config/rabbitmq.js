"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = exports.getRabbitChannel = void 0;
require("dotenv/config");
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMQManager {
    connection = null;
    channel = null;
    isConnecting = false;
    url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    async getChannel() {
        if (this.channel) {
            return this.channel;
        }
        if (this.isConnecting) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return this.getChannel();
        }
        return await this.connect();
    }
    async connect() {
        this.isConnecting = true;
        try {
            console.log("🐰 [RabbitMQ] Connecting to message broker...");
            // amqp.connect() returns Promise<ChannelModel>, matching this.connection type
            this.connection = await amqplib_1.default.connect(this.url);
            this.connection.on("error", (err) => {
                console.error("❌ [RabbitMQ] Connection error:", err.message);
                this.handleDisconnect();
            });
            this.connection.on("close", () => {
                console.warn("⚠️ [RabbitMQ] Connection closed. Triggering reconnect sequence...");
                this.handleDisconnect();
            });
            this.channel = await this.connection.createChannel();
            this.channel.on("error", (err) => {
                console.error("❌ [RabbitMQ] Channel error:", err.message);
            });
            this.channel.on("close", () => {
                console.warn("⚠️ [RabbitMQ] Channel closed.");
                this.channel = null;
            });
            console.log("🟢 [RabbitMQ] Connected and active channel established.");
            this.isConnecting = false;
            return this.channel;
        }
        catch (error) {
            this.isConnecting = false;
            console.error("❌ [RabbitMQ] Connection attempt failed:", error.message);
            console.log("🔄 [RabbitMQ] Retrying connection in 5 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return this.connect();
        }
    }
    handleDisconnect() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        setTimeout(() => {
            this.connect().catch((err) => console.error("❌ [RabbitMQ] Reconnect loop failed:", err.message));
        }, 3000);
    }
}
const rabbitManager = new RabbitMQManager();
const getRabbitChannel = async () => {
    return await rabbitManager.getChannel();
};
exports.getRabbitChannel = getRabbitChannel;
const publishToQueue = async (queueName, event, data) => {
    try {
        const channel = await (0, exports.getRabbitChannel)();
        await channel.assertQueue(queueName, { durable: true });
        const payload = Buffer.from(JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString(),
        }));
        const sent = channel.sendToQueue(queueName, payload, { persistent: true });
        console.log(`📥 [RabbitMQ] Published event "${event}" to queue "${queueName}"`);
        return sent;
    }
    catch (error) {
        console.error(`❌ [RabbitMQ] Failed to publish message to "${queueName}":`, error.message);
        throw error;
    }
};
exports.publishToQueue = publishToQueue;
