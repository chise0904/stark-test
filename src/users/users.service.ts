import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    // 檢查email是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    return user;
  }

  async findOne(email: string): Promise<User> {
    // 檢查email是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!existingUser) {
      throw new ConflictException('Email not exists');
    }

    return existingUser;
  }

  async findOneById(id: number): Promise<User> {
    // 檢查email是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['teams'],
    });

    if (!existingUser) {
      throw new ConflictException('Email not exists');
    }

    return existingUser;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
