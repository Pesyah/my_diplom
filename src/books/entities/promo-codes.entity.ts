import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Books } from './books.entity';
import { PromoCodesType } from './promo-codes-type.entity';

@Entity()
export class PromoCodes {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    text: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @ManyToOne(() => Books)
    @JoinColumn()
    books: Books;

    @ManyToOne(() => PromoCodesType)
    @JoinColumn()
    promoCodesType: PromoCodesType;

    @Column({ default: 0 })
    countOfUse: number;
}
