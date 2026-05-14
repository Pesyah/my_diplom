import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorDto {
    @ApiProperty({ example: 'Лев', description: 'Имя' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Толстой', description: 'Фамилия' })
    @IsNotEmpty()
    @IsString()
    surname: string;

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
        type: Date,
    })
    @IsNotEmpty()
    @IsDate()
    dateOfBirth: Date;

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
