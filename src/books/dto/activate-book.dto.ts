import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ActivateBookDto {
    @ApiProperty({ example: 'uuid', description: 'ID книги' })
    @IsNotEmpty()
    @IsUUID()
    bookId: string;

    @ApiProperty({ example: '978-5-17-118356-3', description: 'ISBN' })
    @IsNotEmpty()
    @IsString()
    isbn: string;
}
