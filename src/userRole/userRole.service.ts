import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/auth/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRoleService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
    ) {}

    async getUserRole(userId: string) {
        return this.userRepository
            .findOne({
                relations: {
                    roleType: true,
                },
                where: { id: userId },
            })
            .then((r) => r?.roleType.name);
    }
}
