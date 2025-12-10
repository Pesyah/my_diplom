import { Column, Entity, PrimaryColumn } from 'typeorm';

// Жанры
@Entity()
export class Genres {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 0 })
    countBooksWithGenre: number;
}
