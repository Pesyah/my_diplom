import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { DocumentsModule } from './documents/documents.module';
import { RentModule } from './rent/rent.module';
import { SaleModule } from './sale/sale.module';
import { SeedModule } from './seed/seed.module';
import { UserRoleModule } from './userRole/userRole.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env', // указывает на файл .env в корне проекта
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: Number(configService.get('DB_PORT')),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [__dirname + '/**/entities/**/*.entity.{ts,js}'],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads', // URL путь
        }),
        AuthModule,
        DocumentsModule,
        UserRoleModule,
        SeedModule,
        BooksModule,
        SaleModule,
        RentModule,
    ],
})
export class AppModule {}
