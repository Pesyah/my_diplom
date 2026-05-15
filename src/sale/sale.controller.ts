import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Users } from 'src/auth/entities/users.entity';
import { RolesGuard } from 'src/auth/guard/rolesGuard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleService } from './sale.service';

@Controller('sale')
@UseGuards(AuthGuard)
@ApiTags('sale')
@ApiBearerAuth('JWT-auth')
export class SaleController {
    constructor(private readonly saleService: SaleService) {}

    @Post()
    @ApiOperation({ summary: 'Купить книгу' })
    create(@Body() createSaleDto: CreateSaleDto, @GetUser() user: Users) {
        return this.saleService.create(createSaleDto, user.id);
    }

    @Patch(':id/accept')
    @ApiOperation({ summary: 'Подтвердить покупку владельцем книги' })
    accept(@Param('id') id: string, @GetUser() user: Users) {
        return this.saleService.accept(id, user.id);
    }

    @Get()
    @ApiOperation({
        summary: 'Получить все продажи и покупки текущего пользователя',
    })
    findAll(@GetUser() user: Users) {
        return this.saleService.findAll(user.id);
    }

    @Get('incoming')
    @ApiOperation({ summary: 'Получить продажи текущего пользователя' })
    findIncoming(@GetUser() user: Users) {
        return this.saleService.findIncoming(user.id);
    }

    @Get('outgoing')
    @ApiOperation({ summary: 'Получить покупки текущего пользователя' })
    findOutgoing(@GetUser() user: Users) {
        return this.saleService.findOutgoing(user.id);
    }

    @Get('admin/all')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Получить все продажи для администратора' })
    findAllForAdmin() {
        return this.saleService.findAllForAdmin();
    }

    @Get('admin/by-id/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Получить любую продажу по ID для администратора' })
    findOneForAdmin(@Param('id') id: string) {
        return this.saleService.findOneForAdmin(id);
    }

    @Get('by-id/:id')
    @ApiOperation({ summary: 'Получить продажу по ID' })
    findOne(@Param('id') id: string, @GetUser() user: Users) {
        return this.saleService.findOne(id, user.id);
    }
}
