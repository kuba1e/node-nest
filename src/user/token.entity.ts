import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.token)
  @JoinColumn()
  user: User;
}
