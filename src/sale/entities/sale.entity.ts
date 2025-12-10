import { Books } from 'src/books/entities/books.entity';
import { PromoCodes } from 'src/books/entities/promo-codes.entity';
import { Users } from 'src/users/entities/users.entity';
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

    @ManyToOne(() => PromoCodes)
    @JoinColumn()
    promoCodes: PromoCodes;
}

@EventSubscriber()
export class SaleSubscriber implements EntitySubscriberInterface<Sales> {
    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Sales;
    }

    async afterInsert(event: InsertEvent<Sales>) {
        const promoCodes = event.entity.promoCodes;
        if (!promoCodes) return;

        await event.manager.increment(
            PromoCodes,
            { id: promoCodes.id },
            'countOfUse',
            1,
        );
    }

    async afterRemove(event: RemoveEvent<Sales>) {
        const promoCodes = event.entity?.promoCodes;
        if (!promoCodes) return;

        await event.manager.decrement(
            PromoCodes,
            { id: promoCodes.id },
            'countOfUse',
            1,
        );
    }
}
