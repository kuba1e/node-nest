import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getBy(options: FindManyOptions<Message>) {
    return await this.messageRepository.find(options);
  }

  async getOneBy(options: FindOneOptions<Message>) {
    return await this.messageRepository.findOne(options);
  }

  async create(message: Partial<Message>) {
    return await this.messageRepository.save(message);
  }

  async update(id: string, message: Partial<Message>) {
    return await this.messageRepository.update(id, message);
  }
}
