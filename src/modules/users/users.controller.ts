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

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
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
  me(@RequestUser() user: User) {
    return user;
  }
}
