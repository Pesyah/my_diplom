import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleType } from './users-roles.entity';

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    phone: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    surname: string;

    @Column({ length: 100, nullable: true })
    patronymic?: string;

    @Column()
    address: string;

    @ManyToOne(() => UserRoleType)
    @JoinColumn()
    roleType: UserRoleType;
}
