import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleType } from 'src/auth/entities/user-roles.entity';
import { Authors } from 'src/books/entities/authors.entity';
import { BooksType } from 'src/books/entities/books-type.entity';
import { Genres } from 'src/books/entities/genres.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(UserRoleType)
        private readonly userRoleTypeRepository: Repository<UserRoleType>,
        @InjectRepository(BooksType)
        private readonly booksTypeRepository: Repository<BooksType>,
        @InjectRepository(Genres)
        private readonly genresRepository: Repository<Genres>,
        @InjectRepository(Authors)
        private readonly authorsRepository: Repository<Authors>,
    ) {
        this.runSeeds();
    }

    async runSeeds() {
        await this.userRoleType();
        await this.booksType();
        await this.genres();
        await this.authors();
    }

    async userRoleType() {
        await this.userRoleTypeRepository.save([
            this.userRoleTypeRepository.create({
                id: 1,
                name: 'user',
            }),
            this.userRoleTypeRepository.create({
                id: 2,
                name: 'admin',
            }),
        ]);
    }

    async booksType() {
        await this.createMissing(this.booksTypeRepository, [
            { id: 1, name: 'электронная' },
            { id: 2, name: 'бумажная' },
            { id: 3, name: 'аудио' },
        ]);
    }

    async genres() {
        await this.createMissing(this.genresRepository, [
            { id: 1, name: 'Классика', countBooksWithGenre: 0 },
            { id: 2, name: 'Современная проза', countBooksWithGenre: 0 },
            { id: 3, name: 'Фантастика', countBooksWithGenre: 0 },
            { id: 4, name: 'Фэнтези', countBooksWithGenre: 0 },
            { id: 5, name: 'Детективы', countBooksWithGenre: 0 },
            { id: 6, name: 'Триллеры', countBooksWithGenre: 0 },
            { id: 7, name: 'Романтика', countBooksWithGenre: 0 },
            { id: 8, name: 'Приключения', countBooksWithGenre: 0 },
            { id: 9, name: 'Ужасы', countBooksWithGenre: 0 },
            { id: 10, name: 'История', countBooksWithGenre: 0 },
            { id: 11, name: 'Биографии и мемуары', countBooksWithGenre: 0 },
            { id: 12, name: 'Наука и образование', countBooksWithGenre: 0 },
            { id: 13, name: 'Бизнес и экономика', countBooksWithGenre: 0 },
            { id: 14, name: 'Психология', countBooksWithGenre: 0 },
            { id: 15, name: 'Саморазвитие', countBooksWithGenre: 0 },
            { id: 16, name: 'Философия', countBooksWithGenre: 0 },
            { id: 17, name: 'Детская литература', countBooksWithGenre: 0 },
            { id: 18, name: 'Подростковая литература', countBooksWithGenre: 0 },
            { id: 19, name: 'Поэзия', countBooksWithGenre: 0 },
            { id: 20, name: 'Драма', countBooksWithGenre: 0 },
            {
                id: 21,
                name: 'Комиксы и графические романы',
                countBooksWithGenre: 0,
            },
            { id: 22, name: 'Компьютеры и IT', countBooksWithGenre: 0 },
            { id: 23, name: 'Искусство и культура', countBooksWithGenre: 0 },
            { id: 24, name: 'Здоровье', countBooksWithGenre: 0 },
        ]);
    }

    async authors() {
        const authors: Array<Partial<Authors>> = [
            {
                name: 'Лев',
                surname: 'Толстой',
                patronymic: 'Николаевич',
                dateOfBirth: new Date('1828-09-09'),
                dateOfDeath: new Date('1910-11-20'),
            },
            {
                name: 'Федор',
                surname: 'Достоевский',
                patronymic: 'Михайлович',
                dateOfBirth: new Date('1821-11-11'),
                dateOfDeath: new Date('1881-02-09'),
            },
            {
                name: 'Александр',
                surname: 'Пушкин',
                patronymic: 'Сергеевич',
                dateOfBirth: new Date('1799-06-06'),
                dateOfDeath: new Date('1837-02-10'),
            },
            {
                name: 'Антон',
                surname: 'Чехов',
                patronymic: 'Павлович',
                dateOfBirth: new Date('1860-01-29'),
                dateOfDeath: new Date('1904-07-15'),
            },
            {
                name: 'Михаил',
                surname: 'Булгаков',
                patronymic: 'Афанасьевич',
                dateOfBirth: new Date('1891-05-15'),
                dateOfDeath: new Date('1940-03-10'),
            },
            {
                name: 'Николай',
                surname: 'Гоголь',
                patronymic: 'Васильевич',
                dateOfBirth: new Date('1809-04-01'),
                dateOfDeath: new Date('1852-03-04'),
            },
            {
                name: 'Иван',
                surname: 'Тургенев',
                patronymic: 'Сергеевич',
                dateOfBirth: new Date('1818-11-09'),
                dateOfDeath: new Date('1883-09-03'),
            },
            {
                name: 'Джордж',
                surname: 'Оруэлл',
                dateOfBirth: new Date('1903-06-25'),
                dateOfDeath: new Date('1950-01-21'),
            },
            {
                name: 'Эрих',
                surname: 'Ремарк',
                patronymic: 'Мария',
                dateOfBirth: new Date('1898-06-22'),
                dateOfDeath: new Date('1970-09-25'),
            },
            {
                name: 'Рэй',
                surname: 'Брэдбери',
                dateOfBirth: new Date('1920-08-22'),
                dateOfDeath: new Date('2012-06-05'),
            },
            {
                name: 'Стивен',
                surname: 'Кинг',
                dateOfBirth: new Date('1947-09-21'),
            },
            {
                name: 'Джоан',
                surname: 'Роулинг',
                dateOfBirth: new Date('1965-07-31'),
            },
            {
                name: 'Агата',
                surname: 'Кристи',
                dateOfBirth: new Date('1890-09-15'),
                dateOfDeath: new Date('1976-01-12'),
            },
            {
                name: 'Айзек',
                surname: 'Азимов',
                dateOfBirth: new Date('1920-01-02'),
                dateOfDeath: new Date('1992-04-06'),
            },
            {
                name: 'Харуки',
                surname: 'Мураками',
                dateOfBirth: new Date('1949-01-12'),
            },
        ];

        for (const author of authors) {
            const exists = await this.authorsRepository.exists({
                where: { name: author.name },
            });

            if (!exists) {
                await this.authorsRepository.save(
                    this.authorsRepository.create(author),
                );
            }
        }
    }

    private async createMissing<T extends { id: number }>(
        repository: Repository<T>,
        items: Array<Partial<T> & { id: number }>,
    ) {
        for (const item of items) {
            const exists = await repository.exists({
                where: { id: item.id } as any,
            });

            if (!exists) {
                await repository.save(repository.create(item as any));
            }
        }
    }
}
