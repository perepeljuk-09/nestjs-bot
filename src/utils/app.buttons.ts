import { Markup } from "telegraf";

export enum actionsType {
  create = "Создать задачу 💣",
  list = "Список задач",
  done = "Изменить статус задачи",
  edit = "Редактировать ✅",
  delete = "Удалить ❌",
  next = "💣 Поиск нового собеседника",
  stop = "❌Завершить диалог",
  otec = "Позвать отца",
}

// export function actionButtons() {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback(actionsType.otec, "otecc"),
//       Markup.button.callback(actionsType.next, "next"),
//       Markup.button.callback(actionsType.stop, "stop"),
//     ],
//     {
//       columns: 2,
//     }
//   );
// }
export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback(actionsType.otec, "otecc"),
      Markup.button.callback(actionsType.next, "next"),
      Markup.button.callback(actionsType.stop, "stop"),
    ],
    {
      columns: 2,
    }
  ).resize();
}

export function stopButtons() {
  return Markup.keyboard([Markup.button.callback(actionsType.next, "next")], {
    columns: 2,
  }).resize();
}
