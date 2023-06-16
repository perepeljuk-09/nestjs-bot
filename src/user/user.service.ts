import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { CreateUserDto } from "./dto/create.user.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private UserRepository: typeof User) {}

  async create(dto: CreateUserDto) {
    await this.UserRepository.create(dto);
  }

  async findByPk(id: number) {
    return await this.UserRepository.findByPk(id);
  }

  async checkUser(id: number) {
    const user = await this.findByPk(id);

    return user ? true : false;
  }

  async updateStats(
    id: number,
    quantityMessages: number,
    lastInterlocutorUserId: number
  ) {
    const user = await this.findByPk(id);

    user.quantityChats += 1;
    user.quantityMessages += quantityMessages;
    user.lastInterlocutorUserId = lastInterlocutorUserId;

    user.save();
    return;
  }
}
