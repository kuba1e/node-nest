import { Actions } from '../types/chat';
import { AccessOptions } from '../types/settings';
import { UserRole } from '../types/user';

export const DEFAULT_CHAT_SETTINGS = {
  chatInvites: AccessOptions.ALL,
  messageForward: AccessOptions.ALL,
  phoneVisibility: AccessOptions.ALL,
};

export const USER_ROLE_TO_CHAT_PERMISSION_MAP = {
  [UserRole.ADMIN]: [
    Actions.CREATE,
    Actions.REMOVE,
    Actions.UPDATE,
    Actions.READ,
  ],
  [UserRole.MEMBER]: [Actions.READ],
};
