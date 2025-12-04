import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SyncPushDto } from './dto/sync.dto';
import { Role } from '@prisma/client';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(private prisma: PrismaService) { }

    async bootstrap(userId: string) {
        // Fetch assigned plans
        const assignedPlans = await this.prisma.assignedPlan.findMany({
            where: {
                studentId: userId,
                isActive: true,
            },
            include: {
                plan: {
                    include: {
                        days: {
                            include: {
                                exercises: {
                                    include: {
                                        exercise: true,
                                    },
                                    orderBy: { order: 'asc' },
                                },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        // Fetch recent workout logs (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const workoutLogs = await this.prisma.workoutLog.findMany({
            where: {
                studentId: userId,
                date: {
                    gte: thirtyDaysAgo,
                },
            },
            include: {
                exerciseLogs: true,
            },
        });

        // Extract all unique exercises from plans to ensure we have their details
        // (Though they are included in the plan structure, a flat list might be useful for the frontend cache)
        const exercises = new Map();
        assignedPlans.forEach(ap => {
            ap.plan.days.forEach(day => {
                day.exercises.forEach(pe => {
                    exercises.set(pe.exercise.id, pe.exercise);
                });
            });
        });

        return {
            assignedPlans,
            workoutLogs,
            exercises: Array.from(exercises.values()),
            timestamp: Date.now(),
        };
    }

    async push(userId: string, syncPushDto: SyncPushDto) {
        const processedIds: string[] = [];
        const failedIds: string[] = [];

        for (const mutation of syncPushDto.mutations) {
            try {
                if (mutation.type === 'LOG_WORKOUT') {
                    await this.processWorkoutLog(userId, mutation.payload);
                }
                processedIds.push(mutation.id);
            } catch (error) {
                this.logger.error(`Failed to process mutation ${mutation.id}: ${error.message}`);
                failedIds.push(mutation.id);
            }
        }

        return {
            processedIds,
            failedIds,
        };
    }

    private async processWorkoutLog(userId: string, payload: any) {
        // Create WorkoutLog
        const workoutLog = await this.prisma.workoutLog.create({
            data: {
                studentId: userId,
                date: new Date(payload.timestamp || Date.now()),
                feedback: payload.feedback,
                durationMinutes: payload.durationMinutes,
            },
        });

        // Create ExerciseLogs
        if (payload.exercises && Array.isArray(payload.exercises)) {
            for (const ex of payload.exercises) {
                // ex.sets is an array of { setNumber, reps, weight, rpe }
                if (ex.sets && Array.isArray(ex.sets)) {
                    for (const set of ex.sets) {
                        await this.prisma.exerciseLog.create({
                            data: {
                                workoutLogId: workoutLog.id,
                                exerciseId: ex.exerciseId,
                                setNumber: set.setNumber,
                                reps: set.reps,
                                weight: set.weight,
                                rpe: set.rpe,
                            },
                        });
                    }
                }
            }
        }
    }
}
