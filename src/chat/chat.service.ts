import { Injectable } from "@nestjs/common";

type ChatType = {
  // id: number;
  first_chat_user_id: number;
  second_chat_user_id: number;
};

@Injectable()
export class ChatService {
  constructor() {}

  chats: ChatType[] = [];

  async createChat(first_chat_user_id: number, second_chat_user_id: number) {
    const chat: ChatType = {
      first_chat_user_id,
      second_chat_user_id,
    };

    this.chats.push(chat);
    return chat;
  }

  async getChatByUserId(chat_user_id: number) {
    const chat = this.chats.find(
      (chat) =>
        chat.first_chat_user_id === chat_user_id ||
        chat.second_chat_user_id === chat_user_id
    );
    return chat;
  }

  async deleteChat(chat_user_id: number) {
    const chatById = await this.getChatByUserId(chat_user_id);

    this.chats = this.chats.filter((chat) => chat !== chatById);

    return chatById;
  }
}
