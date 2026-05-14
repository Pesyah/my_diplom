import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Users } from '../auth/entities/users.entity';
import { DocumentsService } from './documents.service';
import { FileRequeryDto } from './dto/create-document.dto';

@Controller('documents')
@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @UseGuards(AuthGuard)
    @Post('upload')
    @ApiOperation({ summary: 'Загрузить файл' })
    @ApiBody({ type: FileRequeryDto })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: Users,
    ) {
        if (!file) {
            throw new BadRequestException('Файл не загружен');
        }

        return this.documentsService.create(file, user.id);
    }
}
