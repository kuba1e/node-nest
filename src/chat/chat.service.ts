import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/user/user.entity';
import { transformChatResponse } from 'src/utils/transformChatResponse';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}
  async saveChat(chat: Partial<Chat>) {
    return await this.chatRepository.save(chat);
  }

  async updateChat(chat: Partial<Chat>) {
    return await this.chatRepository.update({ id: chat.id }, chat);
  }

  async getById(id: string) {
    const chat = await this.chatRepository.findOne({
      where: {
        id,
      },
      relations: {
        // users: true,
        // userToChats: true,
      },
    });

    return transformChatResponse(chat);
  }
}
