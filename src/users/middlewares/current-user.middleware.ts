import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { AppRequest } from 'src/types/core';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}
  async use(req: AppRequest, _: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.usersService.findOne(userId);
      req.currentUser = user;
    }
    next();
  }
}
