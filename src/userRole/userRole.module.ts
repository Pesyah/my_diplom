import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/auth/entities/users.entity';
import { UserRoleService } from './userRole.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    providers: [UserRoleService],
    exports: [UserRoleService],
})
export class UserRoleModule {}
