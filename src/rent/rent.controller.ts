import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Users } from 'src/auth/entities/users.entity';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { RentService } from './rent.service';

@Controller('rent')
@UseGuards(AuthGuard)
@ApiTags('rent')
@ApiBearerAuth('JWT-auth')
export class RentController {
    constructor(private readonly rentService: RentService) {}

    @Post()
    @ApiOperation({ summary: 'Создать заявку на аренду книги' })
    create(@Body() createRentDto: CreateRentDto, @GetUser() user: Users) {
        return this.rentService.create(createRentDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Получить все аренды текущего пользователя' })
    findAll(@GetUser() user: Users) {
        return this.rentService.findAll(user.id);
    }

    @Get('incoming')
    @ApiOperation({ summary: 'Получить входящие заявки на аренду' })
    findIncoming(@GetUser() user: Users) {
        return this.rentService.findIncoming(user.id);
    }

    @Get('outgoing')
    @ApiOperation({ summary: 'Получить исходящие заявки на аренду' })
    findOutgoing(@GetUser() user: Users) {
        return this.rentService.findOutgoing(user.id);
    }

    @Get('by-id/:id')
    @ApiOperation({ summary: 'Получить аренду по ID' })
    findOne(@Param('id') id: string, @GetUser() user: Users) {
        return this.rentService.findOne(id, user.id);
    }

    @Patch(':id/accept')
    @ApiOperation({ summary: 'Подтвердить аренду владельцем книги' })
    accept(@Param('id') id: string, @GetUser() user: Users) {
        return this.rentService.accept(id, user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить заявку на аренду' })
    update(
        @Param('id') id: string,
        @Body() updateRentDto: UpdateRentDto,
        @GetUser() user: Users,
    ) {
        return this.rentService.update(id, updateRentDto, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить заявку на аренду' })
    remove(@Param('id') id: string, @GetUser() user: Users) {
        return this.rentService.remove(id, user.id);
    }
}
