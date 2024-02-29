import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { transformChatResponse } from 'src/utils/transformChatResponse';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      relations: {
        settings: true,
      },
    });
  }

  getExtendedUserByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async saveNewUser(user: Partial<User>) {
    return await this.userRepository.save(user);
  }

  async getAllActiveUserChats(userId: string) {
    const user = await this.userRepository.findOne({
      relations: {
        chats: {
          users: true,
          userToChats: true,
        },
      },
      where: {
        id: userId,
      },
    });
    return user.chats?.map((chat) => transformChatResponse(chat));
  }

  async findOneBy(options: FindOptionsWhere<User>) {
    return await this.userRepository.findOneBy(options);
  }

  async getManyByEmails(options: User['email'][]) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email IN (:...emails)', { emails: options })
      .getMany();
  }
}
