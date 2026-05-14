import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSaleDto {
    @ApiProperty({ example: 'uuid', description: 'ID книги' })
    @IsNotEmpty()
    @IsUUID()
    bookId: string;
}
