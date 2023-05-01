import { Context as ContextTelegraf} from "telegraf";

export class Context extends ContextTelegraf {
    session: {
        type?: "create" | "done" | "edit" | "delete" | "chat"
    }
}