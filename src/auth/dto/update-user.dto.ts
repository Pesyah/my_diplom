import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    surname: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    phone: string;
}
