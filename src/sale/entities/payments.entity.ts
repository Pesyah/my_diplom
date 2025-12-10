import { Users } from 'src/users/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Sales } from './sale.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Sales)
    @JoinColumn()
    sales: Sales;

    @Column({ nullable: true })
    paymentId: string;

    @Column()
    orderNumber: string;

    @Column({ type: 'int', default: 0 })
    amount: number;

    @Column()
    status: string;

    @Column()
    nameBank: string;

    @ManyToOne(() => Users)
    @JoinColumn()
    users: Users;

    @CreateDateColumn()
    created_at: Date;
}
