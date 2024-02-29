import { User } from '../user/user.entity';

export enum UserRole {
  ADMIN = 1,
  MEMBER = 2,
}

export type ChatUser = User & { userRole: UserRole };
