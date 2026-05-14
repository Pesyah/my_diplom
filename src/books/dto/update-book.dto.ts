// dto/update-book.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { IsUUIDArray } from 'src/auth/decorators/is-uuid-array';
export class UpdateBookDto {
    @ApiProperty({ example: 'uuid', description: 'ID книги' })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({
        example: 'Война и мир',
        description: 'Название книги',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        example: ['uuid1', 'uuid2'],
        description: 'ID авторов (полная замена)',
        required: false,
    })
    @IsUUIDArray()
    @IsOptional()
    authorsIds?: string[];

    @ApiProperty({
        example: [1, 2],
        description: 'ID жанров (полная замена)',
        required: false,
    })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    genresIds?: number[];

    @ApiProperty({ example: 1, description: 'ID типа книги', required: false })
    @IsNumber()
    @IsOptional()
    booksTypeId?: number;

    @ApiProperty({
        example: true,
        description: 'Можно ли арендовать',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    canBeRented?: boolean;

    @ApiProperty({
        example: true,
        description: 'Только для аренды',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    onlyForRent?: boolean;

    @ApiProperty({ example: 999.99, description: 'Цена', required: false })
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: 'Великое произведение...',
        description: 'Описание',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 'avatar.jpg',
        description: 'Аватар',
        required: false,
    })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({
        example: ['photo1.jpg', 'photo2.jpg'],
        description: 'Фото',
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photoGallery?: string[];

    @ApiProperty({
        example: '978-5-17-118356-3',
        description: 'ISBN',
        required: false,
    })
    @IsString()
    @IsOptional()
    isbn?: string;

    @ApiProperty({
        example: false,
        description: 'Активна ли книга',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
