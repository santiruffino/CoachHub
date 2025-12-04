import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateCoachDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateStudentDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class UpdateCoachDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
