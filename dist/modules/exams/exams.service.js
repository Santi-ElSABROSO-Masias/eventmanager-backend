"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const db_1 = __importDefault(require("../../config/db"));
const hash_1 = require("../../utils/hash");
const crypto_1 = __importDefault(require("crypto"));
class ExamsService {
    async create(data) {
        let passwordHash = null;
        if (data.requires_password && data.password) {
            passwordHash = await (0, hash_1.hashPassword)(data.password);
        }
        return db_1.default.exam.create({
            data: {
                training_id: data.training_id,
                time_limit: data.time_limit,
                min_passing_score: data.min_passing_score,
                access_type: data.access_type,
                requires_password: data.requires_password,
                password_hash: passwordHash,
                require_name: data.require_name,
                require_dni: data.require_dni,
                require_email: data.require_email,
                require_organization: data.require_organization,
            }
        });
    }
    async addQuestion(examId, data) {
        return db_1.default.question.create({
            data: {
                exam_id: examId,
                text: data.text,
                type: data.type,
                option_a: data.option_a,
                option_b: data.option_b,
                option_c: data.option_c,
                option_d: data.option_d,
                correct_answer: data.correct_answer,
                training_tag: data.training_tag,
                order_index: data.order_index,
            }
        });
    }
    async publish(examId) {
        const publicLink = crypto_1.default.randomBytes(16).toString('hex');
        return db_1.default.exam.update({
            where: { id: examId },
            data: {
                status: 'published',
                is_published: true,
                public_link: publicLink
            }
        });
    }
    async getPublicExam(link) {
        const exam = await db_1.default.exam.findUnique({
            where: { public_link: link },
            include: {
                training: { select: { title: true } },
                questions: {
                    select: {
                        id: true,
                        text: true,
                        option_a: true,
                        option_b: true,
                        option_c: true,
                        option_d: true,
                        // Excluimos correct_answer para que no viaje al cliente
                    }
                }
            }
        });
        if (!exam || !exam.is_published) {
            throw new Error('Examen no disponible o enlace inválido');
        }
        return exam;
    }
    async submitAnswers(link, data) {
        const exam = await db_1.default.exam.findUnique({
            where: { public_link: link },
            include: { questions: true }
        });
        if (!exam || !exam.is_published) {
            throw new Error('Examen no disponible o enlace inválido');
        }
        // Verificar si ya rindió este examen
        const existingResult = await db_1.default.examResult.findUnique({
            where: { exam_id_dni: { exam_id: exam.id, dni: data.dni } }
        });
        if (existingResult) {
            throw new Error('Ya se registró un resultado para este DNI en este examen');
        }
        // Calificar
        let correctAnswersCount = 0;
        const totalQuestions = exam.questions.length;
        if (totalQuestions === 0)
            throw new Error('El examen no tiene preguntas');
        for (const question of exam.questions) {
            const userAnswer = data.answers[question.id];
            if (userAnswer === question.correct_answer) {
                correctAnswersCount++;
            }
        }
        // Cálculo estilo "sobre 20" o porcentual
        // Si queremos sobre 100
        const score = Math.round((correctAnswersCount / totalQuestions) * 100);
        const passed = score >= exam.min_passing_score;
        return db_1.default.examResult.create({
            data: {
                exam_id: exam.id,
                participant_name: data.participant_name,
                dni: data.dni,
                email: data.email,
                organization: data.organization,
                score,
                passed,
                answers: data.answers // Save user choices
            }
        });
    }
    async getResults(examId) {
        return db_1.default.examResult.findMany({
            where: { exam_id: examId },
            orderBy: { completed_at: 'desc' }
        });
    }
}
exports.ExamsService = ExamsService;
