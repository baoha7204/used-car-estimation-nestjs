import { User } from 'src/users/users.entity';

type AppRequest = Request & {
  currentUser?: Partial<User>;
  session: {
    userId?: number;
  };
};

export { AppRequest };
