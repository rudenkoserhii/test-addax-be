import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as argon2 from 'argon2';
import { Repository, UpdateResult, In } from 'typeorm';

import { ChatsByUserDto } from 'modules/chat/dto/chats-by-user.dto';
import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';
import { HTTPService } from 'modules/http/http.service';
import { Chat } from 'src/common/entities/chat.entity';
import { User } from 'src/common/entities/user.entity';
import { Message } from 'src/common/entities/message.entity';
import {
  UserAuthResponse,
  UserInfoResponse,
  UserSetAvatarResponse,
} from 'src/common/types';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteAvatarDto } from './dto/delete-avatar.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
    private httpService: HTTPService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserAuthResponse> {
    try {
      const userExistsInCRMSystem =
        await this.httpService.checkUserExistsByUsername(createUserDto.email);
      if (userExistsInCRMSystem) {
        throw new BadRequestException(
          'This email has already been used for registration. Please use another email.',
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (existingUser) {
        throw new BadRequestException('This email already exists');
      }

      const user = await this.userRepository.save({
        email: createUserDto.email,
        password: await argon2.hash(createUserDto.password),
        isDeleted: false,
        receiveNotifications: true,
      });

      const token = this.jwtService.sign({ email: user.email, id: user.id });
      return {
        user: {
          email: user.email,
          contactEmail: user.contactEmail || user.email,
          id: user.id,
          isVerified: user.isVerified,
          isDeleted: user.isDeleted,
          receiveNotifications: user.receiveNotifications,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException('Not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<User[] | []> {
    try {
      const data = await this.userRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
      if (!data) {
        throw new NotFoundException('Not found');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findAllByEmail(email: string): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  async findAllByIds(ids: string[]): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: {
          id: In(ids),
        },
      });
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  async findLatestActiveUserByEmail(email: string): Promise<User> {
    try {
      const users = await this.userRepository.find({
        where: { email },
        order: { createdAt: 'DESC' },
      });

      const activeUser = users.find((user) => !user.isDeleted);
      if (!activeUser) {
        throw new Error('Active user not found');
      }
      return activeUser;
    } catch (error) {
      throw error;
    }
  }

  async updateById(id: string, data: Partial<User>): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      return await this.userRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async updateByEmail(
    email: string,
    data: Partial<User>,
  ): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return await this.userRepository.update({ id: user.id }, data);
    } catch (error) {
      throw new Error('Failed to update user by email');
    }
  }

  anonymizeUser(user: User): Partial<User> {
    return {
      ...user,
      email: '',
      contactEmail: '',
      password: '',
      firstName: 'Deleted',
      lastName: 'User',
      isVerified: false,
      verificationCode: '',
      role: null,
      gender: null,
      dateOfBirth: null,
      nationality: null,
      identity: null,
      status: null,
      street: null,
      city: null,
      state: null,
      zip: null,
      country: null,
      phone: null,
      userDocumentUrl: null,
      userDocumentPublicId: null,
      avatarUrl: null,
      avatarPublicId: null,
      qobrixContactId: null,
      qobrixAgentId: null,
      qobrixUserId: null,
      agencyName: null,
      description: null,
      receiveNotifications: false,
      isDeleted: true,
    };
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User not found in delete ${id}`);
      }

      const anonymizedUserData = this.anonymizeUser(user);
      await this.userRepository.update(id, anonymizedUserData);

      await this.messageRepository.update(
        { owner: { id: user.id } },
        { content: '' },
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found in deleteAccount ${id}`);
      }

      const { qobrixAgentId, qobrixContactId, qobrixUserId } = user;
      await this.httpService.deleteAllOpportunities(
        'ContactNameContacts',
        qobrixContactId,
      );
      await this.httpService.deleteAllProperties(
        'CreatedByUsers',
        qobrixUserId,
      );
      await this.httpService.deleteAgentFromCRM(qobrixAgentId);
      await this.httpService.deleteUserFromCRM(qobrixUserId);
      await this.httpService.deleteContactFromCRM(qobrixContactId);
      await this.delete(id);

      throw new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async updateUserData(userData: UpdateUserDto): Promise<UserInfoResponse> {
    try {
      const { userId, ...updatedFields } = userData;
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(
          `User not found in update user data ${userId}`,
        );
      }

      await this.userRepository.update(userId, updatedFields);

      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw error;
    }
  }

  async setAvatar(
    file: Express.Multer.File,
    data: SetAvatarDto,
  ): Promise<UserSetAvatarResponse> {
    const { userId, avatarPublicId: oldAvatarPublicId } = data;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (oldAvatarPublicId)
        await this.cloudinaryService.deleteImage(oldAvatarPublicId);

      const upoadedAvatarData = await this.cloudinaryService.upload(file);
      if (!upoadedAvatarData) {
        throw new BadRequestException('Error uploading the file to the server');
      }

      const { fileUrl: avatarUrl, filePublicId: avatarPublicId } =
        upoadedAvatarData;
      await this.userRepository.update(userId, { avatarUrl, avatarPublicId });

      return { avatarUrl, avatarPublicId };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAvatar(data: DeleteAvatarDto): Promise<void> {
    const { userId, avatarPublicId: avatarId } = data;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) throw new NotFoundException('User not found');

      await this.cloudinaryService.deleteImage(avatarId);

      const avatarUrl = null;
      const avatarPublicId = null;
      await this.userRepository.update(userId, { avatarUrl, avatarPublicId });

      throw new HttpException('Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUser(id: string): Promise<Chat[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { joinedChats: true },
      });

      return user.joinedChats;
    } catch (error) {
      throw error;
    }
  }

  async getChatsByUserWithMessages(
    data: ChatsByUserDto,
    userId: string,
  ): Promise<Chat[]> {
    try {
      const chats = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.messages', 'message')
        .leftJoinAndSelect('chat.members', 'members')
        .leftJoinAndSelect('message.owner', 'owner')
        .where('members.id = :userId', { userId })
        .leftJoinAndSelect('chat.members', 'allMembers')
        .getMany();

      if (!chats) throw new NotFoundException('Chats not found');

      return chats;
    } catch (error) {
      throw error;
    }
  }

  async verifyAndDeleteUserIfNeeded(user: User): Promise<void> {
    if (user.qobrixContactId || user.qobrixAgentId || user.qobrixUserId) {
      const contactExists = await this.httpService.checkContactExistsInCRM(
        user.qobrixContactId,
      );
      const agentExists = await this.httpService.checkAgentExistsInCRM(
        user.qobrixAgentId,
      );
      const userExists = await this.httpService.checkUserExistsInCRM(
        user.qobrixUserId,
      );

      if (!contactExists || !agentExists || !userExists) {
        await this.deleteAccount(user.id);
      }
    }
  }

  async getSynchronizedUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { isDeleted: false },
        order: {
          createdAt: 'DESC',
        },
      });
      if (!users) {
        throw new NotFoundException('Not found');
      }

      const processedUserIds = [];

      const promises = users.map(async (user) => {
        if (
          (!user.qobrixContactId ||
            !user.qobrixAgentId ||
            !user.qobrixUserId) &&
          user.id
        ) {
          await this.deleteAccount(user.id);
        }
        const contactExists = await this.httpService.checkContactExistsInCRM(
          user.qobrixContactId,
        );

        const agentExists = await this.httpService.checkAgentExistsInCRM(
          user.qobrixAgentId,
        );

        const userExists = await this.httpService.checkUserExistsInCRM(
          user.qobrixUserId,
        );

        if (!contactExists || !agentExists || !userExists) {
          await this.deleteAccount(user.id);
        } else {
          processedUserIds.push(user.id);
        }
      });

      await Promise.allSettled(promises);

      const res = await this.userRepository.find({
        where: { id: In(processedUserIds) },
        order: {
          createdAt: 'DESC',
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }
}
