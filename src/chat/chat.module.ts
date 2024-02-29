import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './chat.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/user.entity';
import { UserToChat } from 'src/user/userToChat.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Chat, UserToChat, User])],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
