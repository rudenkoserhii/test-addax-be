/* eslint-disable import/no-cycle */
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Chat } from './chat.entity';
import { ChatMessageLike } from './chatMessageLike.entity';
import { ChatMessageReader } from './chatMessageReader.entity';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

@Entity()
export class Message extends CoreEntity {
  @Column()
  content: string;

  @OneToMany(() => ChatMessageReader, (reader) => reader.message, {
    cascade: ['insert', 'update', 'recover', 'remove'],
    eager: true,
  })
  readers: ChatMessageReader[];

  @OneToMany(() => ChatMessageLike, (like) => like.message, {
    cascade: ['insert', 'update', 'recover', 'remove'],
    eager: true,
  })
  likes: ChatMessageLike[];

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  owner: User;
}
