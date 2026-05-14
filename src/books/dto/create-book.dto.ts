import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { IsUUIDArray } from 'src/auth/decorators/is-uuid-array';

// dto/create-book.dto.ts
export class CreateBookDto {
    @ApiProperty({ example: 'Война и мир', description: 'Название книги' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'ID авторов' })
    @IsNotEmpty()
    @IsUUIDArray()
    authorsIds: string[];

    @ApiProperty({ example: [1, 2], description: 'ID жанров' })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    genresIds: number[];

    @ApiProperty({ example: 1, description: 'ID типа книги' })
    @IsNotEmpty()
    @IsNumber()
    booksTypeId: number;

    @ApiProperty({ example: true, description: 'Можно ли арендовать' })
    @IsBoolean()
    @IsOptional()
    canBeRented?: boolean;

    @ApiProperty({ example: true, description: 'Только для аренды' })
    @IsBoolean()
    @IsOptional()
    onlyForRent?: boolean;

    @ApiProperty({ example: 999.99, description: 'Цена' })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        example: 'Великое произведение...',
        description: 'Описание',
    })
    @IsNotEmpty()
    @IsString()
    description: string;

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
}
