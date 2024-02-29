import { User } from 'src/user/user.entity';
import { ChatOperations } from '../../types/chat';
import { getUserRoleInChat } from './getUserRoleInChat';
import { Chat } from 'src/chat/chat.entity';
import { USER_ROLE_TO_CHAT_PERMISSION_MAP } from 'src/constants/chat';

export function canUserManageChat({
  userId,
  chat,
  operation,
}: {
  userId: User['id'];
  chat: Chat;
  operation: ChatOperations;
}) {
  // const isUserCreator = chat.creatorId === userId;
  // const userRoleInChat = getUserRoleInChat(userId, chat);
  // const allowedOperations = USER_ROLE_TO_CHAT_PERMISSION_MAP[userRoleInChat];
  // const userHasPermission = allowedOperations.includes(operation);
  // return isUserCreator || userHasPermission;
  return true;
}
