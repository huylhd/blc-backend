import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { RequestUser } from "src/decorators/user.decorator";
import { User } from "./entities/user.entity";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@RequestUser() user: User) {
    return user;
  }
}
