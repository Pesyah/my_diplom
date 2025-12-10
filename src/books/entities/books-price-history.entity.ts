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

    @Column('decimal', { precision: 10, scale: 2 })
    rentPrice: number;

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
                rentPrice: event.entity.rentPrice,
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
        const rentPriceChanged =
            event.entity.rentPrice !== event.databaseEntity.rentPrice;

        // Если ни одна из цен не изменилась - выходим
        if (!priceChanged && !rentPriceChanged) {
            return;
        }

        const booksPriceHistoryRepository =
            event.manager.getRepository(BooksPriceHistory);

        // Получаем последнюю запись в истории цен для этой книги
        const lastPriceHistory = await booksPriceHistoryRepository.findOne({
            where: { books: { id: event.entity.id } },
            order: { created_at: 'DESC' },
        });

        // Создаем новую запись только если цены действительно изменились
        // (дополнительная проверка на случай, если цены изменились на те же значения)
        const shouldCreateNewRecord =
            !lastPriceHistory ||
            (priceChanged && lastPriceHistory.price !== event.entity.price) ||
            (rentPriceChanged &&
                lastPriceHistory.rentPrice !== event.entity.rentPrice);

        if (shouldCreateNewRecord) {
            const priceHistory = booksPriceHistoryRepository.create({
                books: { id: event.entity.id },
                price: event.entity.price,
                rentPrice: event.entity.rentPrice,
            });

            await booksPriceHistoryRepository.save(priceHistory);
        }
    }
}
