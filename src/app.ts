import express from 'express';
import prisma from './prisma';
import cors from 'cors';
import { corseOptions, morganMiddleware } from './middlewares/middleware';

const app = express();
app.use(express.json());

// Middleware
app.use(cors(corseOptions));
app.use(morganMiddleware);

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, username, password },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'User creation failed', details: error });
  }
});

export default app;
