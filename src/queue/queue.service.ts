import { Injectable } from "@nestjs/common";

@Injectable()
export class QueueService {
  queue: number[] = [];

  async addToQueue(chat_user_id: number) {
    if (!this.queue.length) {
      this.queue.push(chat_user_id);

      return;
    } else if (this.queue[0] === chat_user_id) {
      return;
    } else {
      // create chat
      const first_chat_user_id = this.queue.pop();

      return first_chat_user_id;
    }
  }

  async deleteFromQueue() {}
}
