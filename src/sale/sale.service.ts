import {
    BadRequestException,
    ForbiddenException,
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

            const acceptedSale = await salesRepository.findOne({
                where: { books: { id: book.id }, isAccepted: true },
                relations: { books: true },
            });

            if (acceptedSale) {
                throw new BadRequestException('Книга уже продана');
            }

            const pendingSale = await salesRepository.findOne({
                where: {
                    books: { id: book.id },
                    buyer: { id: buyerId },
                    isAccepted: false,
                },
                relations: { books: true, buyer: true },
            });

            if (pendingSale) {
                throw new BadRequestException(
                    'Заявка на покупку этой книги уже создана',
                );
            }

            const sale = salesRepository.create({
                books: book,
                buyer: { id: buyerId },
                seller: { id: book.users.id },
                price: book.price,
                isAccepted: false,
            });

            return salesRepository.save(sale);
        });
    }

    async accept(id: string, sellerId: string): Promise<Sales> {
        return this.salesRepository.manager.transaction(async (manager) => {
            const booksRepository = manager.getRepository(Books);
            const salesRepository = manager.getRepository(Sales);

            const sale = await salesRepository.findOne({
                where: { id },
                relations: {
                    books: {
                        users: true,
                        authors: true,
                        genres: true,
                        booksType: true,
                    },
                    buyer: true,
                    seller: true,
                },
            });

            if (!sale) {
                throw new NotFoundException('Продажа не найдена');
            }

            if (!sale.books) {
                throw new BadRequestException('Книга в продаже не найдена');
            }

            if (sale.seller.id !== sellerId) {
                throw new ForbiddenException(
                    'Подтвердить покупку может только продавец',
                );
            }

            if (sale.isAccepted) {
                throw new BadRequestException('Покупка уже подтверждена');
            }

            const book = await booksRepository.findOne({
                where: { id: sale.books.id },
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

            if (book.users.id !== sellerId) {
                throw new ForbiddenException(
                    'Подтвердить покупку может только владелец книги',
                );
            }

            if (!book.isActive) {
                throw new BadRequestException('Книга уже недоступна');
            }

            if (book.onlyForRent) {
                throw new BadRequestException(
                    'Книга доступна только для аренды',
                );
            }

            const acceptedSale = await salesRepository.findOne({
                where: { books: { id: book.id }, isAccepted: true },
                relations: { books: true },
            });

            if (acceptedSale && acceptedSale.id !== sale.id) {
                throw new BadRequestException('Книга уже продана');
            }

            const deactivateResult = await booksRepository.update(
                { id: book.id, isActive: true, onlyForRent: false },
                { isActive: false },
            );

            if (deactivateResult.affected !== 1) {
                throw new BadRequestException('Книга уже недоступна');
            }

            book.isActive = false;
            sale.books = book;
            sale.isAccepted = true;

            return salesRepository.save(sale);
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
