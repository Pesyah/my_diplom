import { ApiProperty } from '@nestjs/swagger';
import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class UpdateAuthorDto {
    @ApiProperty({ example: 'uuid', description: 'ID автора' })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ example: 'Лев', description: 'Имя', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: 'Толстой',
        description: 'Фамилия',
        required: false,
    })
    @IsString()
    @IsOptional()
    surname?: string;

    @ApiProperty({
        example: 'Николаевич',
        description: 'Отчество',
        required: false,
    })
    @IsString()
    @IsOptional()
    patronymic?: string;

    @ApiProperty({
        example: '1828-09-09',
        description: 'Дата рождения',
        required: false,
        type: Date,
    })
    @IsDate()
    @IsOptional()
    dateOfBirth?: Date;

    @ApiProperty({
        example: '1910-11-20',
        description: 'Дата смерти',
        required: false,
        type: Date,
    })
    @IsDate()
    @IsOptional()
    dateOfDeath?: Date;
}
