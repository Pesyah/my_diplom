import {
    Column,
    CreateDateColumn,
    DataSource,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateEvent,
} from 'typeorm';
import { Books } from './books.entity';

@Entity()
export class BooksPriceHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Books)
    @JoinColumn()
    books: Books;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @CreateDateColumn()
    created_at: Date;
}

@EventSubscriber()
export class BooksPriceHistorySubscriber implements EntitySubscriberInterface<Books> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Books;
    }

    async afterInsert(event: InsertEvent<Books>): Promise<void> {
        // При создании книги создаем первую запись в истории цен
        if (event.entity) {
            const booksPriceHistoryRepository =
                event.manager.getRepository(BooksPriceHistory);

            const priceHistory = booksPriceHistoryRepository.create({
                books: event.entity,
                price: event.entity.price,
            });

            await booksPriceHistoryRepository.save(priceHistory);
        }
    }

    async afterUpdate(event: UpdateEvent<Books>): Promise<void> {
        // Проверяем, изменились ли цены
        if (!event.entity || !event.databaseEntity) {
            return;
        }

        const priceChanged = event.entity.price !== event.databaseEntity.price;

        // Если ни одна из цен не изменилась - выходим
        if (!priceChanged) {
            return;
        }

        const booksPriceHistoryRepository =
            event.manager.getRepository(BooksPriceHistory);

        const priceHistory = booksPriceHistoryRepository.create({
            books: { id: event.entity.id },
            price: event.entity.price,
        });

        await booksPriceHistoryRepository.save(priceHistory);
    }
}
