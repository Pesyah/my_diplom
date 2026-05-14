import { Books } from 'src/books/entities/books.entity';
import { Users } from 'src/auth/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sales {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Books)
    @JoinColumn()
    books: Books;

    @ManyToOne(() => Users)
    @JoinColumn()
    buyer: Users;

    @ManyToOne(() => Users)
    @JoinColumn()
    seller: Users;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @CreateDateColumn()
    created_at: Date;
}
