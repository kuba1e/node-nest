import { ChatOperations } from '../types/chat';
import { AccessOptions } from '../types/settings';
import { UserRole } from '../types/user';

export const DEFAULT_CHAT_SETTINGS = {
  chatInvites: AccessOptions.ALL,
  messageForward: AccessOptions.ALL,
  phoneVisibility: AccessOptions.ALL,
};

export const USER_ROLE_TO_CHAT_PERMISSION_MAP = {
  [UserRole.ADMIN]: [
    ChatOperations.CREATE,
    ChatOperations.REMOVE,
    ChatOperations.UPDATE,
    ChatOperations.READ,
  ],
  [UserRole.MEMBER]: [ChatOperations.READ],
};
