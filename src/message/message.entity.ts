import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '../chat/chat.entity';
import { Status } from '../types/chat';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  text: string;

  @Column()
  creatorId: string;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column('simple-array')
  readBy: Array<string>;

  @Column({ nullable: true })
  referenceTo: string;

  @Column({ nullable: true })
  forwardedBy: string;
}
