import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateRentDto } from './create-rent.dto';

export class UpdateRentDto extends PartialType(CreateRentDto) {
    @ApiProperty({
        example: true,
        description: 'Подтверждена ли аренда продавцом',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isAccepted?: boolean;

    @ApiProperty({
        example: 500,
        description: 'Неустойка за просрочку для будущей расписки',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    penaltyPrice?: number;
}
