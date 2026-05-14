import { nanoid } from 'nanoid';
import { Users } from 'src/auth/entities/users.entity';
import { Rent } from 'src/rent/entities/rent.entity';
import {
    BeforeInsert,
    Column,
    DataSource,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RemoveEvent,
} from 'typeorm';
import { Authors } from './authors.entity';
import { BooksType } from './books-type.entity';
import { Genres } from './genres.entity';

@Entity()
export class Books {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToMany(() => Authors)
    @JoinTable({ name: 'books_and_authors' })
    authors: Authors[]; // массив, т.к. у книги может быть несколько авторов

    @ManyToMany(() => Genres)
    @JoinTable({ name: 'books_and_genres' })
    genres: Genres[];

    @OneToMany(() => Rent, (rent) => rent.books)
    rent: Rent[];

    @ManyToOne(() => Users)
    @JoinColumn()
    users: Users;

    @ManyToOne(() => BooksType)
    @JoinColumn()
    booksType: BooksType;

    @Column()
    name: string;

    @Column({ default: false })
    canBeRented: boolean;

    @Column({ default: false })
    onlyForRent: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, unsigned: true })
    price: number;

    @Column({ type: 'text' })
    description: string;

    @Column({ nullable: true })
    avatar: string;

    @Column('text', { nullable: false, array: true, default: [] })
    photoGallery: string[];

    @Column({ default: false })
    isActive: boolean;

    @Column({
        unique: true,
    })
    listingCode: string;

    @Column({ nullable: true })
    isbn: string;

    @BeforeInsert()
    generateListingCode() {
        this.listingCode = `BOOK-${nanoid(8)}`;
    }
}

@EventSubscriber()
export class BooksSubscriber implements EntitySubscriberInterface<Books> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Books;
    }

    async afterInsert(event: InsertEvent<Books>) {
        const authors = event.entity.authors; // теперь массив
        if (!authors || !authors.length) return;

        for (const author of authors) {
            await event.manager.increment(
                Authors,
                { id: author.id },
                'booksCount',
                1,
            );
        }
    }

    async afterRemove(event: RemoveEvent<Books>) {
        const authors = event.entity?.authors;
        if (!authors || !authors.length) return;

        for (const author of authors) {
            await event.manager.decrement(
                Authors,
                { id: author.id },
                'booksCount',
                1,
            );
        }
    }
}

@EventSubscriber()
export class BooksGenreSubscriber implements EntitySubscriberInterface<Books> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Books;
    }

    async afterInsert(event: InsertEvent<Books>) {
        const genres = event.entity.genres;
        if (!genres || !genres.length) return;

        // Инкремент для каждого жанра
        for (const genre of genres) {
            await event.manager.increment(
                Genres,
                { id: genre.id },
                'countBooksWithGenre',
                1,
            );
        }
    }

    async afterRemove(event: RemoveEvent<Books>) {
        const genres = event.entity?.genres;
        if (!genres || !genres.length) return;

        for (const genre of genres) {
            await event.manager.decrement(
                Genres,
                { id: genre.id },
                'countBooksWithGenre',
                1,
            );
        }
    }
}
