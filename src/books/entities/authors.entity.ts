import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
