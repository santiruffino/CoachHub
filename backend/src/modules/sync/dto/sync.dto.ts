import { IsArray, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncPushDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MutationDto)
    mutations: MutationDto[];
}

export class MutationDto {
    @IsString()
    id: string;

    @IsString()
    type: 'LOG_WORKOUT';

    @IsNumber()
    timestamp: number;

    @IsObject()
    payload: any;
}
