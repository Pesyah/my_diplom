import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        // @InjectRepository(Users)
        // private readonly usersRepository: Repository<Users>,

        private jwtService: JwtService,

        // private redis: Redis,
    ) {
        // this.redis = new Redis({
        //     host: process.env.REDIS_HOST || 'redis',
        //     port: Number(process.env.REDIS_PORT) || 6379,
        // });
    }

    // async signIn(phone: string) {
    //     // ищем юзера
    //     const user = await this.usersRepository.findOneBy({ phone });
    //     // проверяем что юзер существует
    //     if (!user) {
    //         throw new HttpException(
    //             'user not found or code is incorrect',
    //             HttpStatus.UNAUTHORIZED,
    //         );
    //     }

    //     const payload = { sub: user.id, phone: user.phone };
    //     return {
    //         access_token: await this.jwtService.signAsync(payload),
    //     };
    // }
}
