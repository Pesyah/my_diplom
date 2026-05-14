import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleService } from 'src/userRole/userRole.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly userRoleService: UserRoleService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );

        if (!roles) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const userRole = await this.userRoleService.getUserRole(user.id);

        return roles.some((role: string) => {
            return role === userRole;
        });
    }
}
