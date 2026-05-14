import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRentDto {
    @ApiProperty({ example: 'uuid', description: 'ID книги' })
    @IsNotEmpty()
    @IsUUID()
    bookId: string;

    @ApiProperty({
        example: '2026-05-20',
        description: 'Дата начала аренды',
        type: Date,
    })
    @IsNotEmpty()
    @IsDate()
    rentStart: Date;

    @ApiProperty({
        example: '2026-05-27',
        description: 'Дата окончания аренды',
        type: Date,
    })
    @IsNotEmpty()
    @IsDate()
    rentEnd: Date;
}
