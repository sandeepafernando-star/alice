import express from 'express'
import cors from 'cors'
import { startServer } from './server';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', runtime: 'express' });
});

startServer().then((port) => {
    app.listen(port, () => {
        console.log(`info. API backend actively listening on http://localhost:${port}`);
    });
});