import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        // TypeOrmModule.forFeature([Users]),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
