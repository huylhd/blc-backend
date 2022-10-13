import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existedUser = await this.userRepo.findOne({
      where: { username: createUserDto.username },
    });
    if (existedUser) {
      throw new ConflictException("Username has been taken");
    }
    const newUser = this.userRepo.create({
      ...createUserDto,
      id: genId(),
    });
    await this.userRepo.insert(newUser);
    return newUser;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(id: string) {
    return this.userRepo.findBy({ id });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
