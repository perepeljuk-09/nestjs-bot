import { PremiumQueueService } from "./premiumQueue/premiumQueue.service";
import { AppService } from "./app.service";
import {
  Hears,
  InjectBot,
  Start,
  Update,
  On,
  Message,
  Ctx,
  Command,
} from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import {
  actionsType,
  actionsTypeText,
  backStopButtons,
  chatButtons,
  inlineSubsButtons,
  searchNextButtons,
  actionButtons,
} from "./utils/app.buttons";
import { QueueService } from "./queue/queue.service";
import { ChatService } from "./chat/chat.service";
import { Context } from "telegraf";
import { UserService } from "./user/user.service";

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private appService: AppService,
    private queueService: QueueService,
    private chatService: ChatService,
    private userService: UserService,
    private premiumQueueService: PremiumQueueService
  ) {}

  countMessages = 0;

  @Start()
  async startCommand(ctx: Context) {
    const userId = ctx.chat.id;

    const isHasUser = await this.userService.checkUser(userId);

    const time = Date.now();

    if (!isHasUser) {
      await this.userService.create({ id: userId });
    }

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

  @Hears(actionsTypeText.next)
  async nextChat(ctx: Context) {
    // check in subscriptions
    const chat_user_id = ctx.chat.id;

    // Проверка подписки на чат
    const chatMemberStatus = (
      await ctx.telegram.getChatMember(-1001953527935, chat_user_id)
    ).status;

    if (chatMemberStatus === "left") {
      await ctx.reply("Подпишись на каналы", inlineSubsButtons());
      return;
    } else {
      const chat = await this.chatService.getChatByUserId(chat_user_id);
      if (chat) {
        await ctx.reply("Вы уже находитесь в чате");
        return;
      } else {
        await ctx.reply("Поиск собеседника", searchNextButtons());
      }
    }

    // Поиск этого пользователя в Премиум очереди, если находится, то создаётся чат с премиум пользователем
    const checkInPremiumQueue =
      this.premiumQueueService.checkInQueue(chat_user_id);

    if (checkInPremiumQueue) {
      this.premiumQueueService.deleteFromQueue(checkInPremiumQueue.whoId);
      console.log(
        "Выцеплен при поиске нового собеседника",
        "Премиум очередь очищена >>>",
        this.premiumQueueService.getQueue()
      );

      const chat = await this.chatService.createChat(
        checkInPremiumQueue.whoId,
        checkInPremiumQueue.whomId
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

    // Добавление в обычную очередь
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

  @Command(actionsType.next)
  async nextChatByCommand(ctx: Context) {
    await this.nextChat(ctx);
  }

  @Hears(actionsType.searchStop)
  async searchStop(ctx: Context) {
    const userId = ctx.chat.id;

    this.queueService.deleteFromQueue(userId);
    await ctx.reply("Поиск остановлен 👎", actionButtons());
  }

  @Hears(actionsType.backStop)
  async backStop(ctx: Context) {
    const userId = ctx.chat.id;

    this.premiumQueueService.deleteFromQueue(userId);

    await ctx.reply(
      "Поиск предыдущего собеседника остановлен 👎",
      actionButtons()
    );
  }

  @Hears(actionsTypeText.stop)
  async stopChat(ctx: Context) {
    const userId = ctx.chat.id;

    const chat = await this.chatService.deleteChat(userId);

    // logic for myself
    const quantityMessagesFromUser =
      chat.first_chat_user_id === userId
        ? chat.quantityMessagesFromFirstUser
        : chat.quantityMessagesFromSecondUser;

    const lastInterLocutorUserId =
      userId === chat.first_chat_user_id
        ? chat.second_chat_user_id
        : chat.first_chat_user_id;

    await this.userService.updateStats(
      userId,
      quantityMessagesFromUser,
      lastInterLocutorUserId
    );
    await ctx.reply(
      "Вы завершили диалог \n\n /back - вернуть собеседника",
      actionButtons()
    );

    // logic for interlocutor
    if (userId === chat.first_chat_user_id) {
      await this.userService.updateStats(
        chat.second_chat_user_id,
        chat.quantityMessagesFromSecondUser,
        chat.first_chat_user_id
      );
      await ctx.telegram.sendMessage(
        chat.second_chat_user_id,
        "Ваш собеседник завершил диалог \n\n /back - вернуть собеседника",
        actionButtons()
      );
    } else {
      await this.userService.updateStats(
        chat.first_chat_user_id,
        chat.quantityMessagesFromFirstUser,
        chat.second_chat_user_id
      );
      await ctx.telegram.sendMessage(
        chat.first_chat_user_id,
        "Ваш собеседник завершил диалог \n\n /back - вернуть собеседника",
        actionButtons()
      );
    }

    this.countMessages = 0;
  }

  @Command(actionsType.back)
  async returnInterlocutor(ctx: Context) {
    const userId = ctx.chat.id;

    const chat = await this.chatService.getChatByUserId(userId);
    if (chat) {
      await ctx.reply("Вы сейчас находитесь в чате");
      return;
    }

    const queueObj = this.premiumQueueService.getQueueObjByUserId(userId);
    if (queueObj) {
      await ctx.reply("Поиск предыдущего собеседника уже идёт...");
      return;
    }

    const user = await this.userService.findByPk(userId);
    const timeMs = Date.now();

    if (user.premiumDateEnd !== null && Number(user.premiumDateEnd) > timeMs) {
      // check in premium queue
      const checkInPremiumQueue = this.premiumQueueService.checkInQueue(
        Number(user.lastInterlocutorUserId)
      );

      // if was in premium queue
      if (checkInPremiumQueue) {
        console.log("Выцеплен из очереди премиум");
        this.premiumQueueService.deleteFromQueue(
          Number(user.lastInterlocutorUserId)
        );

        // create chat
        const chat = await this.chatService.createChat(
          Number(user.id),
          Number(user.lastInterlocutorUserId)
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

      const checkInQueue = await this.queueService.checkInQueue(
        Number(user.lastInterlocutorUserId)
      );

      if (checkInQueue) {
        console.log("Выцеплен из очереди обычной");
        const userIdFromQueue = this.queueService.getFromQueue();

        // create chat
        const chat = await this.chatService.createChat(userIdFromQueue, userId);

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
      } else {
        // add to premium

        console.log("Добавлен в очередь для премиумов");
        this.premiumQueueService.addToQueue(
          userId,
          Number(user.lastInterlocutorUserId)
        );
        await ctx.reply("Поиск предыдущего собеседника...", backStopButtons());
      }
    } else {
      console.log("Необходим премиум статус");
      await ctx.reply("Необходим премиум статус");
    }
  }

  @On("text")
  async chat(@Message("text") message: string, @Ctx() ctx: Context) {
    const userId = ctx.chat.id;

    // check in chats
    const chat = await this.chatService.getChatByUserId(userId);

    if (chat) {
      await this.chatService.incrementQuantityMessages(userId);

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
