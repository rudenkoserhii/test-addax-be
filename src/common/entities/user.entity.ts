/* eslint-disable import/no-cycle */
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { ChatMessageReader } from 'src/common/entities/chatMessageReader.entity';

import { Chat } from './chat.entity';
import { ChatMessageLike } from './chatMessageLike.entity';
import { Content } from './content.entity';
import { ContentStatus } from './contentStatus.entity';
import { CoreEntity } from './core.entity';
import { Message } from './message.entity';
import { NotificationToUser } from './notificationToUser';

@Entity()
export class User extends CoreEntity {
  @Column({ type: 'varchar', name: 'email', default: '' })
  email: string;

  @Column({ type: 'varchar', name: 'contactEmail', default: '' })
  contactEmail: string;

  @Column({ type: 'varchar', name: 'password', default: '' })
  password: string;

  @Column({ type: 'boolean', name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', name: 'is_newbie', default: true })
  isNewbie: boolean;

  @Column({ type: 'varchar', name: 'verification_code', default: '' })
  verificationCode: string;

  @Column({ type: 'varchar', name: 'firstName', default: null })
  firstName: string;

  @Column({ type: 'varchar', name: 'lastName', default: null })
  lastName: string;

  @Column({ type: 'varchar', name: 'role', default: null })
  role: string;

  @Column({ type: 'varchar', name: 'gender', default: null })
  gender: string;

  @Column({ type: 'varchar', name: 'dateOfBirth', default: null })
  dateOfBirth: string;

  @Column({ type: 'varchar', name: 'nationality', default: null })
  nationality: string;

  @Column({ type: 'varchar', name: 'identity', default: null })
  identity: string;

  @Column({ type: 'varchar', name: 'status', default: null })
  status: string;

  @Column({ type: 'varchar', name: 'street', default: null })
  street: string;

  @Column({ type: 'varchar', name: 'city', default: null })
  city: string;

  @Column({ type: 'varchar', name: 'state', default: null })
  state: string;

  @Column({ type: 'varchar', name: 'zip', default: null })
  zip: string;

  @Column({ type: 'varchar', name: 'country', default: null })
  country: string;

  @Column({ type: 'varchar', name: 'phone', default: null })
  phone: string;

  @Column({ type: 'varchar', name: 'userDocumentUrl', default: null })
  userDocumentUrl: string;

  @Column({ type: 'varchar', name: 'userDocumentPublicId', default: null })
  userDocumentPublicId: string;

  @Column({ type: 'varchar', name: 'avatarUrl', default: null })
  avatarUrl: string;

  @Column({ type: 'varchar', name: 'avatarPublicId', default: null })
  avatarPublicId: string;

  @Column({ type: 'varchar', name: 'qobrixContactId', default: null })
  qobrixContactId: string;

  @Column({ type: 'varchar', name: 'qobrixAgentId', default: null })
  qobrixAgentId: string;

  @Column({ type: 'varchar', name: 'qobrixUserId', default: null })
  qobrixUserId: string;

  @Column({ type: 'varchar', name: 'agencyName', default: null })
  agencyName: string;

  @Column({ type: 'text', name: 'description', default: null })
  description: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  isDeleted: boolean;

  @Column({ type: 'boolean', name: 'receiveNotifications', default: true })
  receiveNotifications: boolean;

  @OneToMany(() => Message, (message) => message.owner)
  messages: Message[];

  @OneToMany(() => Chat, (chat) => chat.owner)
  chats: Chat[];

  @OneToMany(
    () => NotificationToUser,
    (notificationToUser) => notificationToUser.user,
    {
      cascade: ['insert', 'update', 'recover', 'remove'],
    },
  )
  notifications: NotificationToUser[];

  @ManyToMany(() => Chat, (chat) => chat.members)
  joinedChats: Chat[];

  @ManyToMany(() => Content, (content) => content.users)
  contents: Content[];

  @OneToMany(() => ContentStatus, (contentStatus) => contentStatus.user)
  contentStatuses: ContentStatus[];

  @OneToMany(() => ChatMessageReader, (reader) => reader.user)
  readMessages: ChatMessageReader[];

  @OneToMany(() => ChatMessageLike, (like) => like.user)
  likeMessages: ChatMessageLike[];
}
