import request from 'supertest';
import { app } from '../../src/app.js'; // Asegúrate de que la ruta sea correcta
import { UserModel } from '../../src/repository/user.m.model.js';
import { FilmModel } from '../../src/repository/film.m.model.js';
import jwt from 'jsonwebtoken';

const testUser = {
  userName: 'testUser',
  email: 'test@example.com',
  password: 'password123',
};

const testFilm = {
  title: 'Test Film',
  release: '2024-01-01',
  genre: 'Drama',
  synopsis: 'A test film for testing purposes.',
  poster: {
    urlOriginal: 'http://example.com/original.jpg',
    url: 'http://example.com/poster.jpg',
    mimetype: 'image/jpeg',
    size: 12345,
  },
};

let token;

beforeAll(async () => {
  await UserModel.deleteMany({});
  await FilmModel.deleteMany({});

  const user = await UserModel.create(testUser);

  // Generar un token de JWT para simular autenticación
  token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await UserModel.deleteMany({});
  await FilmModel.deleteMany({});
});

describe('Film API Endpoints', () => {
  it('should create a new film', async () => {
    const response = await request(app)
      .post('/film')
      .set('Authorization', `Bearer ${token}`)
      .send(testFilm);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(testFilm.title);
  });

  it('should get all films', async () => {
    const response = await request(app).get('/film');

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1); // Debería haber una película
  });

  it('should get a film by id', async () => {
    const film = await FilmModel.findOne(testFilm);
    const response = await request(app).get(`/film/${film.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(testFilm.title);
  });

  it('should update a film by id', async () => {
    const film = await FilmModel.findOne(testFilm);
    const updatedFilm = { ...testFilm, title: 'Updated Test Film' };
    const response = await request(app)
      .patch(`/film/${film.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedFilm);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Test Film');
  });

  it('should delete a film by id', async () => {
    const film = await FilmModel.findOne(testFilm);
    const response = await request(app)
      .delete(`/film/${film.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});
