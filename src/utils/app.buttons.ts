import { Markup } from "telegraf";

export enum actionsType {
  create = "Создать задачу 💣",
  list = "Список задач",
  done = "Изменить статус задачи",
  edit = "Редактировать ✅",
  delete = "Удалить ❌",
  next = "Поиск нового собеседника",
  stop = "Завершить диалог",
}

export function actionButtons() {
  return Markup.keyboard(
    [
      // Markup.button.callback(actionsType.create, "create"),
      // Markup.button.callback(actionsType.list, "list"),
      // Markup.button.callback(actionsType.done, "done"),
      // Markup.button.callback(actionsType.edit, "edit"),
      // Markup.button.callback(actionsType.delete, "delete"),
      Markup.button.callback(actionsType.next, "next"),
      Markup.button.callback(actionsType.stop, "stop"),
    ],
    {
      columns: 2,
    }
  ).resize();
}
