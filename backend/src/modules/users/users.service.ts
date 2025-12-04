import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCoachDto, UpdateCoachDto, CreateStudentDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) { }

    async createCoach(createCoachDto: CreateCoachDto) {
        this.logger.log(`Creating coach with email: ${createCoachDto.email}`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createCoachDto.email },
        });

        if (existingUser) {
            this.logger.warn(`Failed to create coach: Email ${createCoachDto.email} already exists`);
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createCoachDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: createCoachDto.email,
                password: hashedPassword,
                name: createCoachDto.name,
                role: Role.COACH,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async createStudent(createStudentDto: CreateStudentDto, coachId: string) {
        this.logger.log(`Creating student with email: ${createStudentDto.email} for coach: ${coachId}`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createStudentDto.email },
        });

        if (existingUser) {
            this.logger.warn(`Failed to create student: Email ${createStudentDto.email} already exists`);
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: createStudentDto.email,
                password: hashedPassword,
                name: createStudentDto.name,
                role: Role.STUDENT,
                coachId: coachId, // Assign to coach
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async findAllStudentsForCoach(coachId: string) {
        return this.prisma.user.findMany({
            where: {
                role: Role.STUDENT,
                coachId: coachId
            },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { assignedPlans: true, workoutLogs: true },
                },
            },
        });
    }

    async findAllCoaches() {
        return this.prisma.user.findMany({
            where: { role: Role.COACH },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { students: true, createdPlans: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            this.logger.warn(`User not found: ${id}`);
            throw new NotFoundException('User not found');
        }
        const { password, ...result } = user;
        return result;
    }

    async updateCoach(id: string, updateCoachDto: UpdateCoachDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateCoachDto,
        });
    }

    async deleteCoach(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false }, // Soft delete
        });
    }

    async getCoachStats(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { students: true, createdPlans: true },
                },
            },
        });

        if (!user || user.role !== Role.COACH) {
            this.logger.warn(`Coach stats not found or user is not a coach: ${id}`);
            throw new NotFoundException('Coach not found');
        }

        return {
            studentCount: user._count.students,
            planCount: user._count.createdPlans,
        };
    }
    async getCoachDashboardStats(coachId: string) {
        const totalStudents = await this.prisma.user.count({
            where: {
                role: Role.STUDENT,
                coachId: coachId,
            },
        });

        const totalPlans = await this.prisma.plan.count({
            where: {
                coachId: coachId,
            },
        });

        const activeAssignments = await this.prisma.assignedPlan.count({
            where: {
                plan: {
                    coachId: coachId,
                },
                isActive: true,
            },
        });

        return {
            totalStudents,
            totalPlans,
            activeAssignments,
        };
    }
}
