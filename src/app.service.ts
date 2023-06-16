import { InjectModel } from "@nestjs/sequelize";
import { Task } from "./tasks/task.model";
import { Injectable } from "@nestjs/common";
import { CreateTaskDto } from "./tasks/dto/create.task.dto";

@Injectable()
export class AppService {
  constructor(@InjectModel(Task) private taskRepository: typeof Task) {}

  async getAll() {
    return await this.taskRepository.findAll();
  }

  async getById(id: number) {
    return await this.taskRepository.findByPk(id);
  }

  async createTask(dto: CreateTaskDto) {
    await this.taskRepository.create(dto);

    return await this.getAll();
  }
  async doneTask(id: number) {
    const task = await this.getById(id);
    if (!task) return;

    task.isCompleted = !task.isCompleted;
    await task.save();

    return await this.getAll();
  }

  async editTask(id: number, name: string) {
    const task = await this.getById(id);

    if (!task) return;

    task.name = name;
    await task.save();

    return await this.getAll();
  }

  async deleteTask(id: number) {
    const task = await this.getById(id);

    if (!task) return;

    await task.destroy();

    return await this.getAll();
  }
}
