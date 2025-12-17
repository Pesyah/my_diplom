import { Books } from 'src/books/entities/books.entity';
import { Users } from 'src/users/entities/users.entity';
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
}
