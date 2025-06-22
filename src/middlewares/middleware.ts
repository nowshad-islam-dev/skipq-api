import cors from 'cors';
import morgan from 'morgan';
import { RequestHandler } from 'express';

const isProd = process.env.NODE_ENV === 'production';

// CORS config
export const corseOptions: cors.CorsOptions = {
  origin: isProd ? ['https://frontend.com'] : '*', // Allow all in dev mode
  credentials: true, // Allow using cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

// Morgan config
export const morganMiddleware: RequestHandler = isProd
  ? morgan('combined') // Production logging
  : morgan('dev'); // Dev friendly logging
