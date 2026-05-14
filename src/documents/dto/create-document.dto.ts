import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {}

export class FileRequeryDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true,
    })
    @IsNotEmpty()
    file: Express.Multer.File;
}
