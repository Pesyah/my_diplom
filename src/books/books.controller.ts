import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Users } from 'src/auth/entities/users.entity';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { BooksService } from './books.service';
import { ActivateBookDto } from './dto/activate-book.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
@ApiTags('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get('all')
    @ApiOperation({ summary: 'Получить все активные книги' })
    async findAll() {
        return this.booksService.findAll();
    }

    @Get('by-id/:id')
    @ApiOperation({ summary: 'Получить книгу по ID' })
    async findById(@Param('id') id: string) {
        return this.booksService.findById(id);
    }

    @Get('authors/all')
    @ApiOperation({ summary: 'Получить всех авторов' })
    async findAllAuthors() {
        return this.booksService.findAllAuthors();
    }

    @Get('authors/by-id/:id')
    @ApiOperation({ summary: 'Получить автора по ID' })
    async findAuthorById(@Param('id') id: string) {
        return this.booksService.findAuthorById(id);
    }

    @Get('by-user')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Получить книги текущего пользователя' })
    async findByUser(@GetUser() user: Users) {
        return this.booksService.findByUser(user.id);
    }

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Создать книгу' })
    async create(@Body() dto: CreateBookDto, @GetUser() user: Users) {
        return this.booksService.create(dto, user.id);
    }

    @Post('activate')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Активировать книгу' })
    async activate(@Body() dto: ActivateBookDto, @GetUser() user: Users) {
        return this.booksService.activate(dto, user.id);
    }

    @Put()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновить книгу' })
    async update(@Body() dto: UpdateBookDto, @GetUser() user: Users) {
        return this.booksService.update(dto, user.id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Удалить книгу' })
    async delete(@Param('id') id: string, @GetUser() user: Users) {
        return this.booksService.delete(id, user.id);
    }

    @Post('authors')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Создать автора' })
    async createAuthor(@Body() dto: CreateAuthorDto) {
        return this.booksService.createAuthor(dto);
    }

    @Put('authors')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновить автора' })
    async updateAuthor(@Body() dto: UpdateAuthorDto) {
        return this.booksService.updateAuthor(dto);
    }

    @Delete('authors/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Удалить автора' })
    async deleteAuthor(@Param('id') id: string) {
        return this.booksService.deleteAuthor(id);
    }
}
