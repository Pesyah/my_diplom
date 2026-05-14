import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { jwtConstants } from './constants';
import { RegisterDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleType } from './entities/user-roles.entity';
import { Users } from './entities/users.entity';

@Injectable()
export class AuthService {
    private readonly salt = 12;
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
        @InjectRepository(UserRoleType)
        private readonly userRoleTypeRepository: Repository<UserRoleType>,
        @Inject(JwtService)
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async signOn(
        name: string,
        surname: string,
        email: string,
        password: string,
        phone: string,
    ) {
        const existUser = await this.userRepository.findOneBy({ email });

        if (existUser) {
            throw new HttpException(
                'Пользователь с таким email уже зарегестрирован!',
                HttpStatus.CONFLICT,
            );
        }
        const hashPassword = await bcrypt.hash(password, this.salt);

        const newUser = this.userRepository.create();
        newUser.email = email;
        newUser.password = hashPassword;
        newUser.name = name;
        newUser.surname = surname;
        newUser.phone = phone;
        newUser.roleType = await this.userRoleTypeRepository.findOneByOrFail({
            id: 1,
        });

        await this.userRepository.save(newUser);

        const payload = { id: newUser.id, email: newUser.email };
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: jwtConstants.secret,
            }),
        };
    }

    async changePassword(
        requestUser: Users,
        oldPassword: string,
        newPassword: string,
    ) {
        const user = await this.userRepository.findOne({
            where: { id: requestUser.id },
            select: {
                id: true,
                password: true,
                email: true,
            },
        });

        if (!user) {
            throw new HttpException(
                'Пользователь не найден',
                HttpStatus.NOT_FOUND,
            );
        }

        const isTruePassword = await bcrypt.compare(oldPassword, user.password);

        if (!isTruePassword) {
            throw new HttpException(
                'Неверная почта или пароль',
                HttpStatus.FORBIDDEN,
            );
        }

        const newHashPassword = await bcrypt.hash(newPassword, this.salt);
        return this.userRepository.update(
            { id: user.id },
            { password: newHashPassword },
        );
    }

    async signIn(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                password: true,
                email: true,
            },
        });

        if (!user) {
            throw new HttpException(
                'Пользователь не найден',
                HttpStatus.NOT_FOUND,
            );
        }

        const isTruePassword = await bcrypt.compare(password, user.password);

        if (!isTruePassword) {
            throw new HttpException(
                'Неверная почта или пароль',
                HttpStatus.FORBIDDEN,
            );
        }
        const payload = { id: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: jwtConstants.secret,
            }),
        };
    }

    generateNewPassword() {
        let length = 16,
            charset =
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = '';
        for (let i = 0, n = charset.length - 1; i < length; ++i) {
            res += charset[Math.floor(Math.random() * n)];
        }
        return res;
    }

    async resetPassword(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                password: true,
                email: true,
            },
        });

        if (!user) {
            throw new HttpException(
                'Пользователь не найден',
                HttpStatus.NOT_FOUND,
            );
        }
        const password = this.generateNewPassword();
        const hashPassword = await bcrypt.hash(password, this.salt);
        user.password = hashPassword;

        await this.userRepository.save(user);
        return { message: 'ok' };
    }

    async usersByQuery(query: string) {
        return this.userRepository.find({
            where: [
                {
                    email: query ? ILike(`%${query}%`) : Not(IsNull()),
                    roleType: { id: 1 },
                },
                {
                    phone: query ? ILike(`%${query}%`) : Not(IsNull()),
                    roleType: { id: 1 },
                },
                {
                    surname: query ? ILike(`%${query}%`) : Not(IsNull()),
                    roleType: { id: 1 },
                },
                {
                    name: query ? ILike(`%${query}%`) : Not(IsNull()),
                    roleType: { id: 1 },
                },
            ],
            relations: {
                roleType: true,
            },
        });
    }

    async updateUser(user: Users, updateUserDto: UpdateUserDto) {
        return this.userRepository.update({ id: user.id }, updateUserDto);
    }

    async createAdmin(body: RegisterDto) {
        const existUser = await this.userRepository.findOneBy({
            email: body.email,
        });

        if (existUser) {
            throw new HttpException(
                'Пользователь с таким email уже зарегестрирован!',
                HttpStatus.CONFLICT,
            );
        }
        const hashPassword = await bcrypt.hash(body.password, this.salt);

        const newUser = this.userRepository.create();
        newUser.email = body.email;
        newUser.password = hashPassword;
        newUser.name = body.name;
        newUser.surname = body.surname;
        newUser.phone = body.phone;
        newUser.roleType = await this.userRoleTypeRepository.findOneByOrFail({
            id: 2,
        });

        return this.userRepository.save(newUser);
    }

    async getMe(user: Users) {
        return this.userRepository.findOne({
            where: {
                id: user.id,
            },
            relations: {
                roleType: true,
            },
        });
    }
}
