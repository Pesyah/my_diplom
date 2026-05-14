import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Authors } from './entities/authors.entity';
import { BooksPriceHistory } from './entities/books-price-history.entity';
import { BooksType } from './entities/books-type.entity';
import { Books } from './entities/books.entity';
import { Genres } from './entities/genres.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Books,
            Authors,
            Genres,
            BooksType,
            BooksPriceHistory,
        ]),
    ],
    controllers: [BooksController],
    providers: [BooksService],
    exports: [BooksService],
})
export class BooksModule {}
