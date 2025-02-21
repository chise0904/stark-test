import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { CreateUserDto, CreateUserRespDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserJwtResponse } from './interface/user-jwt.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UsersService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;


    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the password with the salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const hashedPassword = salt + '.' + hash.toString('hex');

    await this.userService.create({
      username,
      email,
      password: hashedPassword,
      salt,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);
    if (user) {
      const [salt, hashedPassword] = user.password.split('.');

      const controlHashedPassword = (await scrypt(password, salt, 32)) as Buffer;
      if (hashedPassword === controlHashedPassword.toString('hex')) {
        return user;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    // const payload = { user };
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const { id, username } = user;

    const signInResponse: UserJwtResponse = { user: { id, email, username }, accessToken };

    return signInResponse;
  }
}
