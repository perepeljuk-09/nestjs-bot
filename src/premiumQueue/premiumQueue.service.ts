import { Injectable } from "@nestjs/common";

type premiumQueueObj = {
  whoId: number;
  whomId: number;
};

@Injectable()
export class PremiumQueueService {
  queue: premiumQueueObj[] = [];

  addToQueue(who_user_id: number, whom_user_id: number) {
    const objQueue: premiumQueueObj = {
      whoId: who_user_id,
      whomId: whom_user_id,
    };
    this.queue.push(objQueue);
    return;
  }

  getQueue() {
    return this.queue;
  }

  getQueueObjByUserId(user_id: number) {
    const queueObj = this.queue.find((item) => item.whoId === user_id);
    return queueObj;
  }

  checkInQueue(whom_user_id: number) {
    const objQueue = this.queue.find((item) => item.whomId === whom_user_id);

    return objQueue;
  }

  deleteFromQueue(who_user_id: number) {
    this.queue = this.queue.filter((item) => item.whoId !== who_user_id);

    return;
  }
}
