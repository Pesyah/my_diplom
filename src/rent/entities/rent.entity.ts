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

    @ManyToOne(() => Books)
    @JoinColumn()
    books: Books;

    @ManyToOne(() => Users)
    @JoinColumn()
    buyer: Users;

    @ManyToOne(() => Users)
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
