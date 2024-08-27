import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { scrypt as _scrypt } from 'crypto';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // Check email in use
    const user = await this.usersService.find(email);

    if (user.length > 0) {
      throw new BadRequestException('Email already in use');
    }
    // Hash password
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = hash.toString('hex') + '.' + salt;
    // Create user and save it
    const newUser = await this.usersService.create(email, hashedPassword);
    // Return user
    return newUser;
  }

  async signin(email: string, password: string) {
    // Check if user exists
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
    // Split hashed password and salt
    const [hashedDbPassword, salt] = user.password.split('.');
    // Hash provided password
    const hashProvidedPassword = (await scrypt(password, salt, 32)) as Buffer;
    // Compare hashed passwords
    if (hashedDbPassword !== hashProvidedPassword.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }
    // Return user
    return user;
  }
}
