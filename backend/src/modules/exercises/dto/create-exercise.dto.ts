import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { SeriesSpecType } from '@prisma/client';

export class CreateExerciseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    muscleGroup?: string;
}
