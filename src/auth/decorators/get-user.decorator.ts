import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@/users/model/user.entity';

export type UserKeys = keyof User;

interface RequestWithUser extends Request {
  user: User;
}

export const GetUser = createParamDecorator(
  (
    data: UserKeys | undefined,
    ctx: ExecutionContext,
  ): User | User[UserKeys] => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (data) {
      const value = request.user[data];
      if (value === undefined) {
        throw new UnauthorizedException(`
          User property ${String(data)} not found`);
      }
      return value;
    }

    return request.user;
  },
);
