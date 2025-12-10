import { Column, Entity, PrimaryColumn } from 'typeorm';

// скидка проценты или рубли
@Entity()
export class PromoCodesType {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;
}
