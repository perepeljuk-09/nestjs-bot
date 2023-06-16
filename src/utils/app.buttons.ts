import { Markup } from "telegraf";

export enum actionsType {
  next = "next",
  stop = "stop",
  searchStop = "Остановить поиск",
  backStop = "Остановить поиск предыдущего собеседника",
  back = "back",
}

export enum actionsTypeText {
  next = "💣 Поиск нового собеседника",
  stop = "❌Завершить диалог",
}

export function actionButtons() {
  return Markup.keyboard([Markup.button.text(actionsTypeText.next)], {
    columns: 2,
  }).resize();
}

export function inlineSubsButtons() {
  return Markup.inlineKeyboard([
    Markup.button.url("Подписать на канал", "https://t.me/checkbotme"),
  ]);
}

export function backStopButtons() {
  return Markup.keyboard([Markup.button.text(actionsType.backStop)]).resize();
}

export function searchNextButtons() {
  return Markup.keyboard([
    Markup.button.callback(actionsType.searchStop, "searchStop"),
  ]).resize();
}

export function chatButtons() {
  return Markup.keyboard([Markup.button.text(actionsTypeText.stop)]).resize();
}
