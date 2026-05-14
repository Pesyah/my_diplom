// books.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivateBookDto } from './dto/activate-book.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Authors } from './entities/authors.entity';
import { BooksType } from './entities/books-type.entity';
import { Books } from './entities/books.entity';
import { Genres } from './entities/genres.entity';

// books.service.ts (добавлен метод activate и обновлен create/update)
@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Books)
        private booksRepository: Repository<Books>,
        @InjectRepository(Authors)
        private authorsRepository: Repository<Authors>,
        @InjectRepository(Genres)
        private genresRepository: Repository<Genres>,
        @InjectRepository(BooksType)
        private booksTypeRepository: Repository<BooksType>,
    ) {}

    // Публичные методы
    async findAll(): Promise<Books[]> {
        return this.booksRepository.find({
            where: { isActive: true }, // Только активные книги
            relations: { authors: true, genres: true, booksType: true },
        });
    }

    async findById(id: string): Promise<Books> {
        const book = await this.booksRepository.findOne({
            where: { id },
            relations: { authors: true, genres: true, booksType: true },
        });
        if (!book) throw new NotFoundException('Книга не найдена');
        return book;
    }

    async findAllAuthors(): Promise<Authors[]> {
        return this.authorsRepository.find();
    }

    async findAuthorById(id: string): Promise<Authors> {
        const author = await this.authorsRepository.findOne({ where: { id } });
        if (!author) throw new NotFoundException('Автор не найден');
        return author;
    }

    // Юзерские методы
    async findByUser(userId: string): Promise<Books[]> {
        return this.booksRepository.find({
            where: { users: { id: userId } },
            relations: { authors: true, genres: true, booksType: true },
        });
    }

    async create(dto: CreateBookDto, userId: string): Promise<Books> {
        if (dto.onlyForRent && !dto.canBeRented) {
            throw new BadRequestException(
                'Только для аренды требует разрешения аренды',
            );
        }

        const authors = await this.authorsRepository.findBy({
            id: In(dto.authorsIds),
        });
        if (authors.length !== dto.authorsIds.length) {
            throw new NotFoundException('Авторы не найдены');
        }

        const genres = await this.genresRepository.findBy({
            id: In(dto.genresIds),
        });
        if (genres.length !== dto.genresIds.length) {
            throw new NotFoundException('Жанры не найдены');
        }

        const booksType = await this.booksTypeRepository.findOne({
            where: { id: dto.booksTypeId },
        });
        if (!booksType) throw new NotFoundException('Тип книги не найден');

        const book = this.booksRepository.create({
            name: dto.name,
            authors,
            genres,
            booksType,
            canBeRented: dto.canBeRented ?? false,
            onlyForRent: dto.onlyForRent ?? false,
            price: dto.price,
            description: dto.description,
            avatar: dto.avatar,
            photoGallery: dto.photoGallery || [],
            isbn: dto.isbn,
            isActive: false, // Всегда false при создании
            users: { id: userId },
        });

        return this.booksRepository.save(book);
    }

    async activate(dto: ActivateBookDto, userId: string): Promise<Books> {
        const book = await this.booksRepository.findOne({
            where: { id: dto.bookId, users: { id: userId } },
        });

        if (!book) {
            throw new NotFoundException('Книга не найдена или доступ запрещен');
        }

        if (book.isActive) {
            throw new BadRequestException('Книга уже активирована');
        }

        if (!dto.isbn) {
            throw new BadRequestException(
                'ISBN обязателен для активации книги',
            );
        }

        book.isbn = dto.isbn;
        book.isActive = true;

        return this.booksRepository.save(book);
    }

    async update(dto: UpdateBookDto, userId: string): Promise<Books> {
        const book = await this.booksRepository.findOne({
            where: { id: dto.id, users: { id: userId } },
            relations: { authors: true, genres: true, booksType: true },
        });

        if (!book) {
            throw new NotFoundException('Книга не найдена или доступ запрещен');
        }

        if (!book.isActive && dto.isActive === true) {
            throw new BadRequestException(
                'Нельзя активировать книгу через update, используйте activate',
            );
        }

        if (dto.onlyForRent !== undefined && dto.canBeRented !== undefined) {
            if (dto.onlyForRent && !dto.canBeRented) {
                throw new BadRequestException(
                    'Только для аренды требует разрешения аренды',
                );
            }
        }

        // Полная замена авторов
        if (dto.authorsIds) {
            const authors = await this.authorsRepository.findBy({
                id: In(dto.authorsIds),
            });
            if (authors.length !== dto.authorsIds.length) {
                throw new NotFoundException('Авторы не найдены');
            }
            book.authors = authors;
        }

        // Полная замена жанров
        if (dto.genresIds) {
            const genres = await this.genresRepository.findBy({
                id: In(dto.genresIds),
            });
            if (genres.length !== dto.genresIds.length) {
                throw new NotFoundException('Жанры не найдены');
            }
            book.genres = genres;
        }

        if (dto.booksTypeId) {
            const booksType = await this.booksTypeRepository.findOne({
                where: { id: dto.booksTypeId },
            });
            if (!booksType) throw new NotFoundException('Тип книги не найден');
            book.booksType = booksType;
        }

        // Не позволяем менять isActive через update (кроме как на false для деактивации)
        if (dto.isActive === false && book.isActive === true) {
            book.isActive = false;
        }

        // Убираем isActive из dto чтобы не перезаписать
        const { isActive, ...updateData } = dto;
        Object.assign(book, updateData);

        return this.booksRepository.save(book);
    }

    async delete(id: string, userId: string): Promise<void> {
        const book = await this.booksRepository.findOne({
            where: { id, users: { id: userId } },
            relations: { rent: true },
        });

        if (!book) {
            throw new NotFoundException('Книга не найдена или доступ запрещен');
        }

        const hasAcceptedRent = book.rent?.some((rent) => rent.isAccepted);
        if (hasAcceptedRent) {
            throw new BadRequestException(
                'Нельзя удалить книгу с активной арендой',
            );
        }

        await this.booksRepository.remove(book);
    }

    // Админские методы для авторов
    async createAuthor(dto: CreateAuthorDto): Promise<Authors> {
        const author = this.authorsRepository.create(dto);
        return this.authorsRepository.save(author);
    }

    async updateAuthor(dto: UpdateAuthorDto): Promise<Authors> {
        const author = await this.authorsRepository.findOne({
            where: { id: dto.id },
        });
        if (!author) throw new NotFoundException('Автор не найден');

        Object.assign(author, dto);
        return this.authorsRepository.save(author);
    }

    async deleteAuthor(id: string): Promise<void> {
        const booksCount = await this.booksRepository.count({
            where: { authors: { id } },
        });

        if (booksCount > 0) {
            throw new BadRequestException('Нельзя удалить автора с книгами');
        }

        await this.authorsRepository.delete(id);
    }
}
