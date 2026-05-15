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
import { BooksPriceHistory } from './entities/books-price-history.entity';
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
        @InjectRepository(BooksPriceHistory)
        private booksPriceHistoryRepository: Repository<BooksPriceHistory>,
    ) {}

    // Публичные методы
    async findAll(): Promise<Books[]> {
        const books = await this.booksRepository.find({
            where: { isActive: true }, // Только активные книги
            relations: {
                authors: true,
                genres: true,
                booksType: true,
                priceHistory: true,
            },
        });

        return this.sortBooksPriceHistory(books);
    }

    async findById(id: string): Promise<Books> {
        const book = await this.booksRepository.findOne({
            where: { id },
            relations: {
                authors: true,
                genres: true,
                booksType: true,
                priceHistory: true,
            },
        });
        if (!book) throw new NotFoundException('Книга не найдена');
        return this.sortBookPriceHistory(book);
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
        const books = await this.booksRepository.find({
            where: { users: { id: userId } },
            relations: {
                authors: true,
                genres: true,
                booksType: true,
                priceHistory: true,
            },
        });

        return this.sortBooksPriceHistory(books);
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

        const savedBook = await this.booksRepository.save(book);
        await this.incrementAuthorsBooksCount(authors);
        await this.incrementGenresBooksCount(genres);
        await this.createPriceHistory(savedBook, savedBook.price);

        return savedBook;
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

        const previousAuthors = [...(book.authors ?? [])];
        const previousGenres = [...(book.genres ?? [])];
        const previousPrice = Number(book.price);

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
        const {
            isActive,
            authorsIds,
            genresIds,
            booksTypeId,
            id,
            ...updateData
        } = dto;
        Object.assign(book, updateData);

        const savedBook = await this.booksRepository.save(book);

        await this.syncAuthorsBooksCount(previousAuthors, savedBook.authors ?? []);
        await this.syncGenresBooksCount(previousGenres, savedBook.genres ?? []);

        if (dto.price !== undefined && Number(dto.price) !== previousPrice) {
            await this.createPriceHistory(savedBook, dto.price);
        }

        return savedBook;
    }

    async delete(id: string, userId: string): Promise<void> {
        const book = await this.booksRepository.findOne({
            where: { id, users: { id: userId } },
            relations: { authors: true, genres: true, rent: true },
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
        await this.decrementAuthorsBooksCount(book.authors ?? []);
        await this.decrementGenresBooksCount(book.genres ?? []);
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

    private sortBooksPriceHistory(books: Books[]): Books[] {
        return books.map((book) => this.sortBookPriceHistory(book));
    }

    private sortBookPriceHistory(book: Books): Books {
        book.priceHistory = [...(book.priceHistory ?? [])].sort(
            (left, right) =>
                left.created_at.getTime() - right.created_at.getTime(),
        );

        return book;
    }

    private async createPriceHistory(book: Books, price: number) {
        const priceHistory = this.booksPriceHistoryRepository.create({
            books: { id: book.id },
            price,
        });

        await this.booksPriceHistoryRepository.save(priceHistory);
    }

    private async incrementAuthorsBooksCount(authors: Authors[]) {
        for (const author of authors) {
            await this.authorsRepository.increment(
                { id: author.id },
                'booksCount',
                1,
            );
        }
    }

    private async decrementAuthorsBooksCount(authors: Authors[]) {
        for (const author of authors) {
            await this.authorsRepository.decrement(
                { id: author.id },
                'booksCount',
                1,
            );
        }
    }

    private async incrementGenresBooksCount(genres: Genres[]) {
        for (const genre of genres) {
            await this.genresRepository.increment(
                { id: genre.id },
                'countBooksWithGenre',
                1,
            );
        }
    }

    private async decrementGenresBooksCount(genres: Genres[]) {
        for (const genre of genres) {
            await this.genresRepository.decrement(
                { id: genre.id },
                'countBooksWithGenre',
                1,
            );
        }
    }

    private async syncAuthorsBooksCount(
        previousAuthors: Authors[],
        currentAuthors: Authors[],
    ) {
        const previousIds = new Set(previousAuthors.map((author) => author.id));
        const currentIds = new Set(currentAuthors.map((author) => author.id));

        await this.decrementAuthorsBooksCount(
            previousAuthors.filter((author) => !currentIds.has(author.id)),
        );
        await this.incrementAuthorsBooksCount(
            currentAuthors.filter((author) => !previousIds.has(author.id)),
        );
    }

    private async syncGenresBooksCount(
        previousGenres: Genres[],
        currentGenres: Genres[],
    ) {
        const previousIds = new Set(previousGenres.map((genre) => genre.id));
        const currentIds = new Set(currentGenres.map((genre) => genre.id));

        await this.decrementGenresBooksCount(
            previousGenres.filter((genre) => !currentIds.has(genre.id)),
        );
        await this.incrementGenresBooksCount(
            currentGenres.filter((genre) => !previousIds.has(genre.id)),
        );
    }
}
