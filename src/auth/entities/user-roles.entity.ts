import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class UserRoleType {
  @ApiProperty()
  @PrimaryColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @OneToOne(() => Users)
  user: Users;
}
