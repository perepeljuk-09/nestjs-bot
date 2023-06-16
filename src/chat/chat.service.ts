import { Injectable } from "@nestjs/common";

type ChatType = {
  // id: number;
  first_chat_user_id: number;
  second_chat_user_id: number;
  quantityMessagesFromFirstUser: number;
  quantityMessagesFromSecondUser: number;
};

@Injectable()
export class ChatService {
  constructor() {}

  chats: ChatType[] = [];

  async createChat(first_chat_user_id: number, second_chat_user_id: number) {
    const chat: ChatType = {
      first_chat_user_id,
      second_chat_user_id,
      quantityMessagesFromFirstUser: 0,
      quantityMessagesFromSecondUser: 0,
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

  async incrementQuantityMessages(chat_user_id: number) {
    this.chats = this.chats.map((chat) => {
      if (chat.first_chat_user_id === chat_user_id) {
        return {
          ...chat,
          quantityMessagesFromFirstUser: chat.quantityMessagesFromFirstUser + 1,
        };
      } else if (chat.second_chat_user_id === chat_user_id) {
        return {
          ...chat,
          quantityMessagesFromSecondUser:
            chat.quantityMessagesFromSecondUser + 1,
        };
      } else {
        return chat;
      }
    });

    return;
  }

  async deleteChat(chat_user_id: number) {
    const chatById = await this.getChatByUserId(chat_user_id);

    this.chats = this.chats.filter((chat) => chat !== chatById);

    return chatById;
  }
}
