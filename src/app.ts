import express from 'express';
import cors from 'cors';
import { corseOptions, morganMiddleware } from './middlewares/middleware';
import userRouter from './routes/user.route';
const app = express();
app.use(express.json());

// Middlewares
app.use(cors(corseOptions));
app.use(morganMiddleware);

// Route Middlewares
app.use('/api/users', userRouter);

export default app;
