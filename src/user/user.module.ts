import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
  imports: [UserService],
})
export class UserModule {}
