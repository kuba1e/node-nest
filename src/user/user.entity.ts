import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Settings } from './settings.entity';
import { Chat } from '../chat/chat.entity';
import { IsEmail } from 'class-validator';
import { Token } from './token.entity';
import { UserToChat } from './userToChat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  @IsEmail()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nickname: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  avatar: string;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable()
  chats: Chat[];

  @OneToOne(() => Settings, (settings) => settings.user)
  @JoinColumn()
  settings: Settings;

  @OneToOne(() => Token, (token) => token.user)
  @JoinColumn()
  token: Token;

  @OneToMany(() => UserToChat, (userToChat) => userToChat.user)
  userToChats: Array<UserToChat>;
}
