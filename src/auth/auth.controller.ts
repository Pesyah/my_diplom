import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Roles } from './decorators/role.decorator';
import {
    ChangePasswordDto,
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
} from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './entities/users.entity';
import { RolesGuard } from './guard/rolesGuard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/register')
    @ApiOperation({ summary: 'Зарегистрировать пользователя' })
    async register(@Body() body: RegisterDto) {
        return this.authService.signOn(
            body.name,
            body.surname,
            body.email,
            body.password,
            body.phone,
        );
    }

    @Post('/login')
    @ApiOperation({ summary: 'Войти в аккаунт' })
    async login(@Body() body: LoginDto) {
        return this.authService.signIn(body.email, body.password);
    }

    @Post('/reset-password')
    @ApiOperation({ summary: 'Сбросить пароль' })
    @ApiResponse({ description: 'Пароль сброшен' })
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.authService.resetPassword(body.email);
    }

    @UseGuards(AuthGuard)
    @Post('/change-password')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Изменить пароль' })
    async changePassword(
        @Body() body: ChangePasswordDto,
        @GetUser() user: Users,
    ) {
        return this.authService.changePassword(
            user,
            body.oldPassword,
            body.newPassword,
        );
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Post('/create-admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Создать администратора' })
    async createAdmin(@Body() body: RegisterDto) {
        return this.authService.createAdmin(body);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Get('/user-by-query/:query')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Найти пользователей по строке поиска' })
    async usersByQuery(@Param('query') query: string) {
        return this.authService.usersByQuery(query);
    }

    @UseGuards(AuthGuard)
    @Patch('/update-user')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновить данные текущего пользователя' })
    async updateUser(@GetUser() user: Users, @Body() body: UpdateUserDto) {
        return this.authService.updateUser(user, body);
    }

    @UseGuards(AuthGuard)
    @Get('/me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Получить текущего пользователя' })
    async getMe(@GetUser() user: Users) {
        return this.authService.getMe(user);
    }
}
