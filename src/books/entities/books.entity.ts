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

@Entity()
export class Authors {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    surname: string;

    @Column({ length: 100, nullable: true })
    patronymic?: string;

    @Column()
    dateOfBirth: Date;

    // дата смерти может быть опциональной)
    @Column({ nullable: true })
    dateOfDeath?: Date;

    @Column({ default: 0 })
    booksCount: number;
}

@Entity()
export class Books {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Authors)
    @JoinColumn()
    author: Authors;
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
