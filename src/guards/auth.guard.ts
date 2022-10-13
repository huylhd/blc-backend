import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { UsersService } from "src/modules/users/users.service";
import { ICustomRequest } from "src/interfaces/request.interface";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(UsersService)
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request = context.switchToHttp().getRequest();

    // Simple auth using userid `header`
    const userId = request.headers["userid"];
    if (!userId) {
      throw new UnauthorizedException("userid header not found");
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    request = request as ICustomRequest;
    request.user = user;
    return true;
  }
}
