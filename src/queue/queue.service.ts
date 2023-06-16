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

  getFromQueue() {
    const first_chat_user_id = this.queue.pop();

    return first_chat_user_id;
  }

  getQueue() {
    return this.queue;
  }

  checkInQueue(chat_user_id: number) {
    return this.queue[0] === chat_user_id ? true : false;
  }

  deleteFromQueue(chat_user_id: number) {
    this.queue = this.queue.filter((item) => item !== chat_user_id);

    return;
  }
}
