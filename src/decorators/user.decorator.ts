import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ICustomRequest } from "src/interfaces/request.interface";
import { User } from "src/modules/users/entities/user.entity";

export const RequestUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request: ICustomRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
