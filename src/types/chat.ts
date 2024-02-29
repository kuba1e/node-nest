import { Chat } from '../chat/chat.entity';

export enum Status {
  REMOVED = 0,
  ACTIVE = 1,
}

export enum ChatType {
  PUBLIC = 1,
  PRIVATE = 2,
}

export enum ChatOperations {
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'remove',
  READ = 'read',
}

export type ChatResponse = Omit<Chat, 'userToChats'>;
