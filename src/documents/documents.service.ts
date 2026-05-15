import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
    private readonly uploadDir = 'uploads/documents';

    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
    ) {
        this.ensureUploadDir();
    }

    private async ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async create(file: Express.Multer.File, userId: string): Promise<Document> {
        try {
            const fileExtension = path.extname(file.originalname);
            const uniqueFilename = `${uuidv4()}${fileExtension}`;
            const filePath = path.join(this.uploadDir, uniqueFilename);

            await fs.writeFile(filePath, file.buffer);

            const document = this.documentRepository.create({
                filename: uniqueFilename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: filePath,
                users: { id: userId },
            });
            console.log(document);
            return await this.documentRepository.save(document);
        } catch (error) {
            console.log(error);
            throw new BadRequestException(
                `Ошибка при сохранении файла: ${error.message}`,
            );
        }
    }

    async getUserDocuments(
        userId: string,
        page: number,
        limit: number,
    ): Promise<{ items: Document[]; total: number }> {
        const [items, total] = await this.documentRepository.findAndCount({
            where: { users: { id: userId } },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { items, total };
    }

    async findOne(id: string): Promise<Document> {
        const document = await this.documentRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!document) {
            throw new NotFoundException('Документ не найден');
        }

        return document;
    }

    async remove(id: string, userId: string): Promise<void> {
        const document = await this.findOne(id);

        try {
            await fs.unlink(document.path);
        } catch (error) {
            console.error(`Ошибка при удалении файла: ${error.message}`);
        }

        await this.documentRepository.remove(document);
    }
}
