import client from "prom-client";

// Clear global registry to handle hot-reloads (ts-node-dev / nodemon)
client.register.clear();

export const prometheusClient = client;

// Custom metric (if needed)
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total_custom",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status"],
});
