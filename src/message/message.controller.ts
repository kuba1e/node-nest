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
  Query,
  Request,
} from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { Status } from 'src/types/chat';
import { MessageService } from './message.service';
import { SQS_MESSAGE_TYPE } from 'src/types/sqs';
import { Message } from './message.entity';
import { sendMessageToQueue } from 'src/services/sqs';

@Controller('/secure/messages')
export class MessageController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}
  @Get('/:chatId')
  async getByChatId(
    @Request() req,
    @Param('chatId') chatId: string,
    @Query()
    query: {
      offset: number;
      pageSize: number;
    },
  ) {
    try {
      const { offset = 0, pageSize = 20 } = query;
      const userId = req.user.id;

      const chat = await this.chatService.getById(chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Messages cannot be read from the removed chat.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userJoinedChat = chat.users.find((user) => user.id === userId);

      if (!userJoinedChat) {
        const message = 'User is not invited to the chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      const skip = Number(offset) * Number(pageSize);
      const take = Number(pageSize);

      const messages = await this.messageService.getBy({
        where: {
          chatId,
          status: Status.ACTIVE,
        },
        order: {
          createdAt: 'ASC',
        },
        skip,
        take,
        cache: true,
      });

      Logger.log(`Successfully found messages for chat with id: ${chatId}`);
      return { data: messages };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Post('/:chatId')
  async createMessage(
    @Request() req,
    @Param('chatId')
    chatId: string,
    @Body()
    body: {
      text: string;
    },
  ) {
    try {
      const { text } = body;
      const userId = req.user.id;

      const chat = await this.chatService.getById(chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Message cannot be forwarded to the removed chat.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userJoinedChat = chat.users.find((user) => user.id === userId);

      if (!userJoinedChat) {
        const message = 'User is not invited to the chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      const message = {
        text,
        creatorId: userId,
        chatId: chat.id,
        readBy: [userId],
      };

      const savedMessage = await this.messageService.create(message);

      const queueMessage = {
        type: SQS_MESSAGE_TYPE.NEW_MESSAGE,
        payload: savedMessage,
      };

      sendMessageToQueue(JSON.stringify(queueMessage));

      Logger.log(`Successfully saved message for chat with id: ${chatId}`);

      return {
        data: savedMessage,
      };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('/:messageId')
  async update(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() body: Partial<Message>,
  ) {
    try {
      const messageToUpdate = body;
      const userId = req.user.id;

      const message = await this.messageService.getOneBy({
        where: { id: messageId },
      });

      if (!message) {
        const message = 'Message does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const chat = await this.chatService.getById(message.chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Message cannot be updated in the removed chat.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userJoinedChat = chat.users.find((user) => user.id === userId);

      if (!userJoinedChat) {
        const message = 'User is not invited to the chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      await this.messageService.update(messageId, messageToUpdate);

      const updatedMessage = await this.messageService.getOneBy({
        where: { id: messageId },
      });
      Logger.log(
        `Successfully updated the message with id: ${updatedMessage.id}`,
      );
      return updatedMessage;
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Delete('/:messageId')
  async delete(@Request() req, @Param('messageId') messageId: string) {
    try {
      const userId = req.user.id;

      const message = await this.messageService.getOneBy({
        where: { id: messageId },
      });

      if (!message) {
        const message = 'Message does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const chat = await this.chatService.getById(message.chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Message cannot be removed from the removed chat.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userJoinedChat = chat.users.find((user) => user.id === userId);

      if (!userJoinedChat) {
        const message = 'User is not invited to the chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      await this.messageService.update(message.id, { status: Status.REMOVED });

      const successMessage = `Successfully removed the message with id: ${messageId}`;
      Logger.log(successMessage);

      return { message: successMessage };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }

  @Post('/:chatId/:messageId')
  async forward(
    @Request() req,
    @Param() params: { chatId: string; messageId: string },
  ) {
    try {
      const { messageId, chatId } = params;
      const forwardedBy = req.user.id;

      if (!forwardedBy) {
        throw new BadRequestException(
          `Required data was not provided: forwardedBy`,
        );
      }

      const chat = await this.chatService.getById(chatId);

      if (!chat) {
        const message = 'Chat does not exist.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const isChatRemoved = chat.status === Status.REMOVED;

      if (isChatRemoved) {
        const message = 'Message cannot be forwarded to the removed chat.';
        Logger.error(message);
        throw new BadRequestException(message);
      }

      const userJoinedChat = chat.users.find((user) => user.id === forwardedBy);

      if (!userJoinedChat) {
        const message = 'User is not invited to the chat.';
        Logger.error(message);
        throw new ForbiddenException(message);
      }

      const messageToForward = await this.messageService.getOneBy({
        where: { id: messageId },
      });

      const message = {
        text: messageToForward.text,
        creatorId: messageToForward.creatorId,
        status: Status.ACTIVE,
        chatId: chat.id,
        readBy: [forwardedBy],
        referenceTo: messageToForward.chatId,
        forwardedBy: forwardedBy,
      };

      const forwardedMessage = await this.messageService.create(message);
      Logger.log(`Successfully forwarded message for chat with id: ${chatId}`);

      return {
        data: forwardedMessage,
      };
    } catch (error) {
      const message = `Internal Server Error: ${error.message}`;
      Logger.error(message);
      throw new InternalServerErrorException(message);
    }
  }
}
