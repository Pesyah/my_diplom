import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({ origin: true });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: {
                exposeUnsetFields: false,
                enableImplicitConversion: true,
            },
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Book Rental and Sale API')
        .setDescription(
            'API для дипломного проекта: книги, аренда, продажи, пользователи и документы',
        )
        .setVersion('1.1')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Введите JWT токен',
            },
            'JWT-auth',
        )
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
