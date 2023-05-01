import { Task } from "src/tasks/task.model"




export const showList = (todos: Task[]) => {
    return `
    Список всех задач:\n\n${todos.map(todo => {
      return todo.id + " " + todo.name + " " + (todo.isCompleted ? "✅" : "❌") + "\n\n"
    }).join('')}
    `
}