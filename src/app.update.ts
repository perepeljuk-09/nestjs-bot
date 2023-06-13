import { AppService } from "./app.service";
import {
  Hears,
  InjectBot,
  Start,
  Update,
  On,
  Message,
  Ctx,
} from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import {
  actionButtons,
  actionsType,
  chatButtons,
  inlineSubsButtons,
  searchNextButtons,
  stopButtons,
} from "./utils/app.buttons";
import { QueueService } from "./queue/queue.service";
import { ChatService } from "./chat/chat.service";
import { Context } from "telegraf";

const queue = [];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private appService: AppService,
    private queueService: QueueService,
    private chatService: ChatService
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    const userId = ctx.chat.id;

    // check in subscription
    const chatMemberStatus = (
      await ctx.telegram.getChatMember(-1001953527935, userId)
    ).status;

    if (chatMemberStatus === "left") {
      await ctx.reply("Привет");
      await ctx.reply("Подпишись на каналы", inlineSubsButtons());
      return;
    } else {
      await ctx.reply("Можешь пользоваться", actionButtons());
    }
  }

  @Hears(actionsType.next)
  async nextChat(ctx: Context) {
    // check in subscriptions
    const chat_user_id = ctx.chat.id;

    const chatMemberStatus = (
      await ctx.telegram.getChatMember(-1001953527935, chat_user_id)
    ).status;

    if (chatMemberStatus === "left") {
      await ctx.reply("Подпишись на каналы", inlineSubsButtons());
      return;
    } else {
      await ctx.reply("Поиск собеседника", searchNextButtons());
    }

    // add to queue
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
      "Собеседник найден",
      chatButtons()
    );
    await ctx.telegram.sendMessage(
      chat.second_chat_user_id,
      "Собеседник найден",
      chatButtons()
    );
    return;
  }

  @Hears(actionsType.searchStop)
  async searchStop(ctx: Context) {
    const userId = ctx.chat.id;

    this.queueService.deleteFromQueue(userId);
    await ctx.reply("Поиск остановлен 👎", actionButtons());
  }

  @Hears(actionsType.stop)
  async stopChat(ctx: Context) {
    const userId = ctx.chat.id;

    await ctx.reply("Вы завершили диалог", actionButtons());

    const chat = await this.chatService.deleteChat(userId);

    if (userId === chat.first_chat_user_id) {
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

  @On("text")
  async chat(@Message("text") message: string, @Ctx() ctx: Context) {
    const userId = ctx.chat.id;

    // check in chats
    const chat = await this.chatService.getChatByUserId(userId);

    if (chat) {
      if (userId === chat.first_chat_user_id) {
        await ctx.telegram.sendMessage(chat.second_chat_user_id, message);
        return;
      } else {
        await ctx.telegram.sendMessage(chat.first_chat_user_id, message);
        return;
      }
    }

    // check in queue
    const inQueue = this.queueService.checkInQueue(userId);

    if (inQueue) {
      await ctx.reply("Идёт поиск собеседника", searchNextButtons());
      return;
    }

    // check in subscriptions
    const chatMemberStatus = (
      await ctx.telegram.getChatMember(-1001953527935, userId)
    ).status;

    if (chatMemberStatus === "left") {
      await ctx.reply("Подпишись на каналы", inlineSubsButtons());
      return;
    } else {
      await ctx.reply("Я тебя не понимаю", actionButtons());
    }
  }
}
