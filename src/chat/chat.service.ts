import { Injectable } from "@nestjs/common";

type ChatType = {
  id: number;
  first_chat_user_id: number;
  second_chat_user_id: number;
};

@Injectable()
export class ChatService {
  constructor() {}

  id: 1;
  chats: ChatType[] = [];

  async createChat(first_chat_user_id: number, second_chat_user_id: number) {
    const chat: ChatType = {
      id: this.id,
      first_chat_user_id,
      second_chat_user_id,
    };

    this.id++;

    this.chats.push(chat);
    return chat;
  }

  async getChatByUserId(chat_user_id: number) {
    const chat = this.chats.find(
      (chat) =>
        chat.first_chat_user_id === chat_user_id ||
        chat.second_chat_user_id === chat_user_id
    );
    console.log("chats >>>", this.chats);
    return chat;
  }

  async deleteChat(chat_id: number) {
    // this.chats = this.chats.filter(chat_id)
  }
}
