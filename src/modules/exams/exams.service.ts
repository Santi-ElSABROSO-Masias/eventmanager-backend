import prisma from '../../config/db';
import { CreateExamDto, AddQuestionDto, SubmitExamDto } from './dto/exams.dto';
import { hashPassword } from '../../utils/hash';
import crypto from 'crypto';

export class ExamsService {
    async create(data: CreateExamDto) {
        let passwordHash = null;
        if (data.requires_password && data.password) {
            passwordHash = await hashPassword(data.password);
        }

        return prisma.exam.create({
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

    async addQuestion(examId: string, data: AddQuestionDto) {
        return prisma.question.create({
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

    async publish(examId: string) {
        const publicLink = crypto.randomBytes(16).toString('hex');

        return prisma.exam.update({
            where: { id: examId },
            data: {
                status: 'published',
                is_published: true,
                public_link: publicLink
            }
        });
    }

    async getPublicExam(link: string) {
        const exam = await prisma.exam.findUnique({
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

    async submitAnswers(link: string, data: SubmitExamDto) {
        const exam = await prisma.exam.findUnique({
            where: { public_link: link },
            include: { questions: true }
        });

        if (!exam || !exam.is_published) {
            throw new Error('Examen no disponible o enlace inválido');
        }

        // Verificar si ya rindió este examen
        const existingResult = await prisma.examResult.findUnique({
            where: { exam_id_dni: { exam_id: exam.id, dni: data.dni } }
        });

        if (existingResult) {
            throw new Error('Ya se registró un resultado para este DNI en este examen');
        }

        // Calificar
        let correctAnswersCount = 0;
        const totalQuestions = exam.questions.length;

        if (totalQuestions === 0) throw new Error('El examen no tiene preguntas');

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

        return prisma.examResult.create({
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

    async getResults(examId: string) {
        return prisma.examResult.findMany({
            where: { exam_id: examId },
            orderBy: { completed_at: 'desc' }
        });
    }
}
