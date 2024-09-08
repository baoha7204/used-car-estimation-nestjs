import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a sign up request', () => {
    const email = 'test123@gmail.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'test' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });

  it('signup and get the currently logged in user', async () => {
    const email = 'test111@gmail.com';

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'test' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'test' })
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .get('/auth/self')
      .set('Cookie', res.get('Set-Cookie'))
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
