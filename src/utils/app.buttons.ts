import { Markup } from "telegraf";

export enum actionsType {
  next = "💣 Поиск нового собеседника",
  stop = "❌Завершить диалог",
  searchStop = "Остановить поиск",
}

export function actionButtons() {
  return Markup.keyboard([Markup.button.callback(actionsType.next, "next")], {
    columns: 2,
  }).resize();
}

export function inlineSubsButtons() {
  return Markup.inlineKeyboard([
    Markup.button.url("Подписать на канал", "https://t.me/checkbotme"),
  ]);
}

export function stopButtons() {
  return Markup.keyboard([
    Markup.button.callback(actionsType.next, "next"),
  ]).resize();
}

export function searchNextButtons() {
  return Markup.keyboard([
    Markup.button.callback(actionsType.searchStop, "searchStop"),
  ]).resize();
}

export function chatButtons() {
  return Markup.keyboard([
    Markup.button.callback(actionsType.stop, "stop"),
  ]).resize();
}
