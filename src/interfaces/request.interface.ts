import { Request } from "express";
import { User } from "src/modules/users/entities/user.entity";

export interface ICustomRequest extends Request {
  user: User;
}
