import { Users } from 'src/auth/entities/users.entity';
import { Books } from 'src/books/entities/books.entity';
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

    @ManyToOne(() => Books, { onDelete: 'SET NULL' })
    @JoinColumn()
    books: Books;

    @ManyToOne(() => Users, { onDelete: 'SET NULL' })
    @JoinColumn()
    buyer: Users;

    @ManyToOne(() => Users, { onDelete: 'SET NULL' })
    @JoinColumn()
    seller: Users;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: false })
    isAccepted: boolean;

    @CreateDateColumn()
    created_at: Date;
}
