/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CoreEntity } from './core.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity()
export class Chat extends CoreEntity {
  @Column()
  title: string;

  @Column({ type: 'boolean', name: 'is_private', default: false })
  isPrivate: boolean;

  @OneToMany(() => Message, (message) => message.chat, { onDelete: 'CASCADE' })
  messages: Message[];

  @ManyToOne(() => User, (user) => user.chats, {
    eager: true,
  })
  owner: User;

  @ManyToMany(() => User, (user) => user.joinedChats, {
    eager: true,
  })
  @JoinTable()
  members: User[];
}
