import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 100),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('sign up functionality', () => {
    it('should create a new user with a salted and hashed password', async () => {
      const { password } = await service.signup('test@test.com', 'test123');
      expect(password).not.toEqual('test123');
      const [salt, hash] = password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it("should throw an error if a user signs up with an email that's in use", async () => {
      await service.signup('test@gmail.com', 'test123');
      await expect(service.signup('test@gmail.com', 'test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('sign in functionality', () => {
    it("should throw an error if a user signs in with an email that doesn't exist", async () => {
      await expect(service.signin('test@gmail.com', 'test')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if a user signs in with an invalid password', async () => {
      await service.signup('test@gmail.com', 'test123');
      await expect(service.signup('test@gmail.com', 'test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a user if the correct password is provided', async () => {
      await service.signup('test@gmail.com', 'test');
      const user = await service.signin('test@gmail.com', 'test');
      expect(user).toBeDefined();
    });
  });
});
