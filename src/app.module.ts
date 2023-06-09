import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { AppUpdate } from './app.update';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from './tasks/task.model';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { QueueModule } from './queue/queue.module';
import { UserModule } from './user/user.module';

const sessions = new LocalSession({ database: 'sessions_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env"
    }),
    TelegrafModule.forRoot({
      token: process.env.TOKEN,
      middlewares: [sessions.middleware()],
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Task],
      autoLoadModels: true
    }),
    SequelizeModule.forFeature([Task]),
    ChatModule,
    QueueModule,
    UserModule
  ],
  providers: [AppService, AppUpdate, ChatService],
})
export class AppModule {}
