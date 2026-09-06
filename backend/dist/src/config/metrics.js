"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestsTotal = exports.prometheusClient = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Clear global registry to handle hot-reloads (ts-node-dev / nodemon)
prom_client_1.default.register.clear();
exports.prometheusClient = prom_client_1.default;
// Custom metric (if needed)
exports.httpRequestsTotal = new prom_client_1.default.Counter({
    name: "http_requests_total_custom",
    help: "Total number of HTTP requests processed",
    labelNames: ["method", "route", "status"],
});
