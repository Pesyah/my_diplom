import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleType } from 'src/auth/entities/user-roles.entity';
import { Authors } from 'src/books/entities/authors.entity';
import { BooksType } from 'src/books/entities/books-type.entity';
import { Genres } from 'src/books/entities/genres.entity';
import { SeedService } from './seed.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRoleType, BooksType, Genres, Authors]),
    ],
    providers: [SeedService],
})
export class SeedModule {}
