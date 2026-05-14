import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Books } from 'src/books/entities/books.entity';
import { Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sales } from './entities/sale.entity';

@Injectable()
export class SaleService {
    constructor(
        @InjectRepository(Sales)
        private salesRepository: Repository<Sales>,
        @InjectRepository(Books)
        private booksRepository: Repository<Books>,
    ) {}

    async create(dto: CreateSaleDto, buyerId: string): Promise<Sales> {
        return this.salesRepository.manager.transaction(async (manager) => {
            const booksRepository = manager.getRepository(Books);
            const salesRepository = manager.getRepository(Sales);

            const book = await booksRepository.findOne({
                where: { id: dto.bookId },
                relations: {
                    users: true,
                    authors: true,
                    genres: true,
                    booksType: true,
                },
            });

            if (!book) {
                throw new NotFoundException('Книга не найдена');
            }

            if (!book.isActive) {
                throw new BadRequestException('Книга не активна');
            }

            if (book.onlyForRent) {
                throw new BadRequestException(
                    'Книга доступна только для аренды',
                );
            }

            if (book.users.id === buyerId) {
                throw new BadRequestException('Нельзя купить свою книгу');
            }

            const sale = salesRepository.create({
                books: book,
                buyer: { id: buyerId },
                seller: { id: book.users.id },
                price: book.price,
            });

            const savedSale = await salesRepository.save(sale);

            book.isActive = false;
            await booksRepository.save(book);

            return savedSale;
        });
    }

    async findAll(userId: string): Promise<Sales[]> {
        return this.salesRepository.find({
            where: [{ buyer: { id: userId } }, { seller: { id: userId } }],
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { created_at: 'DESC' },
        });
    }

    async findIncoming(userId: string): Promise<Sales[]> {
        return this.salesRepository.find({
            where: { seller: { id: userId } },
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { created_at: 'DESC' },
        });
    }

    async findOutgoing(userId: string): Promise<Sales[]> {
        return this.salesRepository.find({
            where: { buyer: { id: userId } },
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { created_at: 'DESC' },
        });
    }

    async findAllForAdmin(): Promise<Sales[]> {
        return this.salesRepository.find({
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { created_at: 'DESC' },
        });
    }

    async findOneForAdmin(id: string): Promise<Sales> {
        const sale = await this.salesRepository.findOne({
            where: { id },
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
        });

        if (!sale) {
            throw new NotFoundException('Продажа не найдена');
        }

        return sale;
    }

    async findOne(id: string, userId: string): Promise<Sales> {
        const sale = await this.salesRepository.findOne({
            where: [
                { id, buyer: { id: userId } },
                { id, seller: { id: userId } },
            ],
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
        });

        if (!sale) {
            throw new NotFoundException(
                'Продажа не найдена или доступ запрещен',
            );
        }

        return sale;
    }
}
