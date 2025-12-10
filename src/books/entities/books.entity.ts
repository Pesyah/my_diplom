import {
    Column,
    DataSource,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    JoinColumn,
    ManyToOne,
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

    @ManyToOne(() => Authors)
    @JoinColumn()
    author: Authors;

    @ManyToOne(() => Genres)
    @JoinColumn()
    genres: Genres;

    @ManyToOne(() => BooksType)
    @JoinColumn()
    booksType: BooksType;

    @Column()
    name: string;

    @Column({ default: false })
    canBeRented: boolean;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2 })
    rentPrice: number;

    @Column({ type: 'text' })
    description: string;

    @Column({ nullable: true })
    avatar: string;

    @Column('text', { nullable: false, array: true, default: [] })
    photoGallery: string[];
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
        const author = event.entity.author;
        if (!author) return;

        await event.manager.increment(
            Authors,
            { id: author.id },
            'booksCount',
            1,
        );
    }

    async afterRemove(event: RemoveEvent<Books>) {
        const author = event.entity?.author;
        if (!author) return;

        await event.manager.decrement(
            Authors,
            { id: author.id },
            'booksCount',
            1,
        );
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
        if (!genres) return;

        await event.manager.increment(
            Genres,
            { id: genres.id },
            'countBooksWithGenre',
            1,
        );
    }

    async afterRemove(event: RemoveEvent<Books>) {
        const genres = event.entity?.genres;
        if (!genres) return;

        await event.manager.decrement(
            Genres,
            { id: genres.id },
            'countBooksWithGenre',
            1,
        );
    }
}
