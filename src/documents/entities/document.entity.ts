import { Users } from 'src/auth/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    originalName: string;

    @Column()
    mimeType: string;

    @Column()
    size: number;

    @Column()
    path: string;

    @ManyToOne(() => Users)
    @JoinColumn()
    users: Users;

    @CreateDateColumn()
    createdAt: Date;
}
