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
import { actionButtons, actionsType } from "./utils/app.buttons";
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

  // @Hears(actionsType.create)
  // async createTodo(ctx: Context) {

  //   await ctx.reply("Напишите название задачи")
  //   ctx.session.type = "create"

  // }

  // update_id: 769962916,
  //   message: {
  //     message_id: 946,
  //     from: {
  //       id: 674449847,
  //       is_bot: false,
  //       first_name: 'Александр',
  //       username: 'perepeljuk09',
  //       language_code: 'ru'
  //     },
  //     chat: {
  //       id: 674449847,
  //       first_name: 'Александр',
  //       username: 'perepeljuk09',
  //       type: 'private'
  //     },
  //     date: 1682931286,
  //     text: 'Список задач'
  //   }
  // }
  @Hears(actionsType.next)
  async nextChat(ctx: Context) {
    // console.log("bot >>>", ctx.chat);

    ctx.session.type = "chat";
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

    // if (!queue.length) {
    //   queue.push(ctx.chat.id);
    // } else {
    //   chat.first_user_id = queue.pop();
    //   chat.second_user_id = ctx.chat.id;

    //   console.log("chat >>>", chat);

    //   await ctx.telegram.sendMessage(
    //     chat.first_user_id,
    //     "Новый собеседник найден",
    //     actionButtons()
    //   );
    //   await ctx.telegram.sendMessage(
    //     chat.second_user_id,
    //     "Новый собеседник найден",
    //     actionButtons()
    //   );
    // }
  }

  @Hears(actionsType.stop)
  async stopChat(ctx: Context) {
    console.log("bot >>>", ctx.chat);

    await ctx.reply("Вы завершили диалог");

    if (ctx.chat.id === chat.first_user_id) {
      await ctx.telegram.sendMessage(
        chat.second_user_id,
        "Ваш собеседник завершил диалог",
        actionButtons()
      );
    } else {
      await ctx.telegram.sendMessage(
        chat.first_user_id,
        "Ваш собеседник завершил диалог",
        actionButtons()
      );
    }

    chat.first_user_id = null;
    chat.second_user_id = null;

    console.log("chat >>>", chat);
  }

  @Hears("Новый собеседник найден")
  async nextSearched(ctx: Context) {
    ctx.session.type = "chat";

    await ctx.reply("Сессия изменилась на чат");
  }

  // @Hears(actionsType.list)
  // async getAllTodo(ctx: Context) {

  //   const todos = await this.appService.getAll()

  //   await ctx.reply(showList(todos))
  // }

  // @Hears(actionsType.done)
  // async doneTodo(ctx: Context) {

  //   await ctx.reply("Напиши ID задачи")
  //   ctx.session.type = 'done'

  // }
  // @Hears(actionsType.edit)
  // async editTodo(ctx: Context) {

  //   await ctx.deleteMessage()
  //   await ctx.replyWithHTML(
  //   "Напиши ID задачи и новое название задачи \n\n"
  //   + `В формате <b>1 | название задачи</b>`
  //   )
  //   ctx.session.type = 'edit'

  // }
  // @Hears(actionsType.delete)
  // async deleteTodo(ctx: Context) {

  //   await ctx.reply("Напиши ID задачи")
  //   ctx.session.type = "delete"

  // }

  @On("text")
  async chat(@Message("text") message: string, @Ctx() ctx: Context) {
    // if(!ctx.session.type) return

    if (ctx.session.type === "chat") {
    }

    if (ctx.chat.id !== chat.first_user_id) {
      await ctx.telegram.sendMessage(chat.first_user_id, message);
    } else {
      await ctx.telegram.sendMessage(chat.second_user_id, message);
    }
  }

  // @On("text")
  // async getMessage(@Message("text") message: string, @Ctx() ctx: Context) {
  //   if(!ctx.session.type) return

  //   if(ctx.session.type === "create") {

  //     const TaskDto = {name: message}
  //     const todos = await this.appService.createTask(TaskDto)

  //     await ctx.reply(showList(todos))
  //   }
  //   if(ctx.session.type === "done") {

  //     const todos = await this.appService.doneTask(Number(message))

  //     if(!todos) {
  //       await ctx.deleteMessage()
  //       await ctx.reply("Задача с таким ID не найдена")
  //       return
  //     }

  //     await ctx.reply(showList(todos))
  //   }

  //   if(ctx.session.type === "edit") {

  //     const [taskId, newTaskName] = message.split("|")

  //     const todos = await this.appService.editTask(Number(taskId), newTaskName)

  //     if(!todos) {
  //       await ctx.deleteMessage()
  //       await ctx.reply("Задача с таким ID не найдена")
  //       return
  //     }

  //     ctx.reply(showList(todos))

  //   }

  //   if(ctx.session.type === "delete") {

  //     const todos = await this.appService.deleteTask(Number(message))

  //     if(!todos) {
  //       await ctx.deleteMessage()
  //       await ctx.reply("Задача с таким ID не найдена")
  //       return
  //     }

  //     // const anotherTodos = todos.filter(todo => todo.id !== Number(message))

  //     await ctx.reply(showList(todos))
  //   }
  // }
}
