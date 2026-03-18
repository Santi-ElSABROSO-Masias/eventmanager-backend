"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitExamSchema = exports.addQuestionSchema = exports.createExamSchema = void 0;
const zod_1 = require("zod");
exports.createExamSchema = zod_1.z.object({
    training_id: zod_1.z.string().uuid(),
    time_limit: zod_1.z.number().int().min(1).default(30),
    min_passing_score: zod_1.z.number().int().min(0).max(100).default(70),
    access_type: zod_1.z.enum(['public', 'restricted']).default('public'),
    requires_password: zod_1.z.boolean().default(false),
    password: zod_1.z.string().optional(),
    require_name: zod_1.z.boolean().default(true),
    require_dni: zod_1.z.boolean().default(true),
    require_email: zod_1.z.boolean().default(false),
    require_organization: zod_1.z.boolean().default(false),
});
exports.addQuestionSchema = zod_1.z.object({
    text: zod_1.z.string().min(5),
    type: zod_1.z.enum(['multiple']).default('multiple'),
    option_a: zod_1.z.string().min(1),
    option_b: zod_1.z.string().min(1),
    option_c: zod_1.z.string().min(1),
    option_d: zod_1.z.string().min(1),
    correct_answer: zod_1.z.number().int().min(0).max(3),
    training_tag: zod_1.z.string().optional(),
    order_index: zod_1.z.number().int().optional(),
});
exports.submitExamSchema = zod_1.z.object({
    participant_name: zod_1.z.string().min(3),
    dni: zod_1.z.string().min(8),
    email: zod_1.z.string().email().optional(),
    organization: zod_1.z.string().optional(),
    answers: zod_1.z.record(zod_1.z.string().uuid(), zod_1.z.number().int().min(0).max(3)), // { "questionId": 2 }
});
