import { Users } from 'src/auth/entities/users.entity';
import { Books } from 'src/books/entities/books.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rent {
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

    @Column()
    rentStart: Date;

    @Column()
    rentEnd: Date;

    @Column({ default: false })
    isAccepted: boolean;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
    })
    penaltyPrice?: number;
}
