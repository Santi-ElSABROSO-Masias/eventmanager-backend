"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScheduleSchema = void 0;
const zod_1 = require("zod");
exports.generateScheduleSchema = zod_1.z.object({
    month: zod_1.z.number().int().min(1).max(12),
    year: zod_1.z.number().int().min(2024),
    templateIds: zod_1.z.array(zod_1.z.string().uuid()).optional(), // Optional list of templates to use for generation
});
