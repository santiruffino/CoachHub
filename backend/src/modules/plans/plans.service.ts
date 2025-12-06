import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    async create(coachId: string, createPlanDto: CreatePlanDto) {
        const { title, description, days } = createPlanDto;

        return this.prisma.plan.create({
            data: {
                title,
                description,
                coachId,
                days: {
                    create: days.map((day) => ({
                        name: day.name,
                        order: day.order,
                        exercises: {
                            create: day.exercises.map((ex) => ({
                                exerciseId: ex.exerciseId,
                                seriesSpecType: ex.seriesSpecType,
                                sets: ex.sets,
                                reps: ex.reps,
                                rpe: ex.rpe,
                                restSeconds: ex.restSeconds,
                                order: ex.order,
                            })),
                        },
                    })),
                },
            },
            include: {
                days: {
                    include: {
                        exercises: true,
                    },
                },
            },
        });
    }

    async findAll(coachId: string) {
        return this.prisma.plan.findMany({
            where: { coachId },
            include: {
                _count: {
                    select: {
                        assignedPlans: true,
                        days: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const plan = await this.prisma.plan.findUnique({
            where: { id },
            include: {
                days: {
                    orderBy: { order: 'asc' },
                    include: {
                        exercises: {
                            orderBy: { order: 'asc' },
                            include: {
                                exercise: true,
                            },
                        },
                    },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        return plan;
    }

    async update(coachId: string, id: string, updatePlanDto: UpdatePlanDto) {
        const plan = await this.prisma.plan.findUnique({
            where: { id },
        });

        if (!plan || plan.coachId !== coachId) {
            throw new NotFoundException('Plan not found or access denied');
        }

        const { title, description, days } = updatePlanDto;

        // Transaction to ensure atomicity
        return this.prisma.$transaction(async (prisma) => {
            // 1. Update basic info
            await prisma.plan.update({
                where: { id },
                data: {
                    title,
                    description,
                },
            });

            // 2. If days are provided, replace them (and their exercises)
            if (days) {
                // Delete existing days (cascade will handle exercises)
                await prisma.planDay.deleteMany({
                    where: { planId: id },
                });

                // Create new days
                for (const day of days) {
                    await prisma.planDay.create({
                        data: {
                            planId: id,
                            name: day.name,
                            order: day.order,
                            exercises: {
                                create: day.exercises.map((ex) => ({
                                    exerciseId: ex.exerciseId,
                                    seriesSpecType: ex.seriesSpecType,
                                    sets: ex.sets,
                                    reps: ex.reps,
                                    rpe: ex.rpe,
                                    restSeconds: ex.restSeconds,
                                    order: ex.order,
                                })),
                            },
                        },
                    });
                }
            }

            return this.findOne(id);
        });
    }

    async assign(coachId: string, planId: string, assignPlanDto: AssignPlanDto) {
        const plan = await this.prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan || plan.coachId !== coachId) {
            throw new NotFoundException('Plan not found or access denied');
        }

        // Verify student belongs to coach
        const student = await this.prisma.user.findUnique({
            where: { id: assignPlanDto.studentId },
        });

        if (!student || student.coachId !== coachId) {
            throw new NotFoundException('Student not found or not assigned to you');
        }

        return this.prisma.assignedPlan.create({
            data: {
                planId,
                studentId: assignPlanDto.studentId,
                startDate: new Date(assignPlanDto.startDate),
                endDate: assignPlanDto.endDate ? new Date(assignPlanDto.endDate) : null,
            },
        });
    }
}
