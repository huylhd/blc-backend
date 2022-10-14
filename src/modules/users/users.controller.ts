import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ConflictException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { RequestUser } from "src/decorators/user.decorator";
import { User } from "./entities/user.entity";
import { AuthGuard } from "src/guards/auth.guard";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AuthHeaders } from "src/enums/auth-header.enum";

@Controller("users")
@ApiTags("users", "v1")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const existedUser = await this.usersService.findOneByUsername(
      createUserDto.username,
    );
    if (existedUser) {
      throw new ConflictException("Username has been taken");
    }
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @ApiSecurity(AuthHeaders.USER)
  @ApiOperation({ summary: "Get current user info" })
  me(@RequestUser() user: User): User {
    return user;
  }
}
