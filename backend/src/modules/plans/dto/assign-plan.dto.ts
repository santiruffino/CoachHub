import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class AssignPlanDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}
