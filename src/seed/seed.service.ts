import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleType } from 'src/auth/entities/user-roles.entity';
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
    ) {
        this.runSeeds();
    }

    async runSeeds() {
        await this.userRoleType();
        await this.booksType();
        await this.genres();
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
