import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SeriesSpecType } from '@prisma/client';

export class PlanExerciseDto {
    @IsString()
    @IsNotEmpty()
    exerciseId: string;

    @IsEnum(SeriesSpecType)
    seriesSpecType: SeriesSpecType;

    @IsInt()
    sets: number;

    @IsString()
    @IsOptional()
    reps?: string;

    @IsInt()
    @IsOptional()
    rpe?: number;

    @IsInt()
    @IsOptional()
    restSeconds?: number;

    @IsInt()
    order: number;
}

export class PlanDayDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    order: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanExerciseDto)
    exercises: PlanExerciseDto[];
}

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlanDayDto)
    days: PlanDayDto[];
}
