import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
