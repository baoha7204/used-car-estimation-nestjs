import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: any, context: ExecutionContext) =>
    context.switchToHttp().getRequest().currentUser,
);
