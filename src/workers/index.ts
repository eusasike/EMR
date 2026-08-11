import { orderConsumer } from "./orderConsumer";

async function bootstrapWorker() {
  console.log("🚀 Initializing background workers...");
  try {
    await orderConsumer.startListening();
  } catch (error) {
    console.error("Failed to start worker process:", error);
    process.exit(1);
  }
}

bootstrapWorker();
