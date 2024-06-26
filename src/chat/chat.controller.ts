import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { UserRole } from 'src/types/user';
import { Actions, ChatType, Status } from 'src/types/chat';
import { ChatService } from './chat.service';
import { canUserManageChat } from 'src/utils/chat/canUserManageChat';
import { UserToChat } from 'src/user/userToChat.entity';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Controller('/secure/chat')
export class ChatController {
  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private dataSource: DataSource,
    @InjectRepository(UserToChat)
    private userToChatRepository: Repository<UserToChat>,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}
  @Get()
  async getAllActiveUserChatsByUserId(@Request() req) {
    try {
      const userId = req.user.id;

      const chats = await this.userService.getAllActiveUserChats({
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
      Logger.log(`Successfully found chats for user with id: ${userId}`);
      return { data: chats };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Post()
  async createChat(
    @Request() req,
    @Body() body: { title: string; type: ChatType; chatParticipants: string[] },
  ) {
    try {
      const { title, type, chatParticipants } = body;

      const creatorId = req.user.id;

      const user = await this.userService.findOneBy({ id: creatorId });

      const ability = this.caslAbilityFactory.createForUser(user);
      console.log(ability.can(Actions.UPDATE, Chat));

      if (!user) {
        const message = 'User does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const users = await this.userService.getManyByEmails(
        chatParticipants || [],
      );

      const chatUsers = [user, ...users];

      const chat = {
        creatorId: user.id,
        users: chatUsers,
        title,
        type,
      };

      const savedChat = await this.chatService.saveChat(chat);

      const queryRunner = this.dataSource.createQueryRunner();

      try {
        await queryRunner.connect();

        await queryRunner.startTransaction();

        for (const user of chatUsers) {
          const userToChat = new UserToChat();
          userToChat.userId = user.id;
          userToChat.chatId = savedChat.id;
          userToChat.userRole = UserRole.MEMBER;
          if (user.id === creatorId) {
            userToChat.userRole = UserRole.ADMIN;
          }
          await queryRunner.manager.save(userToChat);
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      const newChat = await this.chatService.getById(savedChat.id);

      Logger.log(`Successfully created the chat with id: ${savedChat.id}`);
      return { data: newChat };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Post('add-user')
  async addUserToChatByEmail(
    @Request() req,
    @Body() body: { email: string; chatId: string },
  ) {
    try {
      const { email, chatId } = body;
      const userId = req.user.id;

      const user = await this.userService.findOneBy({ id: userId });

      const chat = await this.chatService.getById(chatId);

      const ability = this.caslAbilityFactory.createForUser(user);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userToAdd = await this.userService.findOneBy({ email });

      if (!userToAdd) {
        const message = 'User does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Removed chat cannot be updated.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      console.log(ability.can(Actions.UPDATE, Chat));

      if (!ability.can(Actions.UPDATE, Chat)) {
        const message = 'User does not have permission to update chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      const chatToUpdate = {
        ...chat,
        users: [...chat.users, userToAdd],
      };

      const userToChat = {
        userId: userToAdd.id,
        chatId: chat.id,
        userRole: UserRole.MEMBER,
      };

      await this.chatService.saveChat(chatToUpdate);

      await this.userToChatRepository.save(userToChat);

      const updatedChat = await this.chatService.getById(chatToUpdate.id);

      Logger.log(`Successfully updated the chat with id: ${updatedChat.id}`);
      return { data: updatedChat };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Delete(':chatId')
  async removeChat(@Request() req, @Param('chatId') chatId: string) {
    try {
      const userId = req.user.id;

      const chat = await this.chatService.getById(chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      if (!canUserManageChat({ userId, chat, operation: Actions.REMOVE })) {
        const message = 'User does not have permission to remove chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      await this.chatService.updateChat({ ...chat, status: Status.REMOVED });

      const successMessage = `Successfully removed the chat with id: ${chatId}`;
      Logger.log(successMessage);
      return { message: successMessage };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch(':chatId')
  async updateChat(
    @Request() req,
    @Param('chatId') chatId: string,
    @Body() chatInfo: Partial<Chat>,
  ) {
    try {
      const userId = req.user.id;

      const chat = await this.chatService.getById(chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Removed chat cannot be updated.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      if (!canUserManageChat({ userId, chat, operation: Actions.UPDATE })) {
        const message = 'User does not have permission to update chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      await this.chatService.updateChat(chatInfo);
      const updatedChat = await this.chatService.getById(chatId);

      Logger.log(`Successfully updated the chat with id: ${updatedChat.id}`);
      return { data: updatedChat };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
