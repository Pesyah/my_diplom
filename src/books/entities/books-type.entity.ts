import { Column, Entity, PrimaryColumn } from 'typeorm';

// Что-то типа "электронная книга", "бумажная"
@Entity()
export class BooksType {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;
}
