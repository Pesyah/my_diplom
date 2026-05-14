import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleType } from './user-roles.entity';

@Entity()
export class Users {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  surname: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @ManyToOne(() => UserRoleType)
  @JoinColumn()
  roleType: UserRoleType;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
