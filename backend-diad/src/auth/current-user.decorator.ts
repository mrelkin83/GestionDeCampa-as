import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from './campaign-access';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);
