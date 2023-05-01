import { AppService } from "./app.service";
import { Context } from "./interface/context.interface";
import { Injectable } from "@nestjs/common";
import {
  Hears,
  InjectBot,
  Start,
  Update,
  On,
  Command,
  Action,
  Message,
  Ctx,
} from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { actionButtons, actionsType, stopButtons } from "./utils/app.buttons";
import { showList } from "./utils/app.utils";
import { QueueService } from "./queue/queue.service";
import { ChatService } from "./chat/chat.service";

const chat = {
  id: 1,
  first_user_id: null,
  second_user_id: null,
};

const queue = [];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private appService: AppService,
    private queueService: QueueService,
    private chatService: ChatService
  ) {}

  interlocutor: number | null = null;

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply("Привет");
    await ctx.reply("Что ты хочешь выбрать ?", actionButtons());
  }

  @Hears(actionsType.next)
  async nextChat(ctx: Context) {
    console.log("bot >>>", ctx.session.type);

    // ctx.session.type = "chat";
    const chat_user_id = ctx.chat.id;

    await ctx.reply("Поиск собеседника");

    const first_chat_user_id = await this.queueService.addToQueue(chat_user_id);

    if (!first_chat_user_id) {
      return;
    }

    const chat = await this.chatService.createChat(
      first_chat_user_id,
      chat_user_id
    );

    await ctx.telegram.sendMessage(
      chat.first_chat_user_id,
      "Собеседник найден"
    );
    await ctx.telegram.sendMessage(
      chat.second_chat_user_id,
      "Собеседник найден"
    );
    return;
  }

  @Hears(actionsType.stop)
  async stopChat(ctx: Context) {
    const chat_user_id = ctx.chat.id;
    await ctx.reply("Вы завершили диалог");

    const chat = await this.chatService.deleteChat(chat_user_id);

    if (chat_user_id === chat.first_chat_user_id) {
      await ctx.telegram.sendMessage(
        chat.second_chat_user_id,
        "Ваш собеседник завершил диалог",
        stopButtons()
      );
    } else {
      await ctx.telegram.sendMessage(
        chat.first_chat_user_id,
        "Ваш собеседник завершил диалог",
        stopButtons()
      );
    }
  }

  @Action("otecc")
  async otec(@Ctx() ctx: Context) {
    ctx.reply(" по отцу");
    console.log("help me");
  }

  @On("text")
  async chat(@Message("text") message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;
    console.log("ctx.session.type >>>>", ctx.session.type);

    if (ctx.session.type === "chat") {
      const chat_user_id = ctx.chat.id;
      const chat = await this.chatService.getChatByUserId(chat_user_id);

      // console.log("chat >>>", chat);
      if (chat_user_id === chat.first_chat_user_id) {
        await ctx.telegram.sendMessage(chat.second_chat_user_id, message);
      } else {
        await ctx.telegram.sendMessage(chat.first_chat_user_id, message);
      }
    }
  }
}
