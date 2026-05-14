import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Books } from 'src/books/entities/books.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Rent } from './entities/rent.entity';

@Injectable()
export class RentService {
    constructor(
        @InjectRepository(Rent)
        private rentRepository: Repository<Rent>,
        @InjectRepository(Books)
        private booksRepository: Repository<Books>,
    ) {}

    async create(dto: CreateRentDto, buyerId: string): Promise<Rent> {
        const { rentStart, rentEnd } = this.getValidRentDates(
            dto.rentStart,
            dto.rentEnd,
        );

        const book = await this.booksRepository.findOne({
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

        this.assertBookCanBeRented(book, buyerId);
        await this.assertNoAcceptedRentOverlap(book.id, rentStart, rentEnd);

        const rent = this.rentRepository.create({
            books: book,
            buyer: { id: buyerId },
            seller: { id: book.users.id },
            rentStart,
            rentEnd,
            isAccepted: false,
        });

        return this.rentRepository.save(rent);
    }

    async findAll(userId: string): Promise<Rent[]> {
        return this.rentRepository.find({
            where: [{ buyer: { id: userId } }, { seller: { id: userId } }],
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { rentStart: 'DESC' },
        });
    }

    async findIncoming(userId: string): Promise<Rent[]> {
        return this.rentRepository.find({
            where: { seller: { id: userId } },
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { rentStart: 'DESC' },
        });
    }

    async findOutgoing(userId: string): Promise<Rent[]> {
        return this.rentRepository.find({
            where: { buyer: { id: userId } },
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { rentStart: 'DESC' },
        });
    }

    async findAllForAdmin(): Promise<Rent[]> {
        return this.rentRepository.find({
            relations: {
                books: { authors: true, genres: true, booksType: true },
                buyer: true,
                seller: true,
            },
            order: { rentStart: 'DESC' },
        });
    }

    async findOneForAdmin(id: string): Promise<Rent> {
        const rent = await this.rentRepository.findOne({
            where: { id },
            relations: {
                books: {
                    authors: true,
                    genres: true,
                    booksType: true,
                    users: true,
                },
                buyer: true,
                seller: true,
            },
        });

        if (!rent) {
            throw new NotFoundException('Аренда не найдена');
        }

        return rent;
    }

    async findOne(id: string, userId: string): Promise<Rent> {
        const rent = await this.findRentForUser(id, userId);
        if (!rent) {
            throw new NotFoundException(
                'Аренда не найдена или доступ запрещен',
            );
        }

        return rent;
    }

    async accept(id: string, sellerId: string): Promise<Rent> {
        const rent = await this.rentRepository.findOne({
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

        if (!rent) {
            throw new NotFoundException('Аренда не найдена');
        }

        if (rent.seller.id !== sellerId) {
            throw new ForbiddenException(
                'Подтвердить аренду может только продавец',
            );
        }

        if (rent.isAccepted) {
            throw new BadRequestException('Аренда уже подтверждена');
        }

        this.assertBookCanBeRented(rent.books, rent.buyer.id);
        await this.assertNoAcceptedRentOverlap(
            rent.books.id,
            rent.rentStart,
            rent.rentEnd,
            rent.id,
        );

        rent.isAccepted = true;
        return this.rentRepository.save(rent);
    }

    async update(
        id: string,
        dto: UpdateRentDto,
        userId: string,
    ): Promise<Rent> {
        const rent = await this.findRentForUser(id, userId);
        if (!rent) {
            throw new NotFoundException(
                'Аренда не найдена или доступ запрещен',
            );
        }

        const isBuyer = rent.buyer.id === userId;
        const isSeller = rent.seller.id === userId;

        if (dto.isAccepted !== undefined) {
            if (!isSeller) {
                throw new ForbiddenException(
                    'Изменять подтверждение может только продавец',
                );
            }

            if (dto.isAccepted) {
                await this.assertNoAcceptedRentOverlap(
                    rent.books.id,
                    rent.rentStart,
                    rent.rentEnd,
                    rent.id,
                );
            }

            rent.isAccepted = dto.isAccepted;
        }

        if (
            dto.bookId !== undefined ||
            dto.rentStart !== undefined ||
            dto.rentEnd !== undefined
        ) {
            if (!isBuyer) {
                throw new ForbiddenException(
                    'Изменять заявку на аренду может только арендатор',
                );
            }

            if (rent.isAccepted) {
                throw new BadRequestException(
                    'Нельзя менять уже подтвержденную аренду',
                );
            }

            const nextBookId = dto.bookId ?? rent.books.id;
            const nextStart = dto.rentStart ?? rent.rentStart;
            const nextEnd = dto.rentEnd ?? rent.rentEnd;
            const { rentStart, rentEnd } = this.getValidRentDates(
                nextStart,
                nextEnd,
            );

            const book =
                nextBookId === rent.books.id
                    ? rent.books
                    : await this.booksRepository.findOne({
                          where: { id: nextBookId },
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

            this.assertBookCanBeRented(book, userId);
            await this.assertNoAcceptedRentOverlap(
                book.id,
                rentStart,
                rentEnd,
                rent.id,
            );

            rent.books = book;
            rent.seller = book.users;
            rent.rentStart = rentStart;
            rent.rentEnd = rentEnd;
        }

        if (dto.penaltyPrice !== undefined) {
            if (!isSeller) {
                throw new ForbiddenException(
                    'РќР°Р·РЅР°С‡Р°С‚СЊ РЅРµСѓСЃС‚РѕР№РєСѓ РјРѕР¶РµС‚ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»РµС† РєРЅРёРіРё',
                );
            }

            rent.penaltyPrice = dto.penaltyPrice;
        }

        return this.rentRepository.save(rent);
    }

    async remove(id: string, userId: string): Promise<void> {
        const rent = await this.findRentForUser(id, userId);
        if (!rent) {
            throw new NotFoundException(
                'Аренда не найдена или доступ запрещен',
            );
        }

        await this.rentRepository.remove(rent);
    }

    private async findRentForUser(
        id: string,
        userId: string,
    ): Promise<Rent | null> {
        return this.rentRepository.findOne({
            where: [
                { id, buyer: { id: userId } },
                { id, seller: { id: userId } },
            ],
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
    }

    private getValidRentDates(
        rawStart: string | Date,
        rawEnd: string | Date,
    ): { rentStart: Date; rentEnd: Date } {
        const rentStart = new Date(rawStart);
        const rentEnd = new Date(rawEnd);

        if (
            Number.isNaN(rentStart.getTime()) ||
            Number.isNaN(rentEnd.getTime())
        ) {
            throw new BadRequestException('Некорректные даты аренды');
        }

        if (rentStart >= rentEnd) {
            throw new BadRequestException(
                'Дата окончания аренды должна быть позже даты начала',
            );
        }

        return { rentStart, rentEnd };
    }

    private assertBookCanBeRented(book: Books, buyerId: string): void {
        if (!book.isActive) {
            throw new BadRequestException('Книга не активна');
        }

        if (!book.canBeRented) {
            throw new BadRequestException('Книга недоступна для аренды');
        }

        if (book.users.id === buyerId) {
            throw new BadRequestException('Нельзя арендовать свою книгу');
        }
    }

    private async assertNoAcceptedRentOverlap(
        bookId: string,
        rentStart: Date,
        rentEnd: Date,
        ignoredRentId?: string,
    ): Promise<void> {
        const overlappingRent = await this.rentRepository.findOne({
            where: {
                books: { id: bookId },
                isAccepted: true,
                rentStart: LessThan(rentEnd),
                rentEnd: MoreThan(rentStart),
            },
            relations: { books: true },
        });

        if (overlappingRent && overlappingRent.id !== ignoredRentId) {
            throw new BadRequestException(
                'Книга уже подтверждена в аренду на выбранные даты',
            );
        }
    }
}
