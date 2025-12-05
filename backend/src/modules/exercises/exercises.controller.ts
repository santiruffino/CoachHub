import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) { }

    @Post()
    @Roles(Role.COACH)
    create(@CurrentUser() user: any, @Body() createExerciseDto: CreateExerciseDto) {
        return this.exercisesService.create(user.userId, createExerciseDto);
    }

    @Get()
    @Roles(Role.COACH, Role.STUDENT)
    async findAll(@CurrentUser() user: any) {
        // For students, we might want to show exercises assigned to them or their coach's exercises
        // For now, let's assume students can see global + their coach's exercises if we pass the coachId
        // But typically students just see exercises in their plan. 
        // This endpoint is primarily for Coaches to pick exercises.
        // If a student calls this, we might need to know their coach. 
        // For simplicity, let's allow fetching based on the user's context.
        try {
            return await this.exercisesService.findAll(user.userId);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            throw error;
        }
    }

    @Post('presign')
    @Roles(Role.COACH)
    async getPresignedUrl(@Body() body: { fileName: string; fileType: string }) {
        return this.exercisesService.getPresignedUrl(body.fileName, body.fileType);
    }

    @Delete(':id')
    @Roles(Role.COACH)
    remove(@Param('id') id: string) {
        return this.exercisesService.remove(id);
    }
}
