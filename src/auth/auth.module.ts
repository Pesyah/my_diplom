import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { UserRoleType } from './entities/user-roles.entity';
import { Users } from './entities/users.entity';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Users, UserRoleType]),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '5h' },
        }),
        ConfigModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
