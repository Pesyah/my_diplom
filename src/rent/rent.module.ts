import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Books } from 'src/books/entities/books.entity';
import { Rent } from './entities/rent.entity';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';

@Module({
    imports: [TypeOrmModule.forFeature([Rent, Books])],
    controllers: [RentController],
    providers: [RentService],
})
export class RentModule {}
