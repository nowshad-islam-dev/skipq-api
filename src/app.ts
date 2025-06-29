import express from 'express';
import cors from 'cors';
import { corseOptions, morganMiddleware } from './middlewares';
import userRouter from './routes/user.route';
import serviceRouter from './routes/service.route';
const app = express();
app.use(express.json());

// Middlewares
app.use(cors(corseOptions));
app.use(morganMiddleware);

// Route Middlewares
app.use('/api/users', userRouter);
app.use('/api/services', serviceRouter);

export default app;
