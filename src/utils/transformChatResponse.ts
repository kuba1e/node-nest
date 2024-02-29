import { Chat } from 'src/chat/chat.entity';

export function transformChatResponse(chat: Chat) {
  // const users = chat.users.map((user) => {
  //   const roleToChat = chat.userToChats.find(
  //     ({ userId }) => userId === user.id,
  //   );
  //   return {
  //     ...user,
  //     userRole: roleToChat.userRole,
  //   };
  // });
  // const { userToChats, ...chatInfo } = chat;
  // return { ...chatInfo, users };
  return chat;
}
