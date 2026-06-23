<<<<<<< HEAD
import './preload';
import express from 'express';
import cors from 'cors';
=======
import express, { Request, Response } from 'express'
import cors from 'cors'
>>>>>>> 7ee8e54 (feat(added supabase as database): added supabase with configurations for ssr)
import { startServer } from './server';
import { clerkMiddleware } from '@clerk/express';
import healthRouter from './routes/api/health';
import usersRouter from './routes/api/users';

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
app.use(clerkMiddleware());

app.use('/api/health', healthRouter);
app.use('/api/users', usersRouter);
=======
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', runtime: 'express' });
});
>>>>>>> 7ee8e54 (feat(added supabase as database): added supabase with configurations for ssr)

startServer().then((port) => {
  app.listen(port, () => {
    console.log(
      `info. API backend actively listening on http://localhost:${port}`
    );
  });
});