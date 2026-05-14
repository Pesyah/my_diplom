import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Books } from 'src/books/entities/books.entity';
import { Sales } from './entities/sale.entity';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';

@Module({
    imports: [TypeOrmModule.forFeature([Sales, Books])],
    controllers: [SaleController],
    providers: [SaleService],
})
export class SaleModule {}
