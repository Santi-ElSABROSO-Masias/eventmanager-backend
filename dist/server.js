"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const PORT = env_1.env.PORT || 4000;
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${env_1.env.PORT}`);
    console.log(`Environment: ${env_1.env.NODE_ENV}`);
    console.log(`Resolved CORS_ORIGIN: ${env_1.env.CORS_ORIGIN}`);
});
